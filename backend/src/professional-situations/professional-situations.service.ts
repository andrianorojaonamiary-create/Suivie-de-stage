import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Role } from '../users/enums/role.enum';
import { CreateProfessionalSituationDto } from './dto/create-professional-situation.dto';
import { UpdateProfessionalSituationDto } from './dto/update-professional-situation.dto';
import { ProfessionalSituation } from './entities/professional-situation.entity';

interface AuthenticatedUser {
  id: string;
  role: Role;
}

@Injectable()
export class ProfessionalSituationsService {
  constructor(
    @InjectRepository(ProfessionalSituation)
    private readonly situationsRepository: Repository<ProfessionalSituation>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  async create(dto: CreateProfessionalSituationDto, actor: AuthenticatedUser) {
    const student = await this.findStudentForActor(actor);
    this.validateDates(dto.dateDebut, dto.dateFin);
    const situation = this.situationsRepository.create({
      ...dto,
      studentId: student.id,
      student,
    });
    return this.serialize(await this.situationsRepository.save(situation));
  }

  async findMine(actor: AuthenticatedUser) {
    const student = await this.findStudentForActor(actor);
    const situations = await this.situationsRepository.find({
      where: { studentId: student.id },
      order: { dateCreation: 'DESC' },
    });
    return situations.map((situation) => this.serialize(situation));
  }

  async findAll() {
    const situations = await this.situationsRepository.find({
      relations: { student: { user: true } },
      order: { dateCreation: 'DESC' },
    });
    return situations.map((situation) => this.serialize(situation, true));
  }

  async findStudentHistory(studentId: string) {
    const situations = await this.situationsRepository.find({
      where: { studentId },
      relations: { student: { user: true } },
      order: { dateCreation: 'DESC' },
    });
    return situations.map((situation) => this.serialize(situation, true));
  }

  async update(
    id: string,
    dto: UpdateProfessionalSituationDto,
    actor: AuthenticatedUser,
  ) {
    const situation = await this.findEntity(id);
    if (
      actor.role !== Role.ADMINISTRATEUR &&
      !(await this.isOwnStudent(situation.studentId, actor.id))
    ) {
      throw new ForbiddenException(
        'Vous ne pouvez pas modifier cette situation professionnelle.',
      );
    }
    this.validateDates(dto.dateDebut, dto.dateFin);
    Object.assign(situation, dto);
    return this.serialize(
      await this.situationsRepository.save(situation),
      actor.role === Role.ADMINISTRATEUR,
    );
  }

  private async findStudentForActor(actor: AuthenticatedUser) {
    if (actor.role !== Role.ETUDIANT) {
      throw new ForbiddenException(
        'Seul un étudiant peut renseigner sa situation professionnelle.',
      );
    }
    const student = await this.studentsRepository.findOne({
      where: { userId: actor.id },
    });
    if (!student) {
      throw new NotFoundException('Profil étudiant introuvable.');
    }
    return student;
  }

  private async findEntity(id: string) {
    const situation = await this.situationsRepository.findOne({
      where: { id },
      relations: { student: { user: true } },
    });
    if (!situation) {
      throw new NotFoundException('Situation professionnelle introuvable.');
    }
    return situation;
  }

  private async isOwnStudent(studentId: string, userId: string) {
    return Boolean(
      await this.studentsRepository.findOne({
        where: { id: studentId, userId },
      }),
    );
  }

  private validateDates(dateDebut?: string, dateFin?: string) {
    if (dateDebut && dateFin && dateFin < dateDebut) {
      throw new BadRequestException(
        'La date de fin doit être postérieure ou égale à la date de début.',
      );
    }
  }

  private serialize(situation: ProfessionalSituation, includeStudent = false) {
    return {
      id: situation.id,
      studentId: situation.studentId,
      ...(includeStudent && situation.student
        ? {
            student: {
              id: situation.student.id,
              matricule: situation.student.matricule,
              user: situation.student.user
                ? {
                    id: situation.student.user.id,
                    nom: situation.student.user.nom,
                    prenom: situation.student.user.prenom,
                    email: situation.student.user.email,
                  }
                : undefined,
            },
          }
        : {}),
      situation: situation.situation,
      entreprise: situation.entreprise,
      poste: situation.poste,
      domaine: situation.domaine,
      ville: situation.ville,
      pays: situation.pays,
      dateDebut: situation.dateDebut,
      dateFin: situation.dateFin,
      description: situation.description,
      dateCreation: situation.dateCreation,
      dateModification: situation.dateModification,
    };
  }
}
