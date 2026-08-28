import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProfessionalSituations1710000009000 implements MigrationInterface {
  name = 'CreateProfessionalSituations1710000009000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "professional_situations_type_enum" AS ENUM ('EMPLOYE', 'EN_RECHERCHE_EMPLOI', 'ENTREPRENEUR', 'POURSUITE_ETUDES', 'AUTRE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "professional_situations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "student_id" uuid NOT NULL,
        "situation" "professional_situations_type_enum" NOT NULL,
        "entreprise" character varying(200),
        "poste" character varying(150),
        "domaine" character varying(150),
        "ville" character varying(100),
        "pays" character varying(100),
        "date_debut" date,
        "date_fin" date,
        "description" text,
        "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "date_modification" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_professional_situations_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_professional_situations_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_professional_situations_student_date" ON "professional_situations" ("student_id", "date_creation")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_professional_situations_student_date"`,
    );
    await queryRunner.query(`DROP TABLE "professional_situations"`);
    await queryRunner.query(`DROP TYPE "professional_situations_type_enum"`);
  }
}
