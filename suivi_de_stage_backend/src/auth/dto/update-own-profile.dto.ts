import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

const trim = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateOwnProfileDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @Length(2, 100)
  nom?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @Length(2, 100)
  prenom?: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @Length(2, 100)
  grade?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @Length(2, 100)
  departement?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @Length(2, 150)
  specialite?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @Length(5, 30)
  telephone?: string;
}
