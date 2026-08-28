import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEvaluations1710000006000 implements MigrationInterface {
  name = 'CreateEvaluations1710000006000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "evaluations_evaluator_type_enum" AS ENUM ('ENCADREUR', 'ENTREPRISE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "evaluations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "stage_id" uuid NOT NULL,
        "evaluateur_id" uuid NOT NULL,
        "type_evaluateur" "evaluations_evaluator_type_enum" NOT NULL,
        "note" numeric(4,2) NOT NULL,
        "commentaire" text,
        "observation" text,
        "date_evaluation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "validee" boolean NOT NULL DEFAULT false,
        "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "date_modification" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_evaluations_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_evaluations_stage_evaluator_type" UNIQUE ("stage_id", "evaluateur_id", "type_evaluateur"),
        CONSTRAINT "CHK_evaluations_note" CHECK ("note" >= 0 AND "note" <= 20),
        CONSTRAINT "FK_evaluations_stage" FOREIGN KEY ("stage_id") REFERENCES "internships"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_evaluations_evaluateur" FOREIGN KEY ("evaluateur_id") REFERENCES "users"("id") ON DELETE RESTRICT
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_evaluations_stage_date" ON "evaluations" ("stage_id", "date_evaluation")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_evaluations_stage_date"`);
    await queryRunner.query(`DROP TABLE "evaluations"`);
    await queryRunner.query(`DROP TYPE "evaluations_evaluator_type_enum"`);
  }
}
