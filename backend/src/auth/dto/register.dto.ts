import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { StudentLevel } from '../../students/enums/student-level.enum';
import { StudentParcours } from '../../students/enums/student-parcours.enum';
import { Role } from '../../users/enums/role.enum';

/**
 * Rôles que l'inscription publique peut créer. ADMINISTRATEUR et ENTREPRISE en
 * sont exclus, voir le commentaire du champ role.
 */
export const SELF_REGISTRATION_ROLES = [
  Role.ETUDIANT,
  Role.ENSEIGNANT,
  Role.ENCADREUR,
] as const;

/**
 * Liste des filières affichée dans les messages d'erreur. Générée depuis l'enum
 * pour qu'une filière ajoutée n'exige pas de réécrire le message : la version
 * précédente annonçait 4 valeurs sur 13 et rejetait 8 filières sur 12.
 */
const PARCOURS_LISTE = Object.values(StudentParcours).join(', ');

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const normalizeEmail = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

/**
 * Le front envoie ROLE_ETUDIANT, l'enum Role contient ETUDIANT. On accepte les
 * deux écritures plutôt que d'imposer au client un format unique.
 */
const normalizeRole = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string'
    ? value.replace(/^ROLE_/, '').trim().toUpperCase()
    : value;

const normalizeUpperTrim = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed.toUpperCase();
};

/**
 * Chaîne vide = champ non renseigné.
 *
 * trim() seul laisserait passer '' et @Length le rejetterait avec un message
 * trompeur (« must be longer than 2 characters ») pour un champ que le
 * formulaire n'a simplement pas fait remplir. En le convertissant en undefined,
 * l'erreur remonte du service, qui la formule en français et sait à quel rôle
 * elle s'applique.
 */
const emptyToUndefined = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
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

  /**
   * Rôle demandé à l'inscription.
   *
   * ADMINISTRATEUR et ENTREPRISE en sont volontairement exclus :
   * - administrateur, parce que c'est le rôle qui accorde tous les autres ;
   * - entreprise, parce que companies exige secteurActivite, ville et region,
   *   que le formulaire ne collecte pas. Créer le compte sans la ligne
   *   companies produirait un profil inexploitable. Ces deux rôles restent
   *   accessibles à un administrateur via POST /users.
   */
  @Transform(normalizeRole)
  @IsOptional()
  @IsIn(SELF_REGISTRATION_ROLES, {
    message:
      'Le rôle doit être l’un des suivants : ETUDIANT, ENSEIGNANT, ENCADREUR',
  })
  role: Role = Role.ETUDIANT;

  @IsOptional()
  @IsString()
  matricule?: string;

  /**
   * Obligatoire pour un ETUDIANT, ignoré pour les autres rôles. Validé
   * optionnellement ici, puis contrôlé par le service selon le rôle : le
   * rendre obligatoire ici rejetterait aussi les enseignants et encadreurs, qui
   * n'ont pas de promotion à renseigner.
   */
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @Length(2, 20)
  promotion?: string;

  @Transform(normalizeUpperTrim)
  @IsOptional()
  @IsEnum(StudentLevel, {
    message: `Le niveau doit être l’un des suivants : ${Object.values(StudentLevel).join(', ')}`,
  })
  niveau?: StudentLevel;

  @Transform(normalizeUpperTrim)
  @IsOptional()
  @IsEnum(StudentParcours, {
    message: `Le parcours doit être l’un des suivants : ${PARCOURS_LISTE}`,
  })
  parcours?: StudentParcours;

  @Transform(normalizeUpperTrim)
  @IsOptional()
  @IsEnum(StudentParcours, {
    message: `La filière doit être l’une des suivantes : ${PARCOURS_LISTE}`,
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
