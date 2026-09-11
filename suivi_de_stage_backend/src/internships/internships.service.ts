import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { Student } from '../students/entities/student.entity';
import { Role } from '../users/enums/role.enum';
import { Supervisor } from '../supervisors/entities/supervisor.entity';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { FindInternshipsDto } from './dto/find-internships.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';
import { Internship } from './entities/internship.entity';
import { InternshipStatus } from './enums/internship-status.enum';
import { NotificationsService } from '../notifications/notifications.service';

interface AuthenticatedUser {
  id: string;
  role: Role;
}

@Injectable()
export class InternshipsService {
  constructor(
    @InjectRepository(Internship)
    private readonly internshipsRepository: Repository<Internship>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(Supervisor)
    private readonly supervisorsRepository: Repository<Supervisor>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateInternshipDto, actor: AuthenticatedUser) {
    this.ensureAdmin(actor);
    this.ensureDateOrder(dto.dateDebut, dto.dateFin);
    const student = await this.findStudent(dto.studentId);
    const company = await this.findCompany(dto.companyId);
    const supervisor = await this.findSupervisor(dto.supervisorId);
    const internship = this.internshipsRepository.create({
      ...dto,
      student,
      company,
      supervisor,
    });
    const savedInternship = await this.saveAndSerialize(internship);
    await this.notificationsService.notifyStageAssigned(internship);
    return savedInternship;
  }

  async findAll(dto: FindInternshipsDto, actor: AuthenticatedUser) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const query = this.internshipsRepository
      .createQueryBuilder('internship')
      .innerJoinAndSelect('internship.student', 'student')
      .innerJoinAndSelect('student.user', 'studentUser')
      .innerJoinAndSelect('internship.company', 'company')
      .innerJoinAndSelect('internship.supervisor', 'supervisor');

    this.applyAccessScope(query, actor);
    if (dto.studentId)
      query.andWhere('internship.studentId = :studentId', {
        studentId: dto.studentId,
      });
    if (dto.companyId)
      query.andWhere('internship.companyId = :companyId', {
        companyId: dto.companyId,
      });
    if (dto.supervisorId)
      query.andWhere('internship.supervisorId = :supervisorId', {
        supervisorId: dto.supervisorId,
      });
    if (dto.statut)
      query.andWhere('internship.statut = :statut', { statut: dto.statut });
    if (dto.ville)
      query.andWhere('LOWER(internship.ville) = LOWER(:ville)', {
        ville: dto.ville,
      });
    if (dto.domaine)
      query.andWhere('LOWER(internship.domaine) LIKE LOWER(:domaine)', {
        domaine: `%${dto.domaine}%`,
      });
    if (dto.search) {
      query.andWhere(
        '(LOWER(internship.intitule) LIKE LOWER(:search) OR LOWER(internship.domaine) LIKE LOWER(:search) OR LOWER(internship.ville) LIKE LOWER(:search) OR LOWER(company.nom) LIKE LOWER(:search) OR LOWER(student.matricule) LIKE LOWER(:search))',
        { search: `%${dto.search}%` },
      );
    }

    const [internships, total] = await query
      .orderBy('internship.dateDebut', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: internships.map((internship) =>
        this.toPublicInternship(internship),
      ),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, actor: AuthenticatedUser) {
    const internship = await this.findEntity(id);
    this.ensureCanAccess(internship, actor);
    return this.toPublicInternship(internship);
  }

  async update(id: string, dto: UpdateInternshipDto, actor: AuthenticatedUser) {
    const internship = await this.findEntity(id);
    this.ensureCanAccess(internship, actor);
    const previousStatus = internship.statut;
    const previousAssignment = `${internship.studentId}:${internship.companyId}:${internship.supervisorId}`;

    if (actor.role === Role.ADMINISTRATEUR) {
      if (dto.dateDebut || dto.dateFin) {
        this.ensureDateOrder(
          dto.dateDebut ?? internship.dateDebut,
          dto.dateFin ?? internship.dateFin,
        );
      }
      if (dto.studentId)
        internship.student = await this.findStudent(dto.studentId);
      if (dto.companyId)
        internship.company = await this.findCompany(dto.companyId);
      if (dto.supervisorId)
        internship.supervisor = await this.findSupervisor(dto.supervisorId);
      Object.assign(internship, dto);
      const savedInternship = await this.saveAndSerialize(internship);
      await this.notificationsService.notifyStageModified(internship);
      const currentAssignment = `${internship.studentId}:${internship.companyId}:${internship.supervisorId}`;
      if (previousAssignment !== currentAssignment) {
        await this.notificationsService.notifyStageAssigned(internship);
      }
      if (
        previousStatus !== InternshipStatus.TERMINE &&
        internship.statut === InternshipStatus.TERMINE
      ) {
        await this.notificationsService.notifyStageFinished(internship);
      }
      return savedInternship;
    }

    if (actor.role === Role.ETUDIANT) {
      throw new ForbiddenException(
        'Un étudiant ne peut pas modifier un stage.',
      );
    }
    const keys = Object.keys(dto);
    if (keys.some((key) => key !== 'observations')) {
      throw new ForbiddenException(
        'Seul le champ observations peut être modifié.',
      );
    }
    internship.observations = dto.observations ?? internship.observations;
    const savedInternship = await this.saveAndSerialize(internship);
    await this.notificationsService.notifyStageModified(internship);
    return savedInternship;
  }

  async remove(id: string, actor: AuthenticatedUser) {
    this.ensureAdmin(actor);
    const internship = await this.findEntity(id);
    await this.internshipsRepository.softRemove(internship);
    return { message: 'Stage supprimé logiquement avec succès.' };
  }

  private applyAccessScope(
    query: ReturnType<Repository<Internship>['createQueryBuilder']>,
    actor: AuthenticatedUser,
  ) {
    if (actor.role === Role.ETUDIANT) {
      query.andWhere('studentUser.id = :actorId', { actorId: actor.id });
    } else if (actor.role === Role.ENTREPRISE) {
      query.andWhere('company.userId = :actorId', { actorId: actor.id });
    } else if (actor.role === Role.ENCADREUR) {
      query.andWhere('supervisor.userId = :actorId', { actorId: actor.id });
    } else if (actor.role !== Role.ADMINISTRATEUR) {
      query.andWhere('1 = 0');
    }
  }

  private async findEntity(id: string) {
    const internship = await this.internshipsRepository.findOne({
      where: { id },
      relations: {
        student: { user: true },
        company: { user: true },
        supervisor: { user: true },
      },
    });
    if (!internship) throw new NotFoundException('Stage introuvable.');
    return internship;
  }

  private async findStudent(id: string) {
    const student = await this.studentsRepository.findOne({
      where: { id, dateSuppression: undefined },
    });
    if (!student) throw new NotFoundException('Étudiant introuvable.');
    return student;
  }

  private async findCompany(id: string) {
    const company = await this.companiesRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!company) throw new NotFoundException('Entreprise introuvable.');
    return company;
  }

  private async findSupervisor(id: string) {
    const supervisor = await this.supervisorsRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!supervisor) throw new NotFoundException('Encadreur introuvable.');
    return supervisor;
  }

  private ensureDateOrder(dateDebut: string, dateFin: string) {
    if (dateFin < dateDebut)
      throw new ForbiddenException(
        'La date de fin doit être postérieure à la date de début.',
      );
  }

  private ensureAdmin(actor: AuthenticatedUser) {
    if (actor.role !== Role.ADMINISTRATEUR)
      throw new ForbiddenException(
        'Seul un administrateur peut effectuer cette action.',
      );
  }

  private ensureCanAccess(internship: Internship, actor: AuthenticatedUser) {
    const allowed =
      actor.role === Role.ADMINISTRATEUR ||
      (actor.role === Role.ETUDIANT &&
        internship.student.user?.id === actor.id) ||
      (actor.role === Role.ENTREPRISE &&
        internship.company.user?.id === actor.id) ||
      (actor.role === Role.ENCADREUR &&
        internship.supervisor.user?.id === actor.id);
    if (!allowed)
      throw new ForbiddenException('Vous ne pouvez pas accéder à ce stage.');
  }

  private async saveAndSerialize(internship: Internship) {
    try {
      return this.toPublicInternship(
        await this.internshipsRepository.save(internship),
      );
    } catch (error) {
      const driverError = (error as QueryFailedError).driverError as
        { code?: string } | undefined;
      if (error instanceof QueryFailedError && driverError?.code === '23505') {
        throw new ConflictException('Ce stage existe déjà.');
      }
      throw error;
    }
  }

  private toPublicInternship(internship: Internship) {
    return {
      id: internship.id,
      student: internship.student
        ? {
            id: internship.student.id,
            matricule: internship.student.matricule,
            user: internship.student.user
              ? {
                  id: internship.student.user.id,
                  nom: internship.student.user.nom,
                  prenom: internship.student.user.prenom,
                }
              : undefined,
          }
        : undefined,
      company: internship.company
        ? {
            id: internship.company.id,
            nom: internship.company.nom,
            ville: internship.company.ville,
          }
        : undefined,
      supervisor: internship.supervisor
        ? {
            id: internship.supervisor.id,
            fonction: internship.supervisor.fonction,
            specialite: internship.supervisor.specialite,
          }
        : undefined,
      intitule: internship.intitule,
      description: internship.description,
      domaine: internship.domaine,
      lieu: internship.lieu,
      ville: internship.ville,
      latitude: internship.latitude,
      longitude: internship.longitude,
      dateDebut: internship.dateDebut,
      dateFin: internship.dateFin,
      statut: internship.statut,
      observations: internship.observations,
      dateCreation: internship.dateCreation,
      dateModification: internship.dateModification,
    };
  }
}
