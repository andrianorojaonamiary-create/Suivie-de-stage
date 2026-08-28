import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotifications1710000007000 implements MigrationInterface {
  name = 'CreateNotifications1710000007000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "notifications_type_enum" AS ENUM ('STAGE_AFFECTE', 'STAGE_MODIFIE', 'STAGE_TERMINE', 'FIN_STAGE_PROCHE', 'EVALUATION', 'INFORMATION')`,
    );
    await queryRunner.query(`CREATE TABLE "notifications" (
      "id" uuid NOT NULL DEFAULT gen_random_uuid(),
      "utilisateur_destinataire_id" uuid NOT NULL,
      "type" "notifications_type_enum" NOT NULL,
      "titre" character varying(200) NOT NULL,
      "message" text NOT NULL,
      "lu" boolean NOT NULL DEFAULT false,
      "reference_id" uuid,
      "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id"),
      CONSTRAINT "FK_notifications_user" FOREIGN KEY ("utilisateur_destinataire_id") REFERENCES "users"("id") ON DELETE CASCADE
    )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_recipient_date" ON "notifications" ("utilisateur_destinataire_id", "date_creation")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_dedupe" ON "notifications" ("utilisateur_destinataire_id", "type", "reference_id")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_notifications_dedupe"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_recipient_date"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "notifications_type_enum"`);
  }
}
