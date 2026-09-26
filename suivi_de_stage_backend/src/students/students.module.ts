import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { StudentsController } from './students.controller';
import { Student } from './entities/student.entity';
import { StudentsService } from './students.service';
import { Internship } from '../internships/entities/internship.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Internship]),
    UsersModule,
    AuthModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
