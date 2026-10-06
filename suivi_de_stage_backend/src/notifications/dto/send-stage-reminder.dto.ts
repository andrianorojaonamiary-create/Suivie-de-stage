import { IsUUID } from 'class-validator';

export class SendStageReminderDto {
  @IsUUID()
  stageId: string;
}
