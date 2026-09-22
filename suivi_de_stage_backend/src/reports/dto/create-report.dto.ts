import { IsEnum } from 'class-validator';
import { ReportType } from '../enums/report-type.enum';

export class CreateReportDto {
  @IsEnum(ReportType)
  type: ReportType;
}