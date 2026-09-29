import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Internship } from '../internships/entities/internship.entity';
import { InternshipStatus } from '../internships/enums/internship-status.enum';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsScheduler {
  constructor(
    @InjectRepository(Internship)
    private readonly internshipsRepository: Repository<Internship>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async notifyUpcomingEndDates() {
    const today = new Date();
    const limit = new Date(today);
    limit.setDate(limit.getDate() + 7);
    const internships = await this.internshipsRepository.find({
      where: {
        dateFin: Between(
          today.toISOString().slice(0, 10),
          limit.toISOString().slice(0, 10),
        ),
        statut: InternshipStatus.EN_COURS,
      },
      relations: {
        student: { user: true },
        company: { user: true },
        supervisor: { user: true },
      },
    });
    await Promise.all(
      internships.map((internship) =>
        this.notificationsService.notifyStageEndingSoon(internship),
      ),
    );
  }
}
