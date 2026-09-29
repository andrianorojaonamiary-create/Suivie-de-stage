import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Schéma initial de la plateforme de suivi des stages.
 *
 * Les migrations précédentes (1710000000000-SchemaSuiviStages et
 * 1720000000000-PasswordReset) créaient un schéma français (utilisateurs,
 * etudiants, stages...) avec des enums en minuscules, alors que les entités
 * mappent des tables anglaises avec des enums en majuscules. Aucune de ces
 * tables n'existait donc côté application : le schéma réel avait été créé à la
 * main, hors dépôt. Cette migration réaligne la base sur les entités, qui
 * font désormais autorité.
 *
 * ATTENTION : elle suppose une base vide. Sur une base existante issue du
 * schéma précédent, DROP DATABASE puis npm run migration:run.
 *
 * Les unicités sont déclarées uniquement via des index nommés (CREATE UNIQUE
 * INDEX), et non via des contraintes UNIQUE inline dans le CREATE TABLE :
 * une contrainte UNIQUE crée déjà un index, et redéclarer le même nom
 * provoke une erreur 42P07 « relation existe déjà ». Les entités déclarent ces
 * unicités avec @Index(..., { unique: true }), que TypeORM modélise comme des
 * index nommés — d'où ce choix pour éviter tout écart entre migration et
 * synchronisation de schéma.
 */
export class SchemaInitial1789000000000 implements MigrationInterface {
  name = 'SchemaInitial1789000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('ETUDIANT', 'ENCADREUR', 'ENSEIGNANT', 'ENTREPRISE', 'ADMINISTRATEUR')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."students_academic_status_enum" AS ENUM('ACTIF', 'DIPLOME', 'SUSPENDU', 'ABANDONNE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."students_employment_status_enum" AS ENUM('NON_RENSEIGNE', 'EMPLOYE', 'RECHERCHE_EMPLOI')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."internships_status_enum" AS ENUM('A_VENIR', 'EN_COURS', 'TERMINE', 'SUSPENDU', 'ANNULE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."companies_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."evaluations_evaluator_type_enum" AS ENUM('ENCADREUR', 'ENTREPRISE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."follow_ups_type_enum" AS ENUM('OBSERVATION', 'ENTRETIEN', 'RAPPORT')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('STAGE_AFFECTE', 'STAGE_MODIFIE', 'STAGE_TERMINE', 'FIN_STAGE_PROCHE', 'EVALUATION', 'INFORMATION')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."professional_situations_type_enum" AS ENUM('EMPLOYE', 'EN_RECHERCHE_EMPLOI', 'ENTREPRENEUR', 'POURSUITE_ETUDES', 'AUTRE')`,
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nom" character varying(100) NOT NULL,
        "prenom" character varying(100) NOT NULL,
        "email" character varying(255) NOT NULL,
        "mot_de_passe" character varying(255) NOT NULL,
        "role" "users_role_enum" NOT NULL DEFAULT 'ETUDIANT',
        "actif" boolean NOT NULL DEFAULT true,
        "token_version" integer NOT NULL DEFAULT 0,
        "password_reset_token" character varying(255),
        "password_reset_expires_at" TIMESTAMP WITH TIME ZONE,
        "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "date_modification" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_users_email" ON "users" ("email")`,
    );

    await queryRunner.query(`
      CREATE TABLE "students" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "matricule" character varying(50) NOT NULL,
        "formation" character varying(150) NOT NULL,
        "niveau" character varying(100) NOT NULL,
        "promotion" character varying(20) NOT NULL,
        "telephone" character varying(30),
        "adresse" text,
        "statut_academique" "students_academic_status_enum" NOT NULL DEFAULT 'ACTIF',
        "situation_professionnelle" "students_employment_status_enum" NOT NULL DEFAULT 'NON_RENSEIGNE',
        "user_id" uuid NOT NULL,
        "encadreur_id" uuid,
        "entreprise_id" uuid,
        "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "date_modification" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "date_suppression" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_students" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_students_matricule" ON "students" ("matricule")`,
    );
    await queryRunner.query(
      `ALTER TABLE "students" ADD CONSTRAINT "UQ_students_user_id" UNIQUE ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_students_encadreur_id" ON "students" ("encadreur_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_students_entreprise_id" ON "students" ("entreprise_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "students"
        ADD CONSTRAINT "FK_students_user" FOREIGN KEY ("user_id")
        REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "students"
        ADD CONSTRAINT "FK_students_encadreur" FOREIGN KEY ("encadreur_id")
        REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "students"
        ADD CONSTRAINT "FK_students_entreprise" FOREIGN KEY ("entreprise_id")
        REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE TABLE "supervisors" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "fonction" character varying(150) NOT NULL,
        "specialite" character varying(150) NOT NULL,
        "telephone" character varying(30),
        "user_id" uuid NOT NULL,
        "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "date_modification" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_supervisors" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "supervisors" ADD CONSTRAINT "UQ_supervisors_user_id" UNIQUE ("user_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "supervisors"
        ADD CONSTRAINT "FK_supervisors_user" FOREIGN KEY ("user_id")
        REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE TABLE "companies" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
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
        CONSTRAINT "PK_companies" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_companies_email" ON "companies" ("email")`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "UQ_companies_user_id" UNIQUE ("user_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "companies"
        ADD CONSTRAINT "FK_companies_user" FOREIGN KEY ("user_id")
        REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE TABLE "internships" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
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
        CONSTRAINT "PK_internships" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_internships_status" ON "internships" ("statut")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_internships_dates" ON "internships" ("date_debut", "date_fin")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_internships_student_id" ON "internships" ("student_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_internships_company_id" ON "internships" ("company_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_internships_supervisor_id" ON "internships" ("supervisor_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "internships"
        ADD CONSTRAINT "FK_internships_student" FOREIGN KEY ("student_id")
        REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "internships"
        ADD CONSTRAINT "FK_internships_company" FOREIGN KEY ("company_id")
        REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "internships"
        ADD CONSTRAINT "FK_internships_supervisor" FOREIGN KEY ("supervisor_id")
        REFERENCES "supervisors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE TABLE "internship_follow_ups" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "internship_id" uuid NOT NULL,
        "author_id" uuid NOT NULL,
        "contenu" text NOT NULL,
        "date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "type" "follow_ups_type_enum" NOT NULL DEFAULT 'OBSERVATION',
        "date_modification" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_internship_follow_ups" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_follow_ups_internship_date" ON "internship_follow_ups" ("internship_id", "date")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_follow_ups_author_id" ON "internship_follow_ups" ("author_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "internship_follow_ups"
        ADD CONSTRAINT "FK_follow_ups_internship" FOREIGN KEY ("internship_id")
        REFERENCES "internships"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "internship_follow_ups"
        ADD CONSTRAINT "FK_follow_ups_author" FOREIGN KEY ("author_id")
        REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE TABLE "evaluations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "stage_id" uuid NOT NULL,
        "evaluateur_id" uuid NOT NULL,
        "type_evaluateur" "evaluations_evaluator_type_enum" NOT NULL,
        "note" numeric(4,2) NOT NULL,
        "commentaire" text,
        "observation" text,
        "appreciation_generale" text,
        "date_evaluation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "validee" boolean NOT NULL DEFAULT false,
        "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "date_modification" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_evaluations" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_evaluations_stage_evaluator_type" ON "evaluations" ("stage_id", "evaluateur_id", "type_evaluateur")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_evaluations_evaluateur_id" ON "evaluations" ("evaluateur_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "evaluations"
        ADD CONSTRAINT "FK_evaluations_internship" FOREIGN KEY ("stage_id")
        REFERENCES "internships"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "evaluations"
        ADD CONSTRAINT "FK_evaluations_evaluateur" FOREIGN KEY ("evaluateur_id")
        REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "utilisateur_destinataire_id" uuid NOT NULL,
        "type" "notifications_type_enum" NOT NULL,
        "titre" character varying(200) NOT NULL,
        "message" text NOT NULL,
        "lu" boolean NOT NULL DEFAULT false,
        "reference_id" uuid,
        "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_recipient_date" ON "notifications" ("utilisateur_destinataire_id", "date_creation")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_dedupe" ON "notifications" ("utilisateur_destinataire_id", "type", "reference_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "notifications"
        ADD CONSTRAINT "FK_notifications_recipient" FOREIGN KEY ("utilisateur_destinataire_id")
        REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE TABLE "professional_situations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
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
        CONSTRAINT "PK_professional_situations" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_professional_situations_student_date" ON "professional_situations" ("student_id", "date_creation")`,
    );
    await queryRunner.query(`
      ALTER TABLE "professional_situations"
        ADD CONSTRAINT "FK_professional_situations_student" FOREIGN KEY ("student_id")
        REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professional_situations" DROP CONSTRAINT "FK_professional_situations_student"`,
    );
    await queryRunner.query(`DROP TABLE "professional_situations"`);
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_recipient"`,
    );
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(
      `ALTER TABLE "evaluations" DROP CONSTRAINT "FK_evaluations_evaluateur"`,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluations" DROP CONSTRAINT "FK_evaluations_internship"`,
    );
    await queryRunner.query(`DROP TABLE "evaluations"`);
    await queryRunner.query(
      `ALTER TABLE "internship_follow_ups" DROP CONSTRAINT "FK_follow_ups_author"`,
    );
    await queryRunner.query(
      `ALTER TABLE "internship_follow_ups" DROP CONSTRAINT "FK_follow_ups_internship"`,
    );
    await queryRunner.query(`DROP TABLE "internship_follow_ups"`);
    await queryRunner.query(
      `ALTER TABLE "internships" DROP CONSTRAINT "FK_internships_supervisor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "internships" DROP CONSTRAINT "FK_internships_company"`,
    );
    await queryRunner.query(
      `ALTER TABLE "internships" DROP CONSTRAINT "FK_internships_student"`,
    );
    await queryRunner.query(`DROP TABLE "internships"`);
    await queryRunner.query(
      `ALTER TABLE "companies" DROP CONSTRAINT "FK_companies_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP CONSTRAINT "UQ_companies_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(
      `ALTER TABLE "supervisors" DROP CONSTRAINT "FK_supervisors_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervisors" DROP CONSTRAINT "UQ_supervisors_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "supervisors"`);
    await queryRunner.query(
      `ALTER TABLE "students" DROP CONSTRAINT "FK_students_entreprise"`,
    );
    await queryRunner.query(
      `ALTER TABLE "students" DROP CONSTRAINT "FK_students_encadreur"`,
    );
    await queryRunner.query(
      `ALTER TABLE "students" DROP CONSTRAINT "FK_students_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "students" DROP CONSTRAINT "UQ_students_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "students"`);
    await queryRunner.query(`DROP TABLE "users"`);

    await queryRunner.query(
      `DROP TYPE "public"."professional_situations_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."follow_ups_type_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."evaluations_evaluator_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."companies_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."internships_status_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."students_employment_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."students_academic_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
