import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInternshipFollowUps1710000005000 implements MigrationInterface {
  name = 'CreateInternshipFollowUps1710000005000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "follow_ups_type_enum" AS ENUM ('OBSERVATION', 'ENTRETIEN', 'RAPPORT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "internship_follow_ups" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "internship_id" uuid NOT NULL,
        "author_id" uuid NOT NULL,
        "contenu" text NOT NULL,
        "date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "type" "follow_ups_type_enum" NOT NULL DEFAULT 'OBSERVATION',
        "date_modification" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_follow_ups_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_follow_ups_internship" FOREIGN KEY ("internship_id") REFERENCES "internships"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_follow_ups_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_follow_ups_internship_date" ON "internship_follow_ups" ("internship_id", "date")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_follow_ups_internship_date"`);
    await queryRunner.query(`DROP TABLE "internship_follow_ups"`);
    await queryRunner.query(`DROP TYPE "follow_ups_type_enum"`);
  }
}
