import { MigrationInterface, QueryRunner } from 'typeorm';

// Ajoute au stage les deux encadreurs du formulaire étudiant :
//  - tuteur_id : encadreur pédagogique (utilisateur role ENSEIGNANT)
//  - encadreur_professionnel_nom : nom libre saisi quand l'encadreur
//    professionnel n'a pas encore de compte (supervisor_id devient alors
//    nullable).
export class AddEncadreurFieldsToInternships1720000000002 implements MigrationInterface {
  name = 'AddEncadreurFieldsToInternships1720000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE public.internships ADD COLUMN tuteur_id uuid',
    );
    await queryRunner.query(
      'ALTER TABLE public.internships ADD COLUMN encadreur_professionnel_nom varchar(200)',
    );
    await queryRunner.query(
      'ALTER TABLE public.internships ADD CONSTRAINT "FK_internships_tuteur" FOREIGN KEY (tuteur_id) REFERENCES public.users(id) ON DELETE SET NULL',
    );
    await queryRunner.query(
      'ALTER TABLE public.internships ALTER COLUMN supervisor_id DROP NOT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Need supervisor_id NOT NULL again: neutral columns first so no row is orphan.
    await queryRunner.query(
      'DELETE FROM public.internships WHERE supervisor_id IS NULL',
    );
    await queryRunner.query(
      'ALTER TABLE public.internships ALTER COLUMN supervisor_id SET NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE public.internships DROP CONSTRAINT "FK_internships_tuteur"',
    );
    await queryRunner.query(
      'ALTER TABLE public.internships DROP COLUMN encadreur_professionnel_nom',
    );
    await queryRunner.query(
      'ALTER TABLE public.internships DROP COLUMN tuteur_id',
    );
  }
}
