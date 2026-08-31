import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Internship } from '../internships/entities/internship.entity';
import { Role } from '../users/enums/role.enum';
import { FindNotificationsDto } from './dto/find-notifications.dto';
import { Notification } from './entities/notification.entity';
import { NotificationType } from './enums/notification-type.enum';

interface AuthenticatedUser {
  id: string;
  role: Role;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async findAll(dto: FindNotificationsDto, actor: AuthenticatedUser) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const query = this.notificationsRepository
      .createQueryBuilder('notification')
      .where('notification.utilisateur_destinataire_id = :userId', {
        userId: actor.id,
      });
    if (dto.type)
      query.andWhere('notification.type = :type', { type: dto.type });
    if (dto.lu !== undefined)
      query.andWhere('notification.lu = :lu', { lu: dto.lu });
    const [notifications, total] = await query
      .orderBy('notification.date_creation', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return {
      data: notifications,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async markAsRead(id: string, actor: AuthenticatedUser) {
    const notification = await this.findOwned(id, actor);
    notification.lu = true;
    return this.notificationsRepository.save(notification);
  }

  async remove(id: string, actor: AuthenticatedUser) {
    const notification = await this.findOwned(id, actor);
    await this.notificationsRepository.remove(notification);
    return { message: 'Notification supprimée avec succès.' };
  }

  async notifyStageAssigned(stage: Internship) {
    const supervisorId = stage.supervisor?.user?.id;
    if (supervisorId) {
      await this.createNotification(
        supervisorId,
        NotificationType.STAGE_AFFECTE,
        'Nouvel étudiant affecté',
        'Un étudiant vous a été affecté.',
        stage.id,
      );
    }
    await this.notifyParticipants(
      stage,
      NotificationType.STAGE_AFFECTE,
      'Stage affecté',
      `Le stage « ${stage.intitule} » vous a été affecté.`,
      supervisorId,
    );
  }

  async notifyStageModified(stage: Internship) {
    const supervisorId = stage.supervisor?.user?.id;
    if (supervisorId) {
      await this.createNotification(
        supervisorId,
        NotificationType.STAGE_MODIFIE,
        'Stage modifié',
        `Le stage de ${this.getStudentName(stage)} a été modifié.`,
        stage.id,
      );
    }
    await this.notifyParticipants(
      stage,
      NotificationType.STAGE_MODIFIE,
      'Stage modifié',
      `Le stage « ${stage.intitule} » a été modifié.`,
      supervisorId,
    );
  }

  async notifyStageFinished(stage: Internship) {
    await this.notifyParticipants(
      stage,
      NotificationType.STAGE_TERMINE,
      'Stage terminé',
      `Le stage « ${stage.intitule} » est terminé.`,
    );
  }

  async notifyEvaluation(stage: Internship) {
    const userId = stage.student?.user?.id;
    if (userId)
      await this.createNotification(
        userId,
        NotificationType.EVALUATION,
        'Nouvelle évaluation',
        `Une nouvelle évaluation est disponible pour le stage « ${stage.intitule} »`,
        stage.id,
      );
  }

  async notifyStageEndingSoon(stage: Internship) {
    const participants = [
      stage.student?.user?.id,
      stage.company?.user?.id,
      stage.supervisor?.user?.id,
    ].filter((id): id is string => Boolean(id));
    for (const userId of new Set(participants)) {
      const existing = await this.notificationsRepository.findOne({
        where: {
          utilisateurDestinataireId: userId,
          type: NotificationType.FIN_STAGE_PROCHE,
          referenceId: stage.id,
        },
      });
      if (!existing)
        await this.createNotification(
          userId,
          NotificationType.FIN_STAGE_PROCHE,
          'Fin de stage proche',
          userId === stage.supervisor?.user?.id
            ? `Le stage de ${this.getStudentName(stage)} se termine bientôt.`
            : `La fin du stage « ${stage.intitule} » approche.`,
          stage.id,
        );
    }
    await this.notifyEvaluationRequired(stage);
  }

  private async notifyParticipants(
    stage: Internship,
    type: NotificationType,
    titre: string,
    message: string,
    excludedUserId?: string,
  ) {
    const participants = [
      stage.student?.user?.id,
      stage.company?.user?.id,
      stage.supervisor?.user?.id,
    ].filter((id): id is string => Boolean(id) && id !== excludedUserId);
    await Promise.all(
      [...new Set(participants)].map((userId) =>
        this.createNotification(userId, type, titre, message, stage.id),
      ),
    );
  }

  private async notifyEvaluationRequired(stage: Internship) {
    const supervisorId = stage.supervisor?.user?.id;
    if (!supervisorId) return;
    const existing = await this.notificationsRepository.findOne({
      where: {
        utilisateurDestinataireId: supervisorId,
        type: NotificationType.EVALUATION,
        referenceId: stage.id,
      },
    });
    if (!existing)
      await this.createNotification(
        supervisorId,
        NotificationType.EVALUATION,
        'Évaluation à effectuer',
        'Une évaluation est à effectuer.',
        stage.id,
      );
  }

  private getStudentName(stage: Internship) {
    return (
      [stage.student?.user?.nom, stage.student?.user?.prenom]
        .filter(Boolean)
        .join(' ') || 'cet étudiant'
    );
  }

  private async createNotification(
    userId: string,
    type: NotificationType,
    titre: string,
    message: string,
    referenceId?: string,
  ) {
    return this.notificationsRepository.save(
      this.notificationsRepository.create({
        utilisateurDestinataireId: userId,
        type,
        titre,
        message,
        referenceId: referenceId ?? null,
      }),
    );
  }

  private async findOwned(id: string, actor: AuthenticatedUser) {
    const notification = await this.notificationsRepository.findOne({
      where: { id, utilisateurDestinataireId: actor.id },
    });
    if (!notification) throw new NotFoundException('Notification introuvable.');
    return notification;
  }
}
