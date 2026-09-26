import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Internship } from '../internships/entities/internship.entity';
import { InternshipFollowUp } from './entities/internship-follow-up.entity';
import { InternshipTrackingController } from './internship-tracking.controller';
import { InternshipTrackingService } from './internship-tracking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([InternshipFollowUp, Internship]),
    AuthModule,
    NotificationsModule,
  ],
  controllers: [InternshipTrackingController],
  providers: [InternshipTrackingService],
})
export class InternshipTrackingModule {}
