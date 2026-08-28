import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Company } from '../companies/entities/company.entity';
import { Student } from '../students/entities/student.entity';
import { Supervisor } from '../supervisors/entities/supervisor.entity';
import { Internship } from './entities/internship.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { InternshipsController } from './internships.controller';
import { InternshipsService } from './internships.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Internship, Student, Company, Supervisor]),
    AuthModule,
    NotificationsModule,
  ],
  controllers: [InternshipsController],
  providers: [InternshipsService],
})
export class InternshipsModule {}
