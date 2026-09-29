import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { AcademicStatus } from '../enums/academic-status.enum';
import { EmploymentStatus } from '../enums/employment-status.enum';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateStudentDto {
  @Transform(trim)
  @IsUUID()
  userId: string;

  @Transform(trim)
  @IsString()
  @Length(2, 50)
  matricule: string;

  @Transform(trim)
  @IsString()
  @Length(2, 150)
  formation: string;

  @Transform(trim)
  @IsString()
  @Length(1, 100)
  niveau: string;

  @Transform(trim)
  @IsString()
  @Length(2, 20)
  promotion: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @Length(5, 30)
  telephone?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @Length(2, 500)
  adresse?: string;

  @IsOptional()
  @IsEnum(AcademicStatus)
  statutAcademique?: AcademicStatus;

  @IsOptional()
  @IsEnum(EmploymentStatus)
  situationProfessionnelle?: EmploymentStatus;

  @IsOptional()
  @IsUUID()
  encadreurId?: string;

  @IsOptional()
  @IsUUID()
  entrepriseId?: string;
}
