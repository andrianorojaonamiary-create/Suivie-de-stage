import { MigrationInterface, QueryRunner } from 'typeorm';

// ============================================================================
// internships.tuteur_id est filtre par CINQ scopes d'acces ENSEIGNANT, tous sur
// la forme WHERE tuteur_id = :actorId, sans qu'aucun index ne couvre la
// colonne (seuls PK_internships, IDX_internships_status et
// IDX_internships_dates existaient) :
//   - students.service.ts        applyAccessFilter   (liste des etudiants)
//   - internships.service.ts     applyAccessScope    (liste des stages)
//   - reports.service.ts         scope de relecture  (rapports)
//   - map.service.ts             scope de la carte
//   - evaluations.service.ts     ensureCanAccess
// ============================================================================

export class AddInternshipsTuteurIndex1760000000002 implements MigrationInterface {
  name = 'AddInternshipsTuteurIndex1760000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_internships_tuteur" ON public.internships ("tuteur_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS public."IDX_internships_tuteur"',
    );
  }
}
