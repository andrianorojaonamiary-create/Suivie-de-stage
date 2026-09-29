import { ConflictException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

/** Code SQLSTATE PostgreSQL signalant une violation de contrainte d'unicité. */
const UNIQUE_VIOLATION = '23505';

/**
 * Forme minimale de l'erreur renvoyée par le pilote `pg`. TypeORM n'expose pas
 * de type public pour le `driverError`, d'où cette interface locale.
 */
interface PostgresError {
  code?: string;
}

/**
 * Exécute `save` et traduit une violation d'unicité PostgreSQL (23505) en
 * `ConflictException(message)`.
 *
 * Chaque appelant fournit son propre message, car la formulation du conflit
 * dépend de la ressource concernée (email, matricule, couple évaluateur/stage…).
 * Toute autre erreur est propagée telle quelle, sans être enveloppée ni
 * modifiée, afin que les Services et le filtre d'exceptions la traitent comme si
 * le `save` avait été appelé directement.
 */
export async function saveCatchingConflict<T>(
  save: () => Promise<T>,
  message: string,
): Promise<T> {
  try {
    return await save();
  } catch (error) {
    if (
      error instanceof QueryFailedError &&
      (error.driverError as PostgresError | undefined)?.code ===
        UNIQUE_VIOLATION
    ) {
      throw new ConflictException(message);
    }
    throw error;
  }
}
