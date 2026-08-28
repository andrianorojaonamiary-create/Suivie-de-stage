import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStudents1710000001000 implements MigrationInterface {
  name = 'CreateStudents1710000001000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "students_academic_status_enum" AS ENUM ('ACTIF', 'DIPLOME', 'SUSPENDU', 'ABANDONNE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "students" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "matricule" character varying(50) NOT NULL,
        "formation" character varying(150) NOT NULL,
        "niveau" character varying(100) NOT NULL,
        "promotion" character varying(20) NOT NULL,
        "telephone" character varying(30),
        "adresse" text,
        "statut_academique" "students_academic_status_enum" NOT NULL DEFAULT 'ACTIF',
        "user_id" uuid NOT NULL,
        "encadreur_id" uuid,
        "entreprise_id" uuid,
        "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "date_modification" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "date_suppression" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_students_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_students_matricule" UNIQUE ("matricule"),
        CONSTRAINT "UQ_students_user_id" UNIQUE ("user_id"),
        CONSTRAINT "FK_students_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_students_encadreur" FOREIGN KEY ("encadreur_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_students_entreprise" FOREIGN KEY ("entreprise_id") REFERENCES "users"("id") ON DELETE SET NULL
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_students_formation" ON "students" ("formation")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_students_promotion" ON "students" ("promotion")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_students_promotion"`);
    await queryRunner.query(`DROP INDEX "IDX_students_formation"`);
    await queryRunner.query(`DROP TABLE "students"`);
    await queryRunner.query(`DROP TYPE "students_academic_status_enum"`);
  }
}
