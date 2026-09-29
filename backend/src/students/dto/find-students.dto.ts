import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { AcademicStatus } from '../enums/academic-status.enum';

export class FindStudentsDto {
  @IsOptional()
  @IsString()
  formation?: string;

  @IsOptional()
  @IsString()
  niveau?: string;

  @IsOptional()
  @IsString()
  promotion?: string;

  @IsOptional()
  @IsEnum(AcademicStatus)
  statutAcademique?: AcademicStatus;

  @IsOptional()
  @IsString()
  search?: string;

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
