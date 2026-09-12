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
import { StudentLevel } from '../../students/enums/student-level.enum';
import { StudentParcours } from '../../students/enums/student-parcours.enum';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const normalizeEmail = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

const normalizeUpperTrim = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed.toUpperCase();
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

  // role retiré de l'inscription publique pour éviter l'élévation de privilège
  // L'inscription force ETUDIANT côté serveur. Les rôles admin/enseignant/encadreur
  // doivent être créés via POST /users par un ADMINISTRATEUR.

  @IsOptional()
  @IsString()
  matricule?: string;

  @Transform(normalizeUpperTrim)
  @IsOptional()
  @IsEnum(StudentLevel, {
    message: 'Le niveau doit être l’un des suivants : L1, L2, L3, M1, M2',
  })
  niveau?: StudentLevel;

  @Transform(normalizeUpperTrim)
  @IsOptional()
  @IsEnum(StudentParcours, {
    message: 'Le parcours doit être l’un des suivants : DA2I, ICM, AES, CIGSI',
  })
  parcours?: StudentParcours;

  @Transform(normalizeUpperTrim)
  @IsOptional()
  @IsEnum(StudentParcours, {
    message:
      'La filière/parcours doit être l’un(e) des suivant(e)s : DA2I, ICM, AES, CIGSI',
  })
  filiere?: StudentParcours;

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
