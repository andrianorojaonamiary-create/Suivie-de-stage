import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class FindTeacherAssignmentsDto {
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @IsOptional()
  @IsString()
  formation?: string;

  // Recherche sur nom / prenom / matricule de l'etudiant, ou nom / prenom /
  // email de l'enseignant affecte.
  @IsOptional()
  @IsString()
  search?: string;

  // true = uniquement les affectations actives (date_fin IS NULL).
  @IsOptional()
  @Transform(({ value }) =>
    value === true || value === 'true' ? true : undefined,
  )
  @IsBoolean()
  actifOnly?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}
