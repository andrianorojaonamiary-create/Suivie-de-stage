import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Student } from '../students/entities/student.entity';
import { UsersModule } from '../users/users.module';
import { Supervisor } from './entities/supervisor.entity';
import { SupervisorsController } from './supervisors.controller';
import { SupervisorsService } from './supervisors.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Supervisor, Student]),
    AuthModule,
    UsersModule,
  ],
  controllers: [SupervisorsController],
  providers: [SupervisorsService],
})
export class SupervisorsModule {}
