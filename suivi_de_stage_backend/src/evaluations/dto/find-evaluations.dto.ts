import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { EvaluatorType } from '../enums/evaluator-type.enum';

export class FindEvaluationsDto {
  @IsOptional()
  @IsEnum(EvaluatorType)
  typeEvaluateur?: EvaluatorType;

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
