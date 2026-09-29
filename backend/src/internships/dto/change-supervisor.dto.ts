import { IsUUID } from 'class-validator';

/**
 * Changement d'encadreur d'un stage.
 *
 * supervisorId n'est jamais optionnel : la règle métier interdit de retirer
 * un encadreur sans le remplacer, donc un corps vide est invalide par design.
 */
export class ChangeSupervisorDto {
  @IsUUID()
  supervisorId: string;
}
