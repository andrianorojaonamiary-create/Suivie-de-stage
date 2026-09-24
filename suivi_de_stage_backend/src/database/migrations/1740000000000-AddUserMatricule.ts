import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserMatricule1740000000000 implements MigrationInterface {
  name = 'AddUserMatricule1740000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.users
      ADD COLUMN IF NOT EXISTS matricule character varying(50)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.users
      DROP COLUMN IF EXISTS matricule
    `);
  }
}