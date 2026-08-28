import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Internship } from '../internships/entities/internship.entity';
import { Role } from '../users/enums/role.enum';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { FindFollowUpsDto } from './dto/find-follow-ups.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';
import { InternshipFollowUp } from './entities/internship-follow-up.entity';

interface AuthenticatedUser {
  id: string;
  role: Role;
}

@Injectable()
export class InternshipTrackingService {
  constructor(
    @InjectRepository(InternshipFollowUp)
    private readonly followUpsRepository: Repository<InternshipFollowUp>,
    @InjectRepository(Internship)
    private readonly internshipsRepository: Repository<Internship>,
  ) {}

  async create(
    internshipId: string,
    dto: CreateFollowUpDto,
    actor: AuthenticatedUser,
  ) {
    const internship = await this.findInternship(internshipId);
    this.ensureCanWrite(internship, actor);
    const followUp = this.followUpsRepository.create({
      internshipId,
      internship,
      authorId: actor.id,
      contenu: dto.contenu,
      type: dto.type,
    });
    return this.toPublicFollowUp(await this.followUpsRepository.save(followUp));
  }

  async findAll(
    internshipId: string,
    dto: FindFollowUpsDto,
    actor: AuthenticatedUser,
  ) {
    const internship = await this.findInternship(internshipId);
    this.ensureCanRead(internship, actor);
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const query = this.followUpsRepository
      .createQueryBuilder('followUp')
      .leftJoinAndSelect('followUp.auteur', 'author')
      .where('followUp.internship_id = :internshipId', { internshipId });

    if (dto.type) query.andWhere('followUp.type = :type', { type: dto.type });
    const [followUps, total] = await query
      .orderBy('followUp.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: followUps.map((followUp) => this.toPublicFollowUp(followUp)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(id: string, dto: UpdateFollowUpDto, actor: AuthenticatedUser) {
    const followUp = await this.findFollowUp(id);
    this.ensureCanWrite(followUp.internship, actor);
    if (actor.role !== Role.ADMINISTRATEUR && followUp.authorId !== actor.id) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres suivis.',
      );
    }
    Object.assign(followUp, dto);
    return this.toPublicFollowUp(await this.followUpsRepository.save(followUp));
  }

  async remove(id: string, actor: AuthenticatedUser) {
    const followUp = await this.findFollowUp(id);
    this.ensureCanWrite(followUp.internship, actor);
    if (actor.role !== Role.ADMINISTRATEUR && followUp.authorId !== actor.id) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres suivis.',
      );
    }
    await this.followUpsRepository.remove(followUp);
    return { message: 'Suivi supprimé avec succès.' };
  }

  private async findInternship(id: string) {
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

  private async findFollowUp(id: string) {
    const followUp = await this.followUpsRepository.findOne({
      where: { id },
      relations: {
        internship: {
          student: { user: true },
          company: { user: true },
          supervisor: { user: true },
        },
        auteur: true,
      },
    });
    if (!followUp) throw new NotFoundException('Suivi introuvable.');
    return followUp;
  }

  private ensureCanRead(internship: Internship, actor: AuthenticatedUser) {
    const allowed =
      actor.role === Role.ADMINISTRATEUR ||
      (actor.role === Role.ETUDIANT &&
        internship.student.user?.id === actor.id) ||
      (actor.role === Role.ENTREPRISE &&
        internship.company.user?.id === actor.id) ||
      (actor.role === Role.ENCADREUR &&
        internship.supervisor.user?.id === actor.id);
    if (!allowed)
      throw new ForbiddenException('Vous ne pouvez pas consulter ce suivi.');
  }

  private ensureCanWrite(internship: Internship, actor: AuthenticatedUser) {
    if (actor.role === Role.ADMINISTRATEUR) return;
    if (
      actor.role !== Role.ENCADREUR ||
      internship.supervisor.user?.id !== actor.id
    ) {
      throw new ForbiddenException(
        'Seul l’encadreur affecté peut ajouter ce suivi.',
      );
    }
  }

  private toPublicFollowUp(followUp: InternshipFollowUp) {
    return {
      id: followUp.id,
      internshipId: followUp.internshipId,
      auteur: followUp.auteur
        ? {
            id: followUp.auteur.id,
            nom: followUp.auteur.nom,
            prenom: followUp.auteur.prenom,
          }
        : { id: followUp.authorId },
      contenu: followUp.contenu,
      date: followUp.date,
      type: followUp.type,
      dateModification: followUp.dateModification,
    };
  }
}
