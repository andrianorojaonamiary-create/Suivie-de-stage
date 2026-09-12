import { MigrationInterface, QueryRunner } from 'typeorm';

// Ajoute les colonnes de réinitialisation de mot de passe.
// La table `users` n'est pas créée par la migration initiale (celle-ci cible
// `utilisateurs`), on applique donc les ALTER avec une garde d'existence pour
// éviter les erreurs selon le schéma réellement en base.
export class PasswordReset1720000000000 implements MigrationInterface {
  name = 'PasswordReset1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'users'
            AND column_name = 'password_reset_token'
        ) THEN
          ALTER TABLE public.users
            ADD COLUMN "password_reset_token" character varying(255);
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'users'
            AND column_name = 'password_reset_expires_at'
        ) THEN
          ALTER TABLE public.users
            ADD COLUMN "password_reset_expires_at" timestamp with time zone;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE public.users DROP COLUMN IF EXISTS "password_reset_token"',
    );
    await queryRunner.query(
      'ALTER TABLE public.users DROP COLUMN IF EXISTS "password_reset_expires_at"',
    );
  }
}
