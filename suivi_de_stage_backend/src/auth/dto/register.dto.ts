import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { StudentLevel } from '../../students/enums/student-level.enum';
import { Role } from '../../users/enums/role.enum';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const normalizeEmail = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

const normalizeUpperTrim = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed.toUpperCase();
};

// Accepte "ETUDIANT", "etudiant" ou "ROLE_ETUDIANT" et renvoie la valeur enum.
const normalizeRole = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim().toUpperCase();
  const normalized = trimmed.startsWith('ROLE_') ? trimmed.slice(5) : trimmed;
  return normalized === '' ? undefined : normalized;
};

/**
 * Rôles autorisés lors d'une inscription publique.
 * L'administrateur et l'entreprise ne sont jamais créables par auto-inscription.
 */
export const PUBLIC_REGISTRATION_ROLES: readonly Role[] = [
  Role.ETUDIANT,
  Role.ENCADREUR,
  Role.ENSEIGNANT,
];

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

  @ValidateIf((o: RegisterDto) =>
    [Role.ETUDIANT, Role.ENSEIGNANT].includes(o.role ?? Role.ETUDIANT),
  )
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  matricule?: string;

  @ValidateIf((o: RegisterDto) => (o.role ?? Role.ETUDIANT) === Role.ETUDIANT)
  @Transform(normalizeUpperTrim)
  @IsEnum(StudentLevel, {
    message: 'Le niveau doit être l’un des suivants : L1, L2, L3, M1, M2',
  })
  niveau?: StudentLevel;

  @ValidateIf((o: RegisterDto) => (o.role ?? Role.ETUDIANT) === Role.ETUDIANT)
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  formation?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @Length(2, 20)
  promotion?: string;

  @ValidateIf((o: RegisterDto) => o.role === Role.ENCADREUR)
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  fonction?: string;

  @ValidateIf((o: RegisterDto) =>
    [Role.ENCADREUR, Role.ENSEIGNANT].includes(o.role ?? Role.ETUDIANT),
  )
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  specialite?: string;

  @ValidateIf((o: RegisterDto) => o.role === Role.ENCADREUR)
  @Transform(trim)
  @IsOptional()
  @IsString()
  @Length(2, 150)
  entreprise?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  grade?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  departement?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  telephone?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  adresse?: string;
}
