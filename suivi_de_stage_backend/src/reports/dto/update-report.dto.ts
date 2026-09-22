import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ReportStatus } from '../enums/report-status.enum';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateReportDto {
  @IsOptional()
  @IsEnum(ReportStatus)
  statut?: ReportStatus;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @Length(2, 5000)
  commentaire?: string;
}