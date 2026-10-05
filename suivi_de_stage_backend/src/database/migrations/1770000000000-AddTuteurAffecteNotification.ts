import { MigrationInterface, QueryRunner } from 'typeorm';

// ============================================================================
// Ajoute le type de notification TUTEUR_AFFECTE, envoye a l'etudiant lorsque
// l'administration lui affecte un tuteur pedagogique.
//
// Migration isolee volontairement : PostgreSQL interdit d'utiliser une valeur
// d'enum dans la meme transaction que son ALTER TYPE ADD VALUE. C'est la meme
// raison qui a impose l'isolement de AddNewUserRegistrationNotifications1750000000000.
// ============================================================================

export class AddTuteurAffecteNotification1770000000000 implements MigrationInterface {
  name = 'AddTuteurAffecteNotification1770000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE public.notifications_type_enum ADD VALUE IF NOT EXISTS 'TUTEUR_AFFECTE';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM public.notifications WHERE type = 'TUTEUR_AFFECTE'`,
    );
  }
}
