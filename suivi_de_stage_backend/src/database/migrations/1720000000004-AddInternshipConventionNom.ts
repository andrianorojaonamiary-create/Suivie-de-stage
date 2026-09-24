import { MigrationInterface, QueryRunner } from 'typeorm';

// Stocke le nom d'origine du fichier de convention (affichage / téléchargement)
// alors que la colonne convention conserve un nom disque unique (UUID.pdf).
export class AddInternshipConventionNom1720000000004 implements MigrationInterface {
  name = 'AddInternshipConventionNom1720000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE public.internships ADD COLUMN convention_nom varchar(255)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE public.internships DROP COLUMN convention_nom',
    );
  }
}
