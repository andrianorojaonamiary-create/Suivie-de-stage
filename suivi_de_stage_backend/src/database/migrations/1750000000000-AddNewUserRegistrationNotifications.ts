import { MigrationInterface, QueryRunner } from 'typeorm';

// ============================================================================
// Ajoute le type de notification NOUVEL_INSCRIT :
//  - permet de notifier les administrateurs quand un utilisateur crée un compte
//    sur la plateforme (inscription publique).
// ============================================================================

export class AddNewUserRegistrationNotifications1750000000000 implements MigrationInterface {
  name = 'AddNewUserRegistrationNotifications1750000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE public.notifications_type_enum ADD VALUE IF NOT EXISTS 'NOUVEL_INSCRIT';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM public.notifications WHERE type = 'NOUVEL_INSCRIT'`,
    );
  }
}
