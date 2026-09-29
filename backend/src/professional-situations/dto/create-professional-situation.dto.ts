import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ProfessionalSituationType } from '../enums/professional-situation-type.enum';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateProfessionalSituationDto {
  @IsEnum(ProfessionalSituationType)
  situation: ProfessionalSituationType;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(200)
  entreprise?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(150)
  poste?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(150)
  domaine?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  ville?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  pays?: string;

  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  description?: string;
}
