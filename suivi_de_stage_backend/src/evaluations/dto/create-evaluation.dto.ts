import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
  IsString,
  Length,
} from 'class-validator';
import { EvaluatorType } from '../enums/evaluator-type.enum';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateEvaluationDto {
  @IsUUID()
  stageId: string;

  @IsUUID()
  evaluateurId: string;

  @IsEnum(EvaluatorType)
  typeEvaluateur: EvaluatorType;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(20)
  note: number;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @Length(2, 5000)
  commentaire?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @Length(2, 5000)
  observation?: string;

  @IsOptional()
  @IsDateString()
  dateEvaluation?: string;
}
