import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMotDePasseChangeAt1710000000000 implements MigrationInterface {
  name = 'AddMotDePasseChangeAt1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE public.users ADD COLUMN mot_de_passe_change_at timestamp with time zone',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE public.users DROP COLUMN mot_de_passe_change_at',
    );
  }
}
