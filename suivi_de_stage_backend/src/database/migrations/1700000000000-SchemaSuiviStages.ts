import { MigrationInterface, QueryRunner } from 'typeorm';

// ============================================================================
// Migration initiale consolidée — schéma de la plateforme de suivi des stages
// ============================================================================
// Remplace les anciennes migrations (SchemaSuiviStages171 / PasswordReset172)
// qui créaient un schéma obsolète (tables françaises) non conforme aux
// entités TypeORM actuelles.
//
// Ce fichier est la SOURCE DE VÉRITÉ du schéma. Il reflète exactement les 9
// entités du backend : users, students, companies, supervisors, internships,
// evaluations, notifications, professional_situations, internship_follow_ups.
//
// Installation :
//   1. Créer la base (vide) de votre choix.
//   2. `npm run migration:run` (depuis suivi_de_stage_backend)
//   3. `npm run migration:revert` pour annuler (drop complet).
// ============================================================================

export class SchemaSuiviStages1700000000000 implements MigrationInterface {
  name = 'SchemaSuiviStages1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Extension UUID
    await queryRunner.query(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public',
    );

    // 2. Types Enum (noms exacts des entités)
    await queryRunner.query(`
      CREATE TYPE public.users_role_enum AS ENUM (
        'ETUDIANT', 'ENCADREUR', 'ENSEIGNANT', 'ADMINISTRATEUR'
      );
    `);
    await queryRunner.query(`
      CREATE TYPE public.internships_status_enum AS ENUM (
        'A_VENIR', 'EN_COURS', 'TERMINE', 'SUSPENDU', 'ANNULE'
      );
    `);
    await queryRunner.query(`
      CREATE TYPE public.students_academic_status_enum AS ENUM (
        'ACTIF', 'DIPLOME', 'SUSPENDU', 'ABANDONNE'
      );
    `);
    await queryRunner.query(`
      CREATE TYPE public.students_employment_status_enum AS ENUM (
        'NON_RENSEIGNE', 'EMPLOYE', 'RECHERCHE_EMPLOI'
      );
    `);
    await queryRunner.query(`
      CREATE TYPE public.companies_status_enum AS ENUM ('ACTIVE', 'INACTIVE');
    `);
    await queryRunner.query(`
      CREATE TYPE public.evaluations_evaluator_type_enum AS ENUM (
        'ENCADREUR'
      );
    `);
    await queryRunner.query(`
      CREATE TYPE public.notifications_type_enum AS ENUM (
        'STAGE_AFFECTE', 'STAGE_MODIFIE', 'STAGE_TERMINE',
        'FIN_STAGE_PROCHE', 'EVALUATION', 'INFORMATION'
      );
    `);
    await queryRunner.query(`
      CREATE TYPE public.professional_situations_type_enum AS ENUM (
        'EMPLOYE', 'EN_RECHERCHE_EMPLOI', 'ENTREPRENEUR',
        'POURSUITE_ETUDES', 'AUTRE'
      );
    `);
    await queryRunner.query(`
      CREATE TYPE public.follow_ups_type_enum AS ENUM (
        'OBSERVATION', 'ENTRETIEN', 'RAPPORT'
      );
    `);

    // 3. Table users
    await queryRunner.query(`
      CREATE TABLE public.users (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        nom character varying(100) NOT NULL,
        prenom character varying(100) NOT NULL,
        matricule character varying(50),
        grade character varying(100),
        departement character varying(100),
        specialite character varying(150),
        telephone character varying(30),
        email character varying(255) NOT NULL,
        mot_de_passe character varying(255) NOT NULL,
        role public.users_role_enum NOT NULL DEFAULT 'ETUDIANT',
        actif boolean NOT NULL DEFAULT true,
        password_reset_token character varying(255),
        password_reset_expires_at timestamp with time zone,
        date_creation timestamp with time zone NOT NULL DEFAULT now(),
        date_modification timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY (id),
        CONSTRAINT "UQ_users_email" UNIQUE (email)
      );
    `);

    // 4. Table students
    await queryRunner.query(`
      CREATE TABLE public.students (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        matricule character varying(50) NOT NULL,
        formation character varying(150) NOT NULL,
        niveau character varying(100) NOT NULL,
        promotion character varying(20) NOT NULL,
        telephone character varying(30),
        adresse text,
        statut_academique public.students_academic_status_enum NOT NULL DEFAULT 'ACTIF',
        situation_professionnelle public.students_employment_status_enum NOT NULL DEFAULT 'NON_RENSEIGNE',
        user_id uuid NOT NULL,
        encadreur_id uuid,
        entreprise_id uuid,
        date_creation timestamp with time zone NOT NULL DEFAULT now(),
        date_modification timestamp with time zone NOT NULL DEFAULT now(),
        date_suppression timestamp with time zone,
        CONSTRAINT "PK_students" PRIMARY KEY (id),
        CONSTRAINT "UQ_students_matricule" UNIQUE (matricule),
        CONSTRAINT "UQ_students_user_id" UNIQUE (user_id),
        CONSTRAINT "FK_students_user" FOREIGN KEY (user_id)
          REFERENCES public.users(id) ON DELETE NO ACTION,
        CONSTRAINT "FK_students_encadreur" FOREIGN KEY (encadreur_id)
          REFERENCES public.users(id) ON DELETE NO ACTION,
        CONSTRAINT "FK_students_entreprise" FOREIGN KEY (entreprise_id)
          REFERENCES public.users(id) ON DELETE NO ACTION
      );
    `);

    // 5. Table companies
    await queryRunner.query(`
      CREATE TABLE public.companies (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        nom character varying(150) NOT NULL,
        description text,
        secteur_activite character varying(150) NOT NULL,
        adresse character varying(255) NOT NULL,
        ville character varying(100) NOT NULL,
        region character varying(100) NOT NULL,
        telephone character varying(30),
        email character varying(255) NOT NULL,
        site_web character varying(255),
        latitude numeric(10,7),
        longitude numeric(10,7),
        statut public.companies_status_enum NOT NULL DEFAULT 'ACTIVE',
        user_id uuid NOT NULL,
        date_creation timestamp with time zone NOT NULL DEFAULT now(),
        date_modification timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "PK_companies" PRIMARY KEY (id),
        CONSTRAINT "UQ_companies_email" UNIQUE (email),
        CONSTRAINT "UQ_companies_user_id" UNIQUE (user_id),
        CONSTRAINT "FK_companies_user" FOREIGN KEY (user_id)
          REFERENCES public.users(id) ON DELETE NO ACTION
      );
    `);

    // 6. Table supervisors
    await queryRunner.query(`
      CREATE TABLE public.supervisors (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        fonction character varying(150) NOT NULL,
        specialite character varying(150) NOT NULL,
        telephone character varying(30),
        entreprise character varying(150),
        user_id uuid NOT NULL,
        date_creation timestamp with time zone NOT NULL DEFAULT now(),
        date_modification timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "PK_supervisors" PRIMARY KEY (id),
        CONSTRAINT "UQ_supervisors_user_id" UNIQUE (user_id),
        CONSTRAINT "FK_supervisors_user" FOREIGN KEY (user_id)
          REFERENCES public.users(id) ON DELETE NO ACTION
      );
    `);

    // 7. Table internships
    await queryRunner.query(`
      CREATE TABLE public.internships (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        student_id uuid NOT NULL,
        company_id uuid NOT NULL,
        supervisor_id uuid NOT NULL,
        intitule character varying(200) NOT NULL,
        description text NOT NULL,
        domaine character varying(150) NOT NULL,
        lieu character varying(255) NOT NULL,
        ville character varying(100) NOT NULL,
        latitude numeric(10,7),
        longitude numeric(10,7),
        date_debut date NOT NULL,
        date_fin date NOT NULL,
        statut public.internships_status_enum NOT NULL DEFAULT 'A_VENIR',
        observations text,
        date_creation timestamp with time zone NOT NULL DEFAULT now(),
        date_modification timestamp with time zone NOT NULL DEFAULT now(),
        date_suppression timestamp with time zone,
        CONSTRAINT "PK_internships" PRIMARY KEY (id),
        CONSTRAINT "CHK_internships_dates" CHECK (date_fin > date_debut),
        CONSTRAINT "FK_internships_student" FOREIGN KEY (student_id)
          REFERENCES public.students(id) ON DELETE NO ACTION,
        CONSTRAINT "FK_internships_company" FOREIGN KEY (company_id)
          REFERENCES public.companies(id) ON DELETE NO ACTION,
        CONSTRAINT "FK_internships_supervisor" FOREIGN KEY (supervisor_id)
          REFERENCES public.supervisors(id) ON DELETE NO ACTION
      );
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_internships_status" ON public.internships ("statut")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_internships_dates" ON public.internships ("date_debut", "date_fin")',
    );

    // 8. Table evaluations
    await queryRunner.query(`
      CREATE TABLE public.evaluations (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        stage_id uuid NOT NULL,
        evaluateur_id uuid NOT NULL,
        type_evaluateur public.evaluations_evaluator_type_enum NOT NULL,
        note numeric(4,2) NOT NULL,
        commentaire text,
        observation text,
        appreciation_generale text,
        date_evaluation timestamp with time zone NOT NULL DEFAULT now(),
        validee boolean NOT NULL DEFAULT false,
        date_creation timestamp with time zone NOT NULL DEFAULT now(),
        date_modification timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "PK_evaluations" PRIMARY KEY (id),
        CONSTRAINT "CHK_evaluations_note" CHECK (note >= 0 AND note <= 20),
        CONSTRAINT "FK_evaluations_stage" FOREIGN KEY (stage_id)
          REFERENCES public.internships(id) ON DELETE CASCADE,
        CONSTRAINT "FK_evaluations_evaluateur" FOREIGN KEY (evaluateur_id)
          REFERENCES public.users(id) ON DELETE RESTRICT
      );
    `);
    await queryRunner.query(
      'CREATE UNIQUE INDEX "UQ_evaluations_stage_evaluator_type" ON public.evaluations ("stage_id", "evaluateur_id", "type_evaluateur")',
    );

    // 9. Table notifications
    await queryRunner.query(`
      CREATE TABLE public.notifications (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        utilisateur_destinataire_id uuid NOT NULL,
        type public.notifications_type_enum NOT NULL,
        titre character varying(200) NOT NULL,
        message text NOT NULL,
        lu boolean NOT NULL DEFAULT false,
        reference_id uuid,
        date_creation timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY (id),
        CONSTRAINT "FK_notifications_destinataire" FOREIGN KEY (utilisateur_destinataire_id)
          REFERENCES public.users(id) ON DELETE CASCADE
      );
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_notifications_recipient_date" ON public.notifications ("utilisateur_destinataire_id", "date_creation")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_notifications_dedupe" ON public.notifications ("utilisateur_destinataire_id", "type", "reference_id")',
    );

    // 10. Table professional_situations
    await queryRunner.query(`
      CREATE TABLE public.professional_situations (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        student_id uuid NOT NULL,
        situation public.professional_situations_type_enum NOT NULL,
        entreprise character varying(200),
        poste character varying(150),
        domaine character varying(150),
        ville character varying(100),
        pays character varying(100),
        date_debut date,
        date_fin date,
        description text,
        date_creation timestamp with time zone NOT NULL DEFAULT now(),
        date_modification timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "PK_professional_situations" PRIMARY KEY (id),
        CONSTRAINT "FK_professional_situations_student" FOREIGN KEY (student_id)
          REFERENCES public.students(id) ON DELETE CASCADE
      );
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_professional_situations_student_date" ON public.professional_situations ("student_id", "date_creation")',
    );

    // 11. Table internship_follow_ups
    await queryRunner.query(`
      CREATE TABLE public.internship_follow_ups (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        internship_id uuid NOT NULL,
        author_id uuid NOT NULL,
        contenu text NOT NULL,
        date timestamp with time zone NOT NULL DEFAULT now(),
        type public.follow_ups_type_enum NOT NULL DEFAULT 'OBSERVATION',
        date_modification timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "PK_internship_follow_ups" PRIMARY KEY (id),
        CONSTRAINT "FK_follow_ups_internship" FOREIGN KEY (internship_id)
          REFERENCES public.internships(id) ON DELETE CASCADE,
        CONSTRAINT "FK_follow_ups_author" FOREIGN KEY (author_id)
          REFERENCES public.users(id) ON DELETE RESTRICT
      );
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_follow_ups_internship_date" ON public.internship_follow_ups ("internship_id", "date")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Suppression dans l'ordre inverse des dépendances FK
    await queryRunner.query(
      'DROP TABLE IF EXISTS public.internship_follow_ups CASCADE',
    );
    await queryRunner.query(
      'DROP TABLE IF EXISTS public.professional_situations CASCADE',
    );
    await queryRunner.query(
      'DROP TABLE IF EXISTS public.notifications CASCADE',
    );
    await queryRunner.query('DROP TABLE IF EXISTS public.evaluations CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS public.internships CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS public.supervisors CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS public.companies CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS public.students CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS public.users CASCADE');

    await queryRunner.query('DROP TYPE IF EXISTS public.follow_ups_type_enum');
    await queryRunner.query(
      'DROP TYPE IF EXISTS public.professional_situations_type_enum',
    );
    await queryRunner.query(
      'DROP TYPE IF EXISTS public.notifications_type_enum',
    );
    await queryRunner.query(
      'DROP TYPE IF EXISTS public.evaluations_evaluator_type_enum',
    );
    await queryRunner.query('DROP TYPE IF EXISTS public.companies_status_enum');
    await queryRunner.query(
      'DROP TYPE IF EXISTS public.students_employment_status_enum',
    );
    await queryRunner.query(
      'DROP TYPE IF EXISTS public.students_academic_status_enum',
    );
    await queryRunner.query(
      'DROP TYPE IF EXISTS public.internships_status_enum',
    );
    await queryRunner.query('DROP TYPE IF EXISTS public.users_role_enum');
  }
}
