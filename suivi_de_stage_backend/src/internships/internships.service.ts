import {
  BadRequestException,
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
import { User } from '../users/entities/user.entity';
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
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateInternshipDto, actor: AuthenticatedUser) {
    this.ensureDateOrder(dto.dateDebut, dto.dateFin);

    const studentCreates = actor.role === Role.ETUDIANT;
    let studentId: string;

    if (studentCreates) {
      const ownStudent = await this.studentsRepository.findOne({
        where: { userId: actor.id },
      });
      if (!ownStudent)
        throw new ForbiddenException('Profil étudiant introuvable.');
      studentId = ownStudent.id;
    } else {
      this.ensureAdmin(actor);
      if (!dto.studentId)
        throw new BadRequestException('Le champ studentId est obligatoire.');
      studentId = dto.studentId;
    }

    const student = await this.findStudent(studentId);
    const company = await this.findCompany(dto.companyId);
    const supervisor = dto.supervisorId
      ? await this.findSupervisor(dto.supervisorId)
      : null;
    const tuteur = dto.tuteurId ? await this.findTuteur(dto.tuteurId) : null;

    if (!supervisor && !dto.encadreurProfessionnelNom) {
      throw new BadRequestException(
        'Renseignez un encadreur professionnel (compte existant ou nom).',
      );
    }

    const statut = studentCreates
      ? InternshipStatus.EN_ATTENTE
      : (dto.statut ?? InternshipStatus.EN_ATTENTE);
    const internship = this.internshipsRepository.create({
      ...dto,
      studentId,
      student,
      company,
      supervisor,
      tuteur,
      statut,
    });
    const savedInternship = await this.saveAndSerialize(internship);
    if (studentCreates) {
      await this.notificationsService.notifyStageAwaitingValidation(internship);
      if (!supervisor) {
        await this.notificationsService.notifyStageAwaitingProfessionalSupervisor(
          internship,
        );
      }
    } else {
      await this.notificationsService.notifyStageAssigned(internship);
    }
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
      .leftJoinAndSelect('internship.supervisor', 'supervisor')
      .leftJoinAndSelect('supervisor.user', 'supervisorUser')
      .leftJoinAndSelect('internship.tuteur', 'tuteur')
      .leftJoinAndSelect('internship.reports', 'reports');

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
      if (dto.tuteurId) internship.tuteur = await this.findTuteur(dto.tuteurId);
      const adminChanges = { ...dto };
      delete adminChanges.tuteurId;
      delete adminChanges.supervisorId;
      Object.assign(internship, adminChanges);
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
      if (internship.statut !== InternshipStatus.EN_ATTENTE) {
        throw new ForbiddenException(
          'Un stage déjà validé ne peut plus être modifié.',
        );
      }
      if (dto.dateDebut || dto.dateFin) {
        this.ensureDateOrder(
          dto.dateDebut ?? internship.dateDebut,
          dto.dateFin ?? internship.dateFin,
        );
      }
      if (dto.companyId)
        internship.company = await this.findCompany(dto.companyId);
      if (dto.supervisorId)
        internship.supervisor = await this.findSupervisor(dto.supervisorId);
      const editable = { ...dto };
      delete editable.studentId;
      delete editable.companyId;
      delete editable.supervisorId;
      delete editable.tuteurId;
      delete editable.encadreurProfessionnelNom;
      delete editable.statut;
      delete editable.observations;
      Object.assign(internship, editable);
      internship.statut = InternshipStatus.EN_ATTENTE;
      const savedInternship = await this.saveAndSerialize(internship);
      await this.notificationsService.notifyStageModified(internship);
      return savedInternship;
    }

    if (
      actor.role === Role.ENCADREUR &&
      internship.statut === InternshipStatus.EN_ATTENTE &&
      dto.statut
    ) {
      if (
        dto.statut !== InternshipStatus.EN_COURS &&
        dto.statut !== InternshipStatus.REFUSE
      ) {
        throw new ForbiddenException(
          'L’encadreur ne peut que valider ou refuser un stage en attente.',
        );
      }
      internship.statut = dto.statut;
      internship.observations = dto.observations ?? internship.observations;
      const savedInternship = await this.saveAndSerialize(internship);
      await this.notificationsService.notifyStageStatusChanged(internship);
      if (internship.statut === InternshipStatus.EN_COURS) {
        await this.notificationsService.notifyStageAssigned(internship);
      }
      return savedInternship;
    }

    if (
      actor.role === Role.ENSEIGNANT &&
      internship.statut === InternshipStatus.EN_ATTENTE &&
      dto.statut
    ) {
      if (
        dto.statut !== InternshipStatus.EN_COURS &&
        dto.statut !== InternshipStatus.REFUSE
      ) {
        throw new ForbiddenException(
          'L’enseignant ne peut que valider ou refuser un stage en attente.',
        );
      }
      internship.statut = dto.statut;
      internship.observations = dto.observations ?? internship.observations;
      const savedInternship = await this.saveAndSerialize(internship);
      await this.notificationsService.notifyStageStatusChanged(internship);
      return savedInternship;
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

  async saveConvention(
    id: string,
    actor: AuthenticatedUser,
    filename: string,
    originalName: string,
  ) {
    const internship = await this.findEntity(id);
    this.ensureCanModifyConvention(internship, actor);
    internship.convention = filename;
    internship.conventionNom = originalName;
    await this.internshipsRepository.save(internship);
    return { message: 'Convention de stage enregistrée avec succès.' };
  }

  async getConventionFilename(id: string, actor: AuthenticatedUser) {
    const internship = await this.findEntity(id);
    this.ensureCanAccess(internship, actor);
    if (!internship.convention) {
      throw new NotFoundException('Aucune convention de stage déposée.');
    }
    return {
      filename: internship.convention,
      originalName: internship.conventionNom,
    };
  }

  async remove(id: string, actor: AuthenticatedUser) {
    if (actor.role === Role.ETUDIANT) {
      const internship = await this.findEntity(id);
      this.ensureCanAccess(internship, actor);
      if (internship.statut !== InternshipStatus.EN_ATTENTE) {
        throw new ForbiddenException(
          'Seul un stage en attente de validation peut être supprimé.',
        );
      }
      await this.internshipsRepository.softRemove(internship);
      return { message: 'Stage supprimé avec succès.' };
    }
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
    } else if (actor.role === Role.ENCADREUR) {
      query.andWhere('supervisor.userId = :actorId', { actorId: actor.id });
    } else if (actor.role === Role.ENSEIGNANT) {
      query.andWhere('internship.tuteurId = :actorId', { actorId: actor.id });
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
        tuteur: true,
        reports: true,
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

  private async findTuteur(id: string) {
    const tuteur = await this.usersRepository.findOne({ where: { id } });
    if (!tuteur) throw new NotFoundException('Tuteur pédagogique introuvable.');
    if (tuteur.role !== Role.ENSEIGNANT) {
      throw new BadRequestException(
        'Le tuteur pédagogique doit être un enseignant.',
      );
    }
    return tuteur;
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
      (actor.role === Role.ENCADREUR &&
        internship.supervisor?.user?.id === actor.id) ||
      (actor.role === Role.ENSEIGNANT && internship.tuteurId === actor.id);
    if (!allowed)
      throw new ForbiddenException('Vous ne pouvez pas accéder à ce stage.');
  }

  private ensureCanModifyConvention(
    internship: Internship,
    actor: AuthenticatedUser,
  ) {
    const isOwnerStudent =
      actor.role === Role.ETUDIANT && internship.student.user?.id === actor.id;
    if (actor.role !== Role.ADMINISTRATEUR && !isOwnerStudent) {
      throw new ForbiddenException(
        'Vous ne pouvez pas déposer la convention de ce stage.',
      );
    }
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
            formation: internship.student.formation,
            niveau: internship.student.niveau,
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
            user: internship.supervisor.user
              ? {
                  id: internship.supervisor.user.id,
                  nom: internship.supervisor.user.nom,
                  prenom: internship.supervisor.user.prenom,
                }
              : undefined,
          }
        : undefined,
      tuteur: internship.tuteur
        ? {
            id: internship.tuteur.id,
            nom: internship.tuteur.nom,
            prenom: internship.tuteur.prenom,
          }
        : undefined,
      encadreurProfessionnelNom: internship.encadreurProfessionnelNom,
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
      convention: internship.convention,
      conventionNom: internship.conventionNom,
      dateCreation: internship.dateCreation,
      dateModification: internship.dateModification,
      reports: (internship.reports ?? [])
        .sort(
          (a, b) =>
            new Date(b.dateCreation).getTime() -
            new Date(a.dateCreation).getTime(),
        )
        .map((report) => ({
          id: report.id,
          type: report.type,
          fileName: report.fileName,
          originalName: report.originalName,
          size: report.size,
          statut: report.statut,
          commentaire: report.commentaire,
          dateCreation: report.dateCreation,
          dateModification: report.dateModification,
        })),
    };
  }
}
