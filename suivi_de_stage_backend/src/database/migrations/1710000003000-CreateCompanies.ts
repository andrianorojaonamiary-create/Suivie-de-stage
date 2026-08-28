import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompanies1710000003000 implements MigrationInterface {
  name = 'CreateCompanies1710000003000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "companies_status_enum" AS ENUM ('ACTIVE', 'INACTIVE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "companies" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "nom" character varying(150) NOT NULL,
        "description" text,
        "secteur_activite" character varying(150) NOT NULL,
        "adresse" character varying(255) NOT NULL,
        "ville" character varying(100) NOT NULL,
        "region" character varying(100) NOT NULL,
        "telephone" character varying(30),
        "email" character varying(255) NOT NULL,
        "site_web" character varying(255),
        "latitude" numeric(10,7),
        "longitude" numeric(10,7),
        "statut" "companies_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "user_id" uuid NOT NULL,
        "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "date_modification" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_companies_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_companies_user_id" UNIQUE ("user_id"),
        CONSTRAINT "UQ_companies_email" UNIQUE ("email"),
        CONSTRAINT "FK_companies_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_companies_nom" ON "companies" ("nom")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_companies_ville_region" ON "companies" ("ville", "region")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_companies_ville_region"`);
    await queryRunner.query(`DROP INDEX "IDX_companies_nom"`);
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(`DROP TYPE "companies_status_enum"`);
  }
}
