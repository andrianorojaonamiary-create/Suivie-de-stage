import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { Role } from '../enums/role.enum';

const trim = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : (value as unknown);

export class CreateUserDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  nom: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  prenom: string;

  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.trim().toLowerCase() : (value as unknown),
  )
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  motDePasse: string;

  @IsEnum(Role)
  role: Role;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @Length(2, 50)
  matricule?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @Length(2, 100)
  grade?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @Length(2, 100)
  departement?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @Length(2, 150)
  specialite?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @Length(5, 30)
  telephone?: string;
}
