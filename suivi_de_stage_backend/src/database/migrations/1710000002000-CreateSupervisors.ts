import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSupervisors1710000002000 implements MigrationInterface {
  name = 'CreateSupervisors1710000002000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "supervisors" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "fonction" character varying(150) NOT NULL,
        "specialite" character varying(150) NOT NULL,
        "telephone" character varying(30),
        "user_id" uuid NOT NULL,
        "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "date_modification" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_supervisors_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_supervisors_user_id" UNIQUE ("user_id"),
        CONSTRAINT "FK_supervisors_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT
      )`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "supervisors"`);
  }
}
