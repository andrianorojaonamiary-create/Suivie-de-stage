import { MigrationInterface, QueryRunner } from 'typeorm';

// Aligne le modèle « situation professionnelle » sur le formulaire étudiant
// « Mon avenir » (type de contrat, statut académique, date de diplôme).
export class AddProfessionalSituationFields1720000000001 implements MigrationInterface {
  name = 'AddProfessionalSituationFields1720000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE public.professional_situations ADD COLUMN type_contrat varchar(50)',
    );
    await queryRunner.query(
      'ALTER TABLE public.professional_situations ADD COLUMN statut_academique varchar(50)',
    );
    await queryRunner.query(
      'ALTER TABLE public.professional_situations ADD COLUMN date_diplome date',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE public.professional_situations DROP COLUMN date_diplome',
    );
    await queryRunner.query(
      'ALTER TABLE public.professional_situations DROP COLUMN statut_academique',
    );
    await queryRunner.query(
      'ALTER TABLE public.professional_situations DROP COLUMN type_contrat',
    );
  }
}
