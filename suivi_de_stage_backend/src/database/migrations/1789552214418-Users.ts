import { MigrationInterface, QueryRunner } from "typeorm";

export class Users1789552214418 implements MigrationInterface {
    name = 'Users1789552214418'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ETUDIANT', 'ENCADREUR', 'ENSEIGNANT', 'ENTREPRISE', 'ADMINISTRATEUR')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nom" character varying(100) NOT NULL, "prenom" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "mot_de_passe" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'ETUDIANT', "actif" boolean NOT NULL DEFAULT true, "password_reset_token" character varying(255), "password_reset_expires_at" TIMESTAMP WITH TIME ZONE, "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "date_modification" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_users_email" ON "users" ("email") `);
        await queryRunner.query(`CREATE TYPE "public"."companies_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(`CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nom" character varying(150) NOT NULL, "description" text, "secteur_activite" character varying(150) NOT NULL, "adresse" character varying(255) NOT NULL, "ville" character varying(100) NOT NULL, "region" character varying(100) NOT NULL, "telephone" character varying(30), "email" character varying(255) NOT NULL, "site_web" character varying(255), "latitude" numeric(10,7), "longitude" numeric(10,7), "statut" "public"."companies_status_enum" NOT NULL DEFAULT 'ACTIVE', "user_id" uuid NOT NULL, "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "date_modification" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_ee0839cba07cb0c52602021ad4" UNIQUE ("user_id"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_companies_email" ON "companies" ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_companies_user_id" ON "companies" ("user_id") `);
        await queryRunner.query(`CREATE TYPE "public"."professional_situations_type_enum" AS ENUM('EMPLOYE', 'EN_RECHERCHE_EMPLOI', 'ENTREPRENEUR', 'POURSUITE_ETUDES', 'AUTRE')`);
        await queryRunner.query(`CREATE TABLE "professional_situations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "student_id" uuid NOT NULL, "situation" "public"."professional_situations_type_enum" NOT NULL, "entreprise" character varying(200), "poste" character varying(150), "domaine" character varying(150), "ville" character varying(100), "pays" character varying(100), "date_debut" date, "date_fin" date, "description" text, "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "date_modification" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0b678a988337b338f3d2c502668" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_professional_situations_student_date" ON "professional_situations" ("student_id", "date_creation") `);
        await queryRunner.query(`CREATE TYPE "public"."students_academic_status_enum" AS ENUM('ACTIF', 'DIPLOME', 'SUSPENDU', 'ABANDONNE')`);
        await queryRunner.query(`CREATE TYPE "public"."students_employment_status_enum" AS ENUM('NON_RENSEIGNE', 'EMPLOYE', 'RECHERCHE_EMPLOI')`);
        await queryRunner.query(`CREATE TABLE "students" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "matricule" character varying(50) NOT NULL, "formation" character varying(150) NOT NULL, "niveau" character varying(100) NOT NULL, "promotion" character varying(20) NOT NULL, "telephone" character varying(30), "adresse" text, "statut_academique" "public"."students_academic_status_enum" NOT NULL DEFAULT 'ACTIF', "situation_professionnelle" "public"."students_employment_status_enum" NOT NULL DEFAULT 'NON_RENSEIGNE', "user_id" uuid NOT NULL, "encadreur_id" uuid, "entreprise_id" uuid, "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "date_modification" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "date_suppression" TIMESTAMP WITH TIME ZONE, CONSTRAINT "REL_fb3eff90b11bddf7285f9b4e28" UNIQUE ("user_id"), CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_students_user_id" ON "students" ("user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_students_matricule" ON "students" ("matricule") `);
        await queryRunner.query(`CREATE TYPE "public"."internships_status_enum" AS ENUM('A_VENIR', 'EN_COURS', 'TERMINE', 'SUSPENDU', 'ANNULE')`);
        await queryRunner.query(`CREATE TABLE "internships" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "student_id" uuid NOT NULL, "company_id" uuid NOT NULL, "supervisor_id" uuid NOT NULL, "intitule" character varying(200) NOT NULL, "description" text NOT NULL, "domaine" character varying(150) NOT NULL, "lieu" character varying(255) NOT NULL, "ville" character varying(100) NOT NULL, "latitude" numeric(10,7), "longitude" numeric(10,7), "date_debut" date NOT NULL, "date_fin" date NOT NULL, "statut" "public"."internships_status_enum" NOT NULL DEFAULT 'A_VENIR', "observations" text, "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "date_modification" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "date_suppression" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_0a44e3c9dde1f2b92a4eb3c529f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_internships_dates" ON "internships" ("date_debut", "date_fin") `);
        await queryRunner.query(`CREATE INDEX "IDX_internships_status" ON "internships" ("statut") `);
        await queryRunner.query(`CREATE TABLE "supervisors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fonction" character varying(150) NOT NULL, "specialite" character varying(150) NOT NULL, "telephone" character varying(30), "user_id" uuid NOT NULL, "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "date_modification" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_266e1d373e337927127c3f0a44" UNIQUE ("user_id"), CONSTRAINT "PK_7c262062450a70e6f1b9f861232" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_supervisors_user_id" ON "supervisors" ("user_id") `);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('STAGE_AFFECTE', 'STAGE_MODIFIE', 'STAGE_TERMINE', 'FIN_STAGE_PROCHE', 'EVALUATION', 'INFORMATION')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "utilisateur_destinataire_id" uuid NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "titre" character varying(200) NOT NULL, "message" text NOT NULL, "lu" boolean NOT NULL DEFAULT false, "reference_id" uuid, "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_notifications_dedupe" ON "notifications" ("utilisateur_destinataire_id", "type", "reference_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_notifications_recipient_date" ON "notifications" ("utilisateur_destinataire_id", "date_creation") `);
        await queryRunner.query(`CREATE TYPE "public"."follow_ups_type_enum" AS ENUM('OBSERVATION', 'ENTRETIEN', 'RAPPORT')`);
        await queryRunner.query(`CREATE TABLE "internship_follow_ups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "internship_id" uuid NOT NULL, "author_id" uuid NOT NULL, "contenu" text NOT NULL, "date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "type" "public"."follow_ups_type_enum" NOT NULL DEFAULT 'OBSERVATION', "date_modification" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_46ae6ca3156e17d182796b5cc9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_follow_ups_internship_date" ON "internship_follow_ups" ("internship_id", "date") `);
        await queryRunner.query(`CREATE TYPE "public"."evaluations_evaluator_type_enum" AS ENUM('ENCADREUR', 'ENTREPRISE')`);
        await queryRunner.query(`CREATE TABLE "evaluations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stage_id" uuid NOT NULL, "evaluateur_id" uuid NOT NULL, "type_evaluateur" "public"."evaluations_evaluator_type_enum" NOT NULL, "note" numeric(4,2) NOT NULL, "commentaire" text, "observation" text, "appreciation_generale" text, "date_evaluation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "validee" boolean NOT NULL DEFAULT false, "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "date_modification" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f683b433eba0e6dae7e19b29e29" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_evaluations_stage_evaluator_type" ON "evaluations" ("stage_id", "evaluateur_id", "type_evaluateur") `);
        await queryRunner.query(`ALTER TABLE "companies" ADD CONSTRAINT "FK_ee0839cba07cb0c52602021ad4b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "professional_situations" ADD CONSTRAINT "FK_d4243856eadc7e17c48a034d356" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_fb3eff90b11bddf7285f9b4e281" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_4ba671dddef2b0149cfad39a1cb" FOREIGN KEY ("encadreur_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_079299f5c1428c610dfa7e00bb7" FOREIGN KEY ("entreprise_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "internships" ADD CONSTRAINT "FK_e233662d571b66327c1212f986f" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "internships" ADD CONSTRAINT "FK_f65b0e67897cc068d7151c03b20" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "internships" ADD CONSTRAINT "FK_7ae52ec240d67996eec7de29158" FOREIGN KEY ("supervisor_id") REFERENCES "supervisors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "supervisors" ADD CONSTRAINT "FK_266e1d373e337927127c3f0a444" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_17567aa1e25b2400964ac40d75d" FOREIGN KEY ("utilisateur_destinataire_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "internship_follow_ups" ADD CONSTRAINT "FK_55ed289df58bb2d950da6d0655e" FOREIGN KEY ("internship_id") REFERENCES "internships"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "internship_follow_ups" ADD CONSTRAINT "FK_61fd3f4e9d88140379a7e59cec8" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evaluations" ADD CONSTRAINT "FK_c221b5e929724fbc162d2d950fe" FOREIGN KEY ("stage_id") REFERENCES "internships"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evaluations" ADD CONSTRAINT "FK_e586f31665185492fa0f2275418" FOREIGN KEY ("evaluateur_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "evaluations" DROP CONSTRAINT "FK_e586f31665185492fa0f2275418"`);
        await queryRunner.query(`ALTER TABLE "evaluations" DROP CONSTRAINT "FK_c221b5e929724fbc162d2d950fe"`);
        await queryRunner.query(`ALTER TABLE "internship_follow_ups" DROP CONSTRAINT "FK_61fd3f4e9d88140379a7e59cec8"`);
        await queryRunner.query(`ALTER TABLE "internship_follow_ups" DROP CONSTRAINT "FK_55ed289df58bb2d950da6d0655e"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_17567aa1e25b2400964ac40d75d"`);
        await queryRunner.query(`ALTER TABLE "supervisors" DROP CONSTRAINT "FK_266e1d373e337927127c3f0a444"`);
        await queryRunner.query(`ALTER TABLE "internships" DROP CONSTRAINT "FK_7ae52ec240d67996eec7de29158"`);
        await queryRunner.query(`ALTER TABLE "internships" DROP CONSTRAINT "FK_f65b0e67897cc068d7151c03b20"`);
        await queryRunner.query(`ALTER TABLE "internships" DROP CONSTRAINT "FK_e233662d571b66327c1212f986f"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_079299f5c1428c610dfa7e00bb7"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_4ba671dddef2b0149cfad39a1cb"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_fb3eff90b11bddf7285f9b4e281"`);
        await queryRunner.query(`ALTER TABLE "professional_situations" DROP CONSTRAINT "FK_d4243856eadc7e17c48a034d356"`);
        await queryRunner.query(`ALTER TABLE "companies" DROP CONSTRAINT "FK_ee0839cba07cb0c52602021ad4b"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_evaluations_stage_evaluator_type"`);
        await queryRunner.query(`DROP TABLE "evaluations"`);
        await queryRunner.query(`DROP TYPE "public"."evaluations_evaluator_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_follow_ups_internship_date"`);
        await queryRunner.query(`DROP TABLE "internship_follow_ups"`);
        await queryRunner.query(`DROP TYPE "public"."follow_ups_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_notifications_recipient_date"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_notifications_dedupe"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_supervisors_user_id"`);
        await queryRunner.query(`DROP TABLE "supervisors"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_internships_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_internships_dates"`);
        await queryRunner.query(`DROP TABLE "internships"`);
        await queryRunner.query(`DROP TYPE "public"."internships_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_students_matricule"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_students_user_id"`);
        await queryRunner.query(`DROP TABLE "students"`);
        await queryRunner.query(`DROP TYPE "public"."students_employment_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."students_academic_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_professional_situations_student_date"`);
        await queryRunner.query(`DROP TABLE "professional_situations"`);
        await queryRunner.query(`DROP TYPE "public"."professional_situations_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_companies_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_companies_email"`);
        await queryRunner.query(`DROP TABLE "companies"`);
        await queryRunner.query(`DROP TYPE "public"."companies_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_users_email"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
