import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, QueryFailedError, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';
import { UsersService } from '../users/users.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { FindStudentsDto } from './dto/find-students.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';

interface AuthenticatedUser {
  id: string;
  role: Role;
}

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    private readonly usersService: UsersService,
  ) {}

  async create(createStudentDto: CreateStudentDto, actor: AuthenticatedUser) {
    this.ensureAdmin(actor);
    const user = await this.findUser(createStudentDto.userId, Role.ETUDIANT);
    await this.validateAssignment(createStudentDto.encadreurId, Role.ENCADREUR);
    await this.validateAssignment(
      createStudentDto.entrepriseId,
      Role.ENTREPRISE,
    );

    const student = this.studentsRepository.create({
      ...createStudentDto,
      user,
    });

    return this.saveAndSerialize(student, actor);
  }

  async findAll(findStudentsDto: FindStudentsDto, actor: AuthenticatedUser) {
    const page = findStudentsDto.page ?? 1;
    const limit = findStudentsDto.limit ?? 10;
    const query = this.studentsRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('student.encadreur', 'encadreur')
      .leftJoinAndSelect('student.entreprise', 'entreprise');

    this.applyAccessFilter(query, actor);
    this.applySearchFilters(query, findStudentsDto);

    const [students, total] = await query
      .orderBy('student.dateCreation', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: students.map((student) => this.toPublicStudent(student, actor)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, actor: AuthenticatedUser) {
    const student = await this.findEntity(id);
    this.ensureCanRead(student, actor);
    return this.toPublicStudent(student, actor);
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
    actor: AuthenticatedUser,
  ) {
    const student = await this.findEntity(id);

    if (actor.role === Role.ADMINISTRATEUR) {
      if (updateStudentDto.userId) {
        student.user = await this.findUser(
          updateStudentDto.userId,
          Role.ETUDIANT,
        );
        student.userId = updateStudentDto.userId;
      }
      if (updateStudentDto.encadreurId !== undefined) {
        await this.validateAssignment(
          updateStudentDto.encadreurId,
          Role.ENCADREUR,
        );
      }
      if (updateStudentDto.entrepriseId !== undefined) {
        await this.validateAssignment(
          updateStudentDto.entrepriseId,
          Role.ENTREPRISE,
        );
      }
      Object.assign(student, updateStudentDto);
      return this.saveAndSerialize(student, actor);
    }

    this.ensureCanRead(student, actor);
    if (actor.role !== Role.ETUDIANT) {
      throw new ForbiddenException('Vous ne pouvez pas modifier cet étudiant.');
    }

    const allowedChanges: DeepPartial<Student> = {
      telephone: updateStudentDto.telephone,
      adresse: updateStudentDto.adresse,
    };
    Object.assign(student, allowedChanges);
    return this.saveAndSerialize(student, actor);
  }

  async remove(id: string, actor: AuthenticatedUser) {
    this.ensureAdmin(actor);
    const student = await this.findEntity(id);
    await this.studentsRepository.softRemove(student);
    return { message: 'Étudiant supprimé logiquement avec succès.' };
  }

  private applyAccessFilter(
    query: ReturnType<Repository<Student>['createQueryBuilder']>,
    actor: AuthenticatedUser,
  ) {
    if (actor.role === Role.ETUDIANT) {
      query.andWhere('student.user_id = :userId', { userId: actor.id });
    } else if (actor.role === Role.ENCADREUR) {
      query.andWhere('student.encadreur_id = :encadreurId', {
        encadreurId: actor.id,
      });
    } else if (actor.role === Role.ENTREPRISE) {
      query.andWhere('student.entreprise_id = :entrepriseId', {
        entrepriseId: actor.id,
      });
    }
  }

  private applySearchFilters(
    query: ReturnType<Repository<Student>['createQueryBuilder']>,
    filters: FindStudentsDto,
  ) {
    if (filters.formation) {
      query.andWhere('LOWER(student.formation) LIKE LOWER(:formation)', {
        formation: `%${filters.formation}%`,
      });
    }
    if (filters.niveau) {
      query.andWhere('LOWER(student.niveau) = LOWER(:niveau)', {
        niveau: filters.niveau,
      });
    }
    if (filters.promotion) {
      query.andWhere('student.promotion = :promotion', {
        promotion: filters.promotion,
      });
    }
    if (filters.statutAcademique) {
      query.andWhere('student.statut_academique = :statutAcademique', {
        statutAcademique: filters.statutAcademique,
      });
    }
    if (filters.search) {
      query.andWhere(
        '(LOWER(student.matricule) LIKE LOWER(:search) OR LOWER(user.nom) LIKE LOWER(:search) OR LOWER(user.prenom) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))',
        { search: `%${filters.search}%` },
      );
    }
  }

  private async findEntity(id: string) {
    const student = await this.studentsRepository.findOne({
      where: { id },
      relations: { user: true, encadreur: true, entreprise: true },
    });
    if (!student) {
      throw new NotFoundException('Étudiant introuvable.');
    }
    return student;
  }

  private async findUser(id: string, expectedRole: Role) {
    const user = await this.usersService.findActiveById(id);
    if (!user || user.role !== expectedRole) {
      throw new NotFoundException(`Utilisateur ${expectedRole} introuvable.`);
    }
    return user;
  }

  private async validateAssignment(id: string | undefined, expectedRole: Role) {
    if (id !== undefined) {
      await this.findUser(id, expectedRole);
    }
  }

  private ensureAdmin(actor: AuthenticatedUser) {
    if (actor.role !== Role.ADMINISTRATEUR) {
      throw new ForbiddenException(
        'Seul un administrateur peut effectuer cette action.',
      );
    }
  }

  private ensureCanRead(student: Student, actor: AuthenticatedUser) {
    const allowed =
      actor.role === Role.ADMINISTRATEUR ||
      (actor.role === Role.ETUDIANT && student.userId === actor.id) ||
      (actor.role === Role.ENCADREUR && student.encadreurId === actor.id) ||
      (actor.role === Role.ENTREPRISE && student.entrepriseId === actor.id);
    if (!allowed) {
      throw new ForbiddenException(
        'Vous ne pouvez pas consulter cet étudiant.',
      );
    }
  }

  private async saveAndSerialize(student: Student, actor?: AuthenticatedUser) {
    try {
      return this.toPublicStudent(
        await this.studentsRepository.save(student),
        actor,
      );
    } catch (error) {
      const driverError = (error as QueryFailedError).driverError as
        { code?: string } | undefined;
      if (error instanceof QueryFailedError && driverError?.code === '23505') {
        throw new ConflictException(
          'Le matricule ou le compte est déjà utilisé.',
        );
      }
      throw error;
    }
  }

  private toPublicStudent(student: Student, actor?: AuthenticatedUser) {
    const publicUser = student.user
      ? {
          id: student.user.id,
          nom: student.user.nom,
          prenom: student.user.prenom,
          ...(actor?.role === Role.ADMINISTRATEUR ||
          actor?.role === Role.ETUDIANT
            ? { email: student.user.email, role: student.user.role }
            : {}),
        }
      : undefined;
    const publicStudent = {
      id: student.id,
      matricule: student.matricule,
      formation: student.formation,
      niveau: student.niveau,
      promotion: student.promotion,
      telephone: student.telephone,
      adresse: student.adresse,
      statutAcademique: student.statutAcademique,
      user: publicUser,
      dateCreation: student.dateCreation,
      dateModification: student.dateModification,
    };

    if (actor?.role === Role.ADMINISTRATEUR) {
      return {
        ...publicStudent,
        encadreurId: student.encadreurId,
        entrepriseId: student.entrepriseId,
      };
    }

    if (actor?.role === Role.ETUDIANT) {
      return publicStudent;
    }

    return {
      id: publicStudent.id,
      matricule: publicStudent.matricule,
      formation: publicStudent.formation,
      niveau: publicStudent.niveau,
      promotion: publicStudent.promotion,
      statutAcademique: publicStudent.statutAcademique,
      user: publicUser
        ? { id: publicUser.id, nom: publicUser.nom, prenom: publicUser.prenom }
        : undefined,
      dateCreation: publicStudent.dateCreation,
      dateModification: publicStudent.dateModification,
    };
  }
}
