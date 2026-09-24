import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { EvaluatorType } from '../enums/evaluator-type.enum';

export class FindAllEvaluationsDto {
  @IsOptional()
  @IsEnum(EvaluatorType)
  typeEvaluateur?: EvaluatorType;

  @IsOptional()
  @IsEnum(['true', 'false'])
  validee?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @IsOptional()
  @IsDateString()
  dateFin?: string;

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
  limit = 20;
}