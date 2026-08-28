import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStudentEmploymentStatus1710000008000 implements MigrationInterface {
  name = 'AddStudentEmploymentStatus1710000008000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "students_employment_status_enum" AS ENUM ('NON_RENSEIGNE', 'EMPLOYE', 'RECHERCHE_EMPLOI')`,
    );
    await queryRunner.query(
      `ALTER TABLE "students" ADD "situation_professionnelle" "students_employment_status_enum" NOT NULL DEFAULT 'NON_RENSEIGNE'`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "students" DROP COLUMN "situation_professionnelle"`,
    );
    await queryRunner.query(`DROP TYPE "students_employment_status_enum"`);
  }
}
