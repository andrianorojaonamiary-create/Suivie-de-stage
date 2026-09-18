import { MigrationInterface, QueryRunner } from 'typeorm';

// Workflow de validation des stages (étudiant → encadreur)
// Ajoute les statuts EN_ATTENTE (soumission étudiant) et REFUSE (rejet encadreur).
export class AddStageValidationStatuses1720000000000 implements MigrationInterface {
  name = 'AddStageValidationStatuses1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE public.internships_status_enum ADD VALUE IF NOT EXISTS 'EN_ATTENTE'`,
    );
    await queryRunner.query(
      `ALTER TYPE public.internships_status_enum ADD VALUE IF NOT EXISTS 'REFUSE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE public.internships_status_enum DROP VALUE IF EXISTS 'REFUSE'`,
    );
    await queryRunner.query(
      `ALTER TYPE public.internships_status_enum DROP VALUE IF EXISTS 'EN_ATTENTE'`,
    );
  }
}
