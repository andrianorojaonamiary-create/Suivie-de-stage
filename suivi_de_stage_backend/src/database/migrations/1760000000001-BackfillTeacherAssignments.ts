import { MigrationInterface, QueryRunner } from 'typeorm';

// ============================================================================
// Pre-remplit teacher_assignments a partir des affectations deja saisies par les
// etudiants sur leurs fiches de stage (internships.tuteur_id).
//
// Sans ce backfill, un etudiant qui avait deja choisi son tuteur pedagogique
// verrait un champ vide dans le nouveau selecteur, et l'administration
// devrait ressaisir manuellement chaque affectation.
//
// Regles appliquees :
//  - une ligne par couple (etudiant, tuteur) DISTINCT (un etudiant peut avoir
//    plusieurs stages portant le meme tuteur) ;
//  - le tuteur du stage le plus recent devient "principal" (ROW_NUMBER) ;
//  - les stages soft-deletes sont ignores ;
//  - les tuteur_id pointant vers un utilisateur qui n'est plus ENSEIGNANT sont
//    ignores (findTuteur les bloquait deja a la saisie).
//
// assigned_by est laisse a NULL : c'est le marqueur qui permet au down() de ne
// supprimer que les lignes de backfill, sans toucher les affectations creees
// ensuite par l'administrateur.
//
// Volume verifie sur db_suivi_stages avant ecriture : 2 lignes attendues.
// ============================================================================

export class BackfillTeacherAssignments1760000000001 implements MigrationInterface {
  name = 'BackfillTeacherAssignments1760000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      WITH src AS (
        SELECT
          i.student_id,
          i.tuteur_id,
          ROW_NUMBER() OVER (
            PARTITION BY i.student_id
            ORDER BY i.date_debut DESC NULLS LAST, i.date_creation DESC, i.id
          ) AS rn
        FROM public.internships i
        INNER JOIN public.users u
          ON u.id = i.tuteur_id
          AND u.role::text IN ('ENSEIGNANT', 'ROLE_ENSEIGNANT')
        WHERE i.tuteur_id IS NOT NULL
          AND i.date_suppression IS NULL
      ), dedup AS (
        SELECT DISTINCT ON (student_id, tuteur_id)
          student_id,
          tuteur_id,
          rn
        FROM src
        ORDER BY student_id, tuteur_id, rn
      )
      INSERT INTO public.teacher_assignments (
        student_id,
        teacher_id,
        principal,
        date_affectation,
        assigned_by,
        date_creation,
        date_modification
      )
      SELECT
        student_id,
        tuteur_id,
        (rn = 1),
        NOW(),
        NULL,
        NOW(),
        NOW()
      FROM dedup
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprime uniquement les lignes de backfill (assigned_by IS NULL).
    await queryRunner.query(
      'DELETE FROM public.teacher_assignments WHERE assigned_by IS NULL',
    );
  }
}
