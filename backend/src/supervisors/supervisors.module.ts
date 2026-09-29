import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Internship } from '../internships/entities/internship.entity';
import { UsersModule } from '../users/users.module';
import { Supervisor } from './entities/supervisor.entity';
import { SupervisorsController } from './supervisors.controller';
import { SupervisorsService } from './supervisors.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Supervisor, Internship]),
    AuthModule,
    UsersModule,
  ],
  controllers: [SupervisorsController],
  providers: [SupervisorsService],
})
export class SupervisorsModule {}
