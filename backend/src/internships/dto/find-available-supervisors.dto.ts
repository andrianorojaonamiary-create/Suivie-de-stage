import { IsOptional, IsUUID } from 'class-validator';

/**
 * Paramètres de GET /internships/encadreurs-disponibles.
 *
 * excludeInternshipId sert quand la page est la fiche d'un stage : le stage en
 * cours de modification ne doit pas compter dans la charge de l'encadreur
 * déjà affecté, sinon il apparaîtrait à 11/11 et serait proposé à tort.
 */
export class FindAvailableSupervisorsDto {
  @IsOptional()
  @IsUUID()
  excludeInternshipId?: string;
}
