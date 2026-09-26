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
import { ProfessionalSituationType } from './enums/professional-situation-type.enum';
import { AcademicStatus } from '../students/enums/academic-status.enum';
import { CreateProfessionalSituationDto } from './dto/create-professional-situation.dto';
import { UpdateProfessionalSituationDto } from './dto/update-professional-situation.dto';
import { ProfessionalSituation } from './entities/professional-situation.entity';

const SITUATION_LABEL_TO_ENUM: Record<string, ProfessionalSituationType> = {
  'En emploi': ProfessionalSituationType.EMPLOYE,
  'En recherche': ProfessionalSituationType.EN_RECHERCHE_EMPLOI,
  'Études supérieures': ProfessionalSituationType.POURSUITE_ETUDES,
  Entrepreneur: ProfessionalSituationType.ENTREPRENEUR,
  Autre: ProfessionalSituationType.AUTRE,
};

const SITUATION_ENUM_TO_LABEL: Record<ProfessionalSituationType, string> = {
  [ProfessionalSituationType.EMPLOYE]: 'En emploi',
  [ProfessionalSituationType.EN_RECHERCHE_EMPLOI]: 'En recherche',
  [ProfessionalSituationType.POURSUITE_ETUDES]: 'Études supérieures',
  [ProfessionalSituationType.ENTREPRENEUR]: 'Entrepreneur',
  [ProfessionalSituationType.AUTRE]: 'Autre',
};

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
      situation: this.normalizeSituation(dto.situation),
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
    const latestSituations = await this.situationsRepository
      .createQueryBuilder('situation')
      .innerJoin(Student, 'student', 'student.id = situation.student_id')
      .where('student.statut_academique = :status', {
        status: AcademicStatus.DIPLOME,
      })
      .andWhere(
        `situation.date_creation = (
          SELECT MAX(previous.date_creation)
          FROM professional_situations previous
          WHERE previous.student_id = situation.student_id
        )`,
      )
      .leftJoinAndSelect('situation.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .orderBy('situation.date_creation', 'DESC')
      .getMany();

    return latestSituations.map((situation) => this.serialize(situation, true));
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
    const { situation: rawSituation, ...updates } = dto;
    Object.assign(situation, updates);
    if (rawSituation !== undefined) {
      situation.situation = this.normalizeSituation(rawSituation);
    }
    return this.serialize(
      await this.situationsRepository.save(situation),
      actor.role === Role.ADMINISTRATEUR,
    );
  }

  async remove(id: string, actor: AuthenticatedUser) {
    const situation = await this.findEntity(id);
    if (
      actor.role !== Role.ADMINISTRATEUR &&
      !(await this.isOwnStudent(situation.studentId, actor.id))
    ) {
      throw new ForbiddenException(
        'Vous ne pouvez pas supprimer cette situation professionnelle.',
      );
    }
    await this.situationsRepository.remove(situation);
    return { message: 'Situation professionnelle supprimée avec succès.' };
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

  private normalizeSituation(value: string): ProfessionalSituationType {
    if (
      Object.values(ProfessionalSituationType).includes(
        value as ProfessionalSituationType,
      )
    )
      return value as ProfessionalSituationType;
    const mapped = SITUATION_LABEL_TO_ENUM[value];
    if (mapped) return mapped;
    throw new BadRequestException('Situation professionnelle invalide.');
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
      situation:
        SITUATION_ENUM_TO_LABEL[situation.situation] ?? situation.situation,
      entreprise: situation.entreprise,
      poste: situation.poste,
      domaine: situation.domaine,
      ville: situation.ville,
      pays: situation.pays,
      dateDebut: situation.dateDebut,
      dateFin: situation.dateFin,
      description: situation.description,
      typeContrat: situation.typeContrat,
      statutAcademique: situation.statutAcademique,
      dateDiplome: situation.dateDiplome,
      dateCreation: situation.dateCreation,
      dateModification: situation.dateModification,
    };
  }
}
