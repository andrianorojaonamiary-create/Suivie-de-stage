import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEvaluationGeneralAppreciation1710000010000 implements MigrationInterface {
  name = 'AddEvaluationGeneralAppreciation1710000010000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "evaluations" ADD "appreciation_generale" text',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "evaluations" DROP COLUMN "appreciation_generale"',
    );
  }
}
