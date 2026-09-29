import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Journal des affectations d'encadreur, au niveau du stage.
 *
 * L'affectation ne vit plus sur l'étudiant (students.encadreurId, conservé en
 * base mais plus utilisé pour ce cas d'usage) mais sur le stage : un étudiant
 * peut avoir un encadreur différent à chaque stage. Ce journal conserve la
 * trace complète — qui a affecté, quand, ancien et nouvel encadreur.
 *
 * Les contraintes suivent la convention de 1789000000000-SchemaInitial :
 * index nommés, FK nommées.
 */
export class InternshipSupervisorHistory1789100000000 implements MigrationInterface {
  name = 'InternshipSupervisorHistory1789100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "internship_supervisor_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "internship_id" uuid NOT NULL,
        "ancien_supervisor_id" uuid,
        "nouveau_supervisor_id" uuid NOT NULL,
        "affected_by_user_id" uuid NOT NULL,
        "date_affectation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_internship_supervisor_history" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_ish_internship_id" ON "internship_supervisor_history" ("internship_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ish_date_affectation" ON "internship_supervisor_history" ("date_affectation")`,
    );
    // Le journal disparaît avec le stage : il n'a pas de sens sans lui.
    await queryRunner.query(`
      ALTER TABLE "internship_supervisor_history"
        ADD CONSTRAINT "FK_ish_internship" FOREIGN KEY ("internship_id")
        REFERENCES "internships"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    // SET NULL, et non CASCADE : le journal doit survivre à la suppression
    // d'un encadreur, l'ancien identifiant restant lisible.
    await queryRunner.query(`
      ALTER TABLE "internship_supervisor_history"
        ADD CONSTRAINT "FK_ish_ancien_supervisor" FOREIGN KEY ("ancien_supervisor_id")
        REFERENCES "supervisors"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "internship_supervisor_history"
        ADD CONSTRAINT "FK_ish_nouveau_supervisor" FOREIGN KEY ("nouveau_supervisor_id")
        REFERENCES "supervisors"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "internship_supervisor_history"
        ADD CONSTRAINT "FK_ish_affected_by" FOREIGN KEY ("affected_by_user_id")
        REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "internship_supervisor_history" DROP CONSTRAINT "FK_ish_affected_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "internship_supervisor_history" DROP CONSTRAINT "FK_ish_nouveau_supervisor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "internship_supervisor_history" DROP CONSTRAINT "FK_ish_ancien_supervisor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "internship_supervisor_history" DROP CONSTRAINT "FK_ish_internship"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_ish_date_affectation"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ish_internship_id"`);
    await queryRunner.query(`DROP TABLE "internship_supervisor_history"`);
  }
}
