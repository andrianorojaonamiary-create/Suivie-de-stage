import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInternships1710000004000 implements MigrationInterface {
  name = 'CreateInternships1710000004000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "internships_status_enum" AS ENUM ('A_VENIR', 'EN_COURS', 'TERMINE', 'SUSPENDU', 'ANNULE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "internships" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "student_id" uuid NOT NULL,
        "company_id" uuid NOT NULL,
        "supervisor_id" uuid NOT NULL,
        "intitule" character varying(200) NOT NULL,
        "description" text NOT NULL,
        "domaine" character varying(150) NOT NULL,
        "lieu" character varying(255) NOT NULL,
        "ville" character varying(100) NOT NULL,
        "latitude" numeric(10,7),
        "longitude" numeric(10,7),
        "date_debut" date NOT NULL,
        "date_fin" date NOT NULL,
        "statut" "internships_status_enum" NOT NULL DEFAULT 'A_VENIR',
        "observations" text,
        "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "date_modification" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "date_suppression" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_internships_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_internships_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_internships_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_internships_supervisor" FOREIGN KEY ("supervisor_id") REFERENCES "supervisors"("id") ON DELETE RESTRICT,
        CONSTRAINT "CHK_internships_dates" CHECK ("date_fin" >= "date_debut")
      )`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "internships"`);
    await queryRunner.query(`DROP TYPE "internships_status_enum"`);
  }
}
