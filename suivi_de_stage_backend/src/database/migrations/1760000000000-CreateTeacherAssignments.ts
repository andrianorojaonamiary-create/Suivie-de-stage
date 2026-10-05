import { MigrationInterface, QueryRunner } from 'typeorm';

// ============================================================================
// Table de jonction "affectation" entre un etudiant et un tuteur pedagogique.
//
// Jusqu'ici le lien enseignant <-> etudiant n'existait que de maniere implicite
// via internships.tuteur_id. Consequence : impossible d'affecter un tuteur a un
// etudiant qui n'a pas encore de stage, et l'administrateur n'avait aucun moyen
// de gerer ces affectations depuis l'interface.
//
// Cette table est donc la source de verite des affectations ; elle est
// independante du stage. Le tuteur "principal" d'un etudiant alimente
// automatiquement internships.tuteur_id (voir le backfill ci-dessous et
// TeacherAssignmentsService.syncInternshipsTuteur).
//
// Cardinalite N : N (co-tuteurs possibles), avec une cloture par date_fin
// afin de conserver l'historique des remplacements.
//
// Note : synchronize est a false, cette migration est obligatoire.
// Cible de developpement verifiee : db_suivi_stages
// ============================================================================

export class CreateTeacherAssignments1760000000000 implements MigrationInterface {
  name = 'CreateTeacherAssignments1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE public.teacher_assignments (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        student_id uuid NOT NULL,
        teacher_id uuid NOT NULL,
        principal boolean NOT NULL DEFAULT false,
        date_affectation timestamp with time zone NOT NULL DEFAULT now(),
        date_fin timestamp with time zone,
        assigned_by uuid,
        date_creation timestamp with time zone NOT NULL DEFAULT now(),
        date_modification timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "PK_teacher_assignments" PRIMARY KEY (id),
        CONSTRAINT "FK_teacher_assignments_student"
          FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
        CONSTRAINT "FK_teacher_assignments_teacher"
          FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE,
        CONSTRAINT "FK_teacher_assignments_assigned_by"
          FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE SET NULL,
        CONSTRAINT "CHK_teacher_assignments_dates"
          CHECK (date_fin IS NULL OR date_fin >= date_affectation)
      )
    `);

    // Un seul tuteur principal actif par etudiant.
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_teacher_assignments_principal"
        ON public.teacher_assignments (student_id)
        WHERE principal = true AND date_fin IS NULL
    `);

    // Pas de doublon actif pour un meme couple (etudiant, enseignant).
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_teacher_assignments_active"
        ON public.teacher_assignments (student_id, teacher_id)
        WHERE date_fin IS NULL
    `);

    // Les pages admin et les listes d'un enseignant filtrent par teacher_id.
    await queryRunner.query(`
      CREATE INDEX "IDX_teacher_assignments_teacher"
        ON public.teacher_assignments (teacher_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS public.teacher_assignments
    `);
  }
}
