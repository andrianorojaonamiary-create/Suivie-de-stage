import { MigrationInterface, QueryRunner } from 'typeorm';

// ============================================================================
// Passe de « N tuteurs, dont un principal » a « un seul tuteur actif ».
//
// Le drapeau "principal" etait surcroi : la feature retenue est un tuteur
// pedagogique unique par etudiant. La garantie est desormais portee par un
// index unique partiel sur (student_id) WHERE date_fin IS NULL, qui remplace
// UQ_teacher_assignments_principal.
//
// Consequences :
//  - l'API d'affectation refuse (409) d'ajouter un tuteur a un etudiant qui en
//    a deja un actif ; l'administrateur clôture l'affectation precedente avant
//    d'en creer une nouvelle (l'historique reste dans la table via date_fin) ;
//  - UQ_teacher_assignments_active (student_id, teacher_id) devient redondant,
//    un index unique sur student_id l'implique : on le retire plutot que de
//    laisser deux index qui se recouvrent.
//
// Note synchronize est a false, cette migration est obligatoire.
// Cible de developpement verifiee : db_suivi_stages
// ============================================================================

export class RemoveTeacherAssignmentPrincipal1780000000000 implements MigrationInterface {
  name = 'RemoveTeacherAssignmentPrincipal1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Garde-fou : cloture des affectations actives surnumeraires avant de poser
    // l'index unique. Sans ce.etape, l'echec viendrait de la creation de
    // l'index. GREATEST(now(), date_affectation) respecte la contrainte CHECK
    // CHK_teacher_assignments_dates.
    await queryRunner.query(`
      WITH ranked AS (
        SELECT
          id,
          row_number() OVER (
            PARTITION BY student_id
            ORDER BY date_affectation DESC, date_creation DESC
          ) AS rn
        FROM public.teacher_assignments
        WHERE date_fin IS NULL
      )
      UPDATE public.teacher_assignments AS ta
      SET date_fin = GREATEST(now(), ta.date_affectation)
      FROM ranked AS r
      WHERE ta.id = r.id AND r.rn > 1
    `);

    // L'index repose sur la colonne qui disparait : on le supprime d'abord.
    await queryRunner.query(
      `DROP INDEX IF EXISTS public."UQ_teacher_assignments_principal"`,
    );

    await queryRunner.query(
      `ALTER TABLE public.teacher_assignments DROP COLUMN IF EXISTS principal`,
    );

    // Redondant avec le nouvel index unique sur (student_id).
    await queryRunner.query(
      `DROP INDEX IF EXISTS public."UQ_teacher_assignments_active"`,
    );

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_teacher_assignments_one_active"
        ON public.teacher_assignments (student_id)
        WHERE date_fin IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.teacher_assignments
        ADD COLUMN IF NOT EXISTS principal boolean NOT NULL DEFAULT false
    `);

    // L'affectation active la plus recente de chaque etudiant redevient
    // "principal", ce qui reste coherent avec UQ_teacher_assignments_principal.
    await queryRunner.query(`
      UPDATE public.teacher_assignments AS ta
      SET principal = true
      WHERE ta.date_fin IS NULL
        AND ta.id = (
          SELECT x.id
          FROM public.teacher_assignments AS x
          WHERE x.student_id = ta.student_id AND x.date_fin IS NULL
          ORDER BY x.date_affectation DESC, x.date_creation DESC
          LIMIT 1
        )
    `);

    await queryRunner.query(
      `DROP INDEX IF EXISTS public."UQ_teacher_assignments_one_active"`,
    );

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_teacher_assignments_principal"
        ON public.teacher_assignments (student_id)
        WHERE principal = true AND date_fin IS NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_teacher_assignments_active"
        ON public.teacher_assignments (student_id, teacher_id)
        WHERE date_fin IS NULL
    `);

    // Le modele "principal" alimentait internships.tuteur_id : on re-aligne les
    // stages sur le principal retrouve, sinon le downgrade laisserait des stages
    // pointant sur l'ancien tuteur.
    await queryRunner.query(`
      UPDATE public.internships AS i
      SET tuteur_id = ta.teacher_id
      FROM public.teacher_assignments AS ta
      WHERE ta.student_id = i.student_id
        AND ta.principal = true
        AND i.date_suppression IS NULL
        AND i.tuteur_id IS DISTINCT FROM ta.teacher_id
    `);
  }
}
