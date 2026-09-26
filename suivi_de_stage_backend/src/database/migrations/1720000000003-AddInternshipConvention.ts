import { MigrationInterface, QueryRunner } from 'typeorm';

// Ajoute au stage le stockage de la convention de stage :
//  - convention : nom du fichier PDF déposé (dossier uploads/conventions)
export class AddInternshipConvention1720000000003 implements MigrationInterface {
  name = 'AddInternshipConvention1720000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE public.internships ADD COLUMN convention varchar(255)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE public.internships DROP COLUMN convention',
    );
  }
}
