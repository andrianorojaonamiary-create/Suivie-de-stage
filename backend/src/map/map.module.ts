import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Company } from '../companies/entities/company.entity';
import { Internship } from '../internships/entities/internship.entity';
import { MapController } from './map.controller';
import { MapService } from './map.service';

@Module({
  imports: [TypeOrmModule.forFeature([Internship, Company]), AuthModule],
  controllers: [MapController],
  providers: [MapService],
})
export class MapModule {}
