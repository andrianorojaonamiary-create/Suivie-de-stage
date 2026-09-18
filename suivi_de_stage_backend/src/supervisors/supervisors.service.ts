import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Role } from '../users/enums/role.enum';
import { UsersService } from '../users/users.service';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { FindSupervisorsDto } from './dto/find-supervisors.dto';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';
import { Supervisor } from './entities/supervisor.entity';
import { Student } from '../students/entities/student.entity';

interface AuthenticatedUser {
  id: string;
  role: Role;
}

@Injectable()
export class SupervisorsService {
  constructor(
    @InjectRepository(Supervisor)
    private readonly supervisorsRepository: Repository<Supervisor>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateSupervisorDto, actor: AuthenticatedUser) {
    this.ensureAdmin(actor);
    const user = await this.findSupervisorUser(dto.userId);
    const supervisor = this.supervisorsRepository.create({ ...dto, user });
    return this.saveAndSerialize(supervisor);
  }

  async findAll(dto: FindSupervisorsDto, actor: AuthenticatedUser) {
    const canList =
      actor.role === Role.ADMINISTRATEUR ||
      actor.role === Role.ENSEIGNANT ||
      actor.role === Role.ETUDIANT;
    if (!canList) {
      throw new ForbiddenException(
        'Accès réservé aux administrateurs, enseignants et étudiants.',
      );
    }
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const query = this.supervisorsRepository
      .createQueryBuilder('supervisor')
      .innerJoinAndSelect('supervisor.user', 'user');

    this.applyFilters(query, dto);
    const [supervisors, total] = await query
      .orderBy('supervisor.dateCreation', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: supervisors.map((supervisor) =>
        this.toPublicSupervisor(supervisor),
      ),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, actor: AuthenticatedUser) {
    const supervisor = await this.findEntity(id);
    this.ensureCanAccess(supervisor, actor);
    return this.toPublicSupervisor(supervisor);
  }

  async findMe(actor: AuthenticatedUser) {
    this.ensureSupervisor(actor);
    const supervisor = await this.findByUserId(actor.id);
    return this.toPublicSupervisor(supervisor);
  }

  async update(id: string, dto: UpdateSupervisorDto, actor: AuthenticatedUser) {
    const supervisor = await this.findEntity(id);
    this.ensureCanAccess(supervisor, actor);

    if (actor.role !== Role.ADMINISTRATEUR && dto.userId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas modifier le compte lié.',
      );
    }
    if (dto.userId) {
      supervisor.user = await this.findSupervisorUser(dto.userId);
      supervisor.userId = dto.userId;
    }

    Object.assign(supervisor, dto);
    return this.saveAndSerialize(supervisor);
  }

  async remove(id: string, actor: AuthenticatedUser) {
    this.ensureAdmin(actor);
    const supervisor = await this.findEntity(id);
    await this.supervisorsRepository.remove(supervisor);
    return { message: 'Encadreur supprimé avec succès.' };
  }

  async findAssignedStudents(id: string, actor: AuthenticatedUser) {
    const supervisor = await this.findEntity(id);
    this.ensureCanAccess(supervisor, actor);
    const students = await this.studentsRepository.find({
      where: { encadreurId: supervisor.userId },
      relations: { user: true },
      order: { dateCreation: 'DESC' },
    });

    return students.map((student) => ({
      id: student.id,
      matricule: student.matricule,
      formation: student.formation,
      niveau: student.niveau,
      promotion: student.promotion,
      statutAcademique: student.statutAcademique,
      user: student.user
        ? {
            id: student.user.id,
            nom: student.user.nom,
            prenom: student.user.prenom,
          }
        : undefined,
    }));
  }

  private applyFilters(
    query: ReturnType<Repository<Supervisor>['createQueryBuilder']>,
    dto: FindSupervisorsDto,
  ) {
    if (dto.fonction) {
      query.andWhere('LOWER(supervisor.fonction) LIKE LOWER(:fonction)', {
        fonction: `%${dto.fonction}%`,
      });
    }
    if (dto.specialite) {
      query.andWhere('LOWER(supervisor.specialite) LIKE LOWER(:specialite)', {
        specialite: `%${dto.specialite}%`,
      });
    }
    if (dto.search) {
      query.andWhere(
        '(LOWER(user.nom) LIKE LOWER(:search) OR LOWER(user.prenom) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search) OR LOWER(supervisor.fonction) LIKE LOWER(:search) OR LOWER(supervisor.specialite) LIKE LOWER(:search))',
        { search: `%${dto.search}%` },
      );
    }
  }

  private async findEntity(id: string) {
    const supervisor = await this.supervisorsRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!supervisor) {
      throw new NotFoundException('Encadreur introuvable.');
    }
    return supervisor;
  }

  private async findByUserId(userId: string) {
    const supervisor = await this.supervisorsRepository.findOne({
      where: { userId },
      relations: { user: true },
    });
    if (!supervisor) {
      throw new NotFoundException('Profil encadreur introuvable.');
    }
    return supervisor;
  }

  private async findSupervisorUser(id: string) {
    const user = await this.usersService.findActiveById(id);
    if (!user || user.role !== Role.ENCADREUR) {
      throw new NotFoundException('Compte encadreur introuvable.');
    }
    return user;
  }

  private ensureAdmin(actor: AuthenticatedUser) {
    if (actor.role !== Role.ADMINISTRATEUR) {
      throw new ForbiddenException(
        'Seul un administrateur peut effectuer cette action.',
      );
    }
  }

  private ensureSupervisor(actor: AuthenticatedUser) {
    if (
      actor.role !== Role.ENCADREUR &&
      actor.role !== Role.ENSEIGNANT &&
      actor.role !== Role.ADMINISTRATEUR
    ) {
      throw new ForbiddenException(
        'Accès réservé aux encadreurs et enseignants.',
      );
    }
  }

  private ensureCanAccess(supervisor: Supervisor, actor: AuthenticatedUser) {
    if (
      actor.role !== Role.ADMINISTRATEUR &&
      actor.role !== Role.ENSEIGNANT &&
      (actor.role !== Role.ENCADREUR || supervisor.userId !== actor.id)
    ) {
      throw new ForbiddenException(
        'Vous ne pouvez pas consulter cet encadreur.',
      );
    }
  }

  private async saveAndSerialize(supervisor: Supervisor) {
    try {
      return this.toPublicSupervisor(
        await this.supervisorsRepository.save(supervisor),
      );
    } catch (error) {
      const driverError = (error as QueryFailedError).driverError as
        { code?: string } | undefined;
      if (error instanceof QueryFailedError && driverError?.code === '23505') {
        throw new ConflictException(
          'Ce compte possède déjà un profil encadreur.',
        );
      }
      throw error;
    }
  }

  private toPublicSupervisor(supervisor: Supervisor) {
    return {
      id: supervisor.id,
      fonction: supervisor.fonction,
      specialite: supervisor.specialite,
      telephone: supervisor.telephone,
      entreprise: supervisor.entreprise ?? null,
      user: supervisor.user
        ? {
            id: supervisor.user.id,
            nom: supervisor.user.nom,
            prenom: supervisor.user.prenom,
            email: supervisor.user.email,
            role: supervisor.user.role,
          }
        : undefined,
      dateCreation: supervisor.dateCreation,
      dateModification: supervisor.dateModification,
    };
  }
}
