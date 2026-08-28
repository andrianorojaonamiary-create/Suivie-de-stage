import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Student } from '../students/entities/student.entity';
import { ProfessionalSituation } from './entities/professional-situation.entity';
import { ProfessionalSituationsController } from './professional-situations.controller';
import { ProfessionalSituationsService } from './professional-situations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfessionalSituation, Student]),
    AuthModule,
  ],
  controllers: [ProfessionalSituationsController],
  providers: [ProfessionalSituationsService],
  exports: [ProfessionalSituationsService],
})
export class ProfessionalSituationsModule {}
