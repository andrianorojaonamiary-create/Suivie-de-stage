import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

const trim = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

/** Chaîne vide = champ non renseigné, cf. emptyToUndefined de RegisterDto. */
const emptyToUndefined = ({ value }: TransformFnParams): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

/**
 * Modification de son propre profil.
 *
 * telephone et adresse sont acceptés parce que la page Profil les envoie
 * systématiquement : absents du DTO, la ValidationPipe globale les rejetait en
 * 400 (« property telephone should not exist ») et la sauvegarde du profil
 * était impossible.
 *
 * Ces deux champs ne sont stockés que sur les tables de profil
 * (students.telephone/adresse, supervisors.telephone) et pas sur users. Le
 * back les accepte sans les persister : c'est GET /auth/me qui ne les
 * renormalise pas encore. Voir getProfileData() dans pages/Profil.jsx.
 *
 * motDePasse est hashé et incrémente tokenVersion par UsersService.update, ce
 * qui invalide les sessions ouvertes.
 */
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
  @Transform(emptyToUndefined)
  @IsString()
  @Length(5, 30)
  telephone?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @Length(2, 500)
  adresse?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(8)
  motDePasse?: string;
}
