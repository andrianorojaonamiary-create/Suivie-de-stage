import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Internship } from '../internships/entities/internship.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { Student } from '../students/entities/student.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { TeacherAssignment } from './entities/teacher-assignment.entity';
import { TeacherAssignmentsController } from './teacher-assignments.controller';
import { TeacherAssignmentsService } from './teacher-assignments.service';

@Module({
  imports: [
    // Internship n'est charge qu'en repository local : le report sur
    // internships.tuteur_id est fait en SQL via ce repository, ce qui evite
    // d'importer InternshipsModule et donc toute dependance circulaire.
    TypeOrmModule.forFeature([TeacherAssignment, Student, User, Internship]),
    UsersModule,
    NotificationsModule,
    AuthModule,
  ],
  controllers: [TeacherAssignmentsController],
  providers: [TeacherAssignmentsService],
  exports: [TeacherAssignmentsService],
})
export class TeacherAssignmentsModule {}
