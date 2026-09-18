import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateSupervisorDto {
  @IsUUID()
  userId: string;

  @Transform(trim)
  @IsString()
  @Length(2, 150)
  fonction: string;

  @Transform(trim)
  @IsString()
  @Length(2, 150)
  specialite: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @Length(5, 30)
  telephone?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @Length(2, 150)
  entreprise?: string;
}
