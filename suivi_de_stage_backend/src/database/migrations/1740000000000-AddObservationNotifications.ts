import { MigrationInterface, QueryRunner } from 'typeorm';

// ============================================================================
// Ajoute le type de notification OBSERVATION :
//  - permet de notifier l'étudiant quand son encadreur ajoute une observation
//    à son stage (suivi de type OBSERVATION).
// ============================================================================

export class AddObservationNotifications1740000000000
  implements MigrationInterface
{
  name = 'AddObservationNotifications1740000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE public.notifications_type_enum ADD VALUE IF NOT EXISTS 'OBSERVATION';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM public.notifications WHERE type = 'OBSERVATION'`,
    );
  }
}