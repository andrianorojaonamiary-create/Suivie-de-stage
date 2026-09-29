import { Transform } from 'class-transformer';
import { IsEnum, IsString, Length } from 'class-validator';
import { FollowUpType } from '../enums/follow-up-type.enum';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateFollowUpDto {
  @Transform(trim)
  @IsString()
  @Length(2, 5000)
  contenu: string;

  @IsEnum(FollowUpType)
  type: FollowUpType;
}
