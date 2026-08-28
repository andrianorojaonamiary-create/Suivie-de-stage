import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { InternshipStatus } from '../enums/internship-status.enum';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateInternshipDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  companyId: string;

  @IsUUID()
  supervisorId: string;

  @Transform(trim)
  @IsString()
  @Length(2, 200)
  intitule: string;

  @Transform(trim)
  @IsString()
  @Length(2, 5000)
  description: string;

  @Transform(trim)
  @IsString()
  @Length(2, 150)
  domaine: string;

  @Transform(trim)
  @IsString()
  @Length(2, 255)
  lieu: string;

  @Transform(trim)
  @IsString()
  @Length(2, 100)
  ville: string;

  @Type(() => Number)
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @Type(() => Number)
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsDateString()
  dateDebut: string;

  @IsDateString()
  dateFin: string;

  @IsOptional()
  @IsEnum(InternshipStatus)
  statut?: InternshipStatus;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @Length(2, 5000)
  observations?: string;
}
