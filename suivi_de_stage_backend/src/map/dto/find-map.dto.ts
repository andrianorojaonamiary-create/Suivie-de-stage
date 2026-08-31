import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { InternshipStatus } from '../../internships/enums/internship-status.enum';

export class FindMapDto {
  @IsOptional()
  @IsString()
  ville?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  domaine?: string;

  @IsOptional()
  @IsString()
  formation?: string;

  @IsOptional()
  @IsString()
  promotion?: string;

  @IsOptional()
  @IsEnum(InternshipStatus)
  statut?: InternshipStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit = 500;
}
