import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { Role } from '../../users/enums/role.enum';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const normalizeEmail = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

const normalizeRole = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') return value;
  let cleanRole = value.trim().toUpperCase();
  if (cleanRole.startsWith('ROLE_')) {
    cleanRole = cleanRole.replace('ROLE_', '');
  }
  if (cleanRole === 'ADMIN') {
    cleanRole = 'ADMINISTRATEUR';
  }
  return cleanRole;
};

export class RegisterDto {
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

  @Transform(normalizeEmail)
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  motDePasse: string;

  @Transform(normalizeRole)
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  matricule?: string;

  @IsOptional()
  @IsString()
  niveau?: string;

  @IsOptional()
  @IsString()
  filiere?: string;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  departement?: string;

  @IsOptional()
  @IsString()
  specialite?: string;

  @IsOptional()
  @IsString()
  entreprise?: string;

  @IsOptional()
  @IsString()
  poste?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  adresse?: string;
}

