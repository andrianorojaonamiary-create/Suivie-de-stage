import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsOptional } from 'class-validator';
import { CreateTeacherAssignmentDto } from './create-teacher-assignment.dto';

export class UpdateTeacherAssignmentDto extends PartialType(
  CreateTeacherAssignmentDto,
) {
  // Cloture manuelle d'une affectation. Le service refuse une date de fin
  // anterieure a la date d'affectation (contrainte CHECK en base).
  @IsOptional()
  @IsDateString()
  dateFin?: string;
}
