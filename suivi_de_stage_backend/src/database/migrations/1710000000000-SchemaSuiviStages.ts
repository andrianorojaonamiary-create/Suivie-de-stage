import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchemaSuiviStages1710000000000 implements MigrationInterface {
  name = 'SchemaSuiviStages1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Extensions
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public');

    // 2. Types Enum
    await queryRunner.query(
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notifications_type_enum') THEN
          CREATE TYPE public.notifications_type_enum AS ENUM ('info', 'alerte', 'rappel');
        END IF;
      END $$;`,
    );

    await queryRunner.query(
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'situations_professionnelles_situation_enum') THEN
          CREATE TYPE public.situations_professionnelles_situation_enum AS ENUM ('en_recherche', 'en_emploi', 'poursuite_etudes', 'sans_nouvelles');
        END IF;
      END $$;`,
    );

    await queryRunner.query(
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stages_statut_enum') THEN
          CREATE TYPE public.stages_statut_enum AS ENUM ('a_venir', 'en_cours', 'termine');
        END IF;
      END $$;`,
    );

    await queryRunner.query(
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'utilisateurs_role_enum') THEN
          CREATE TYPE public.utilisateurs_role_enum AS ENUM ('etudiant', 'encadreur', 'entreprise', 'admin');
        END IF;
      END $$;`,
    );

    // 3. Tables fondamentales (sans FK dépendantes)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.utilisateurs (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        email character varying NOT NULL,
        mot_de_passe character varying NOT NULL,
        role public.utilisateurs_role_enum NOT NULL,
        statut boolean DEFAULT true NOT NULL,
        created_at timestamp without time zone DEFAULT now() NOT NULL,
        CONSTRAINT "PK_d3c39b551c51a0bdc76e07b9197" PRIMARY KEY (id),
        CONSTRAINT "UQ_6b14325a486fe68d16aa889e4dc" UNIQUE (email)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.promotions (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        libelle character varying NOT NULL,
        "anneeUniversitaire" character varying NOT NULL,
        CONSTRAINT "PK_380cecbbe3ac11f0e5a7c452c34" PRIMARY KEY (id)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.filieres (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        nom character varying NOT NULL,
        CONSTRAINT "PK_3d799060d5ff97fcdb46b25c507" PRIMARY KEY (id)
      );
    `);

    // 4. Tables liées aux utilisateurs
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.encadreurs (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        nom character varying NOT NULL,
        prenom character varying NOT NULL,
        fonction character varying NOT NULL,
        utilisateur_id uuid,
        CONSTRAINT "PK_e51a68053be5f5a312bfba57c0d" PRIMARY KEY (id),
        CONSTRAINT "REL_5c2a665ba7797b30a2cab515a4" UNIQUE (utilisateur_id),
        CONSTRAINT "FK_5c2a665ba7797b30a2cab515a49" FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.entreprises (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        nom character varying NOT NULL,
        domaine character varying NOT NULL,
        adresse character varying NOT NULL,
        ville character varying NOT NULL,
        telephone character varying,
        email character varying NOT NULL,
        latitude double precision NOT NULL,
        longitude double precision NOT NULL,
        utilisateur_id uuid,
        CONSTRAINT "PK_e22358220a9a964ed3a142f2539" PRIMARY KEY (id),
        CONSTRAINT "REL_dbe0506bbe2d6dd846b8594e67" UNIQUE (utilisateur_id),
        CONSTRAINT "FK_dbe0506bbe2d6dd846b8594e673" FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.etudiants (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        matricule character varying NOT NULL,
        nom character varying NOT NULL,
        prenom character varying NOT NULL,
        formation character varying NOT NULL,
        niveau character varying NOT NULL,
        utilisateur_id uuid,
        promotion_id uuid,
        filiere_id uuid,
        CONSTRAINT "PK_389912d5e775f236c582b85071c" PRIMARY KEY (id),
        CONSTRAINT "UQ_b70955fa3f0b73f3715684fff29" UNIQUE (matricule),
        CONSTRAINT "REL_3f27a0fea1e9bc78e8709b3c7a" UNIQUE (utilisateur_id),
        CONSTRAINT "FK_3f27a0fea1e9bc78e8709b3c7a0" FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id) ON DELETE CASCADE,
        CONSTRAINT "FK_c0949984bf5882b3ffbf9e839dc" FOREIGN KEY (promotion_id) REFERENCES public.promotions(id),
        CONSTRAINT "FK_f505bdbeddbcf305c5f44e56ed3" FOREIGN KEY (filiere_id) REFERENCES public.filieres(id)
      );
    `);

    // 5. Stages et Évaluations
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.stages (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        domaine character varying NOT NULL,
        date_debut date NOT NULL,
        date_fin date NOT NULL,
        statut public.stages_statut_enum DEFAULT 'a_venir'::public.stages_statut_enum NOT NULL,
        etudiant_id uuid,
        entreprise_id uuid,
        encadreur_id uuid,
        CONSTRAINT "PK_16efa0f8f5386328944769b9e6d" PRIMARY KEY (id),
        CONSTRAINT "CHK_568967782091ffc529060f8c6b" CHECK ((date_fin > date_debut)),
        CONSTRAINT "FK_9996dd8210733d37aa7236d1602" FOREIGN KEY (etudiant_id) REFERENCES public.etudiants(id),
        CONSTRAINT "FK_fd5adb3e49944fd0c2d36b5fb6e" FOREIGN KEY (entreprise_id) REFERENCES public.entreprises(id),
        CONSTRAINT "FK_2b8f66bfc6fea4d75ee2347ad30" FOREIGN KEY (encadreur_id) REFERENCES public.encadreurs(id)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.evaluations (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        note numeric(4,2) NOT NULL,
        commentaire text,
        observation text,
        created_at timestamp without time zone DEFAULT now() NOT NULL,
        stage_id uuid,
        evaluateur_id uuid,
        CONSTRAINT "PK_f683b433eba0e6dae7e19b29e29" PRIMARY KEY (id),
        CONSTRAINT "CHK_39b8e2f6017539a609e389dfb0" CHECK (((note >= (0)::numeric) AND (note <= (20)::numeric))),
        CONSTRAINT "FK_c221b5e929724fbc162d2d950fe" FOREIGN KEY (stage_id) REFERENCES public.stages(id),
        CONSTRAINT "FK_e586f31665185492fa0f2275418" FOREIGN KEY (evaluateur_id) REFERENCES public.utilisateurs(id)
      );
    `);

    // 6. Notifications
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.notifications (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        type public.notifications_type_enum DEFAULT 'info'::public.notifications_type_enum NOT NULL,
        message text NOT NULL,
        est_lue boolean DEFAULT false NOT NULL,
        created_at timestamp without time zone DEFAULT now() NOT NULL,
        utilisateur_id uuid,
        CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY (id),
        CONSTRAINT "FK_ac86d3ab7a1928851fb24416c6e" FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id)
      );
    `);

    // 7. Situations professionnelles et Emplois
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.situations_professionnelles (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        situation public.situations_professionnelles_situation_enum NOT NULL,
        date_debut date NOT NULL,
        diplome_id uuid,
        CONSTRAINT "PK_901998b33e86ebf1933a36305ff" PRIMARY KEY (id),
        CONSTRAINT "FK_ffc75464e69b1f4e0cf56953f39" FOREIGN KEY (diplome_id) REFERENCES public.etudiants(id)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.emplois (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        poste character varying NOT NULL,
        entreprise character varying NOT NULL,
        domaine character varying,
        localisation character varying,
        date_debut date NOT NULL,
        date_fin date,
        situation_id uuid,
        CONSTRAINT "PK_91cb63cfacab8ee76ee55a970cb" PRIMARY KEY (id),
        CONSTRAINT "FK_623fc2e24b40d37388113c3f8da" FOREIGN KEY (situation_id) REFERENCES public.situations_professionnelles(id)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Suppression dans l'ordre inverse des dépendances FK
    await queryRunner.query('DROP TABLE IF EXISTS public.emplois CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS public.situations_professionnelles CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS public.notifications CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS public.evaluations CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS public.stages CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS public.etudiants CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS public.entreprises CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS public.encadreurs CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS public.filieres CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS public.promotions CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS public.utilisateurs CASCADE');

    // Suppression des types enum
    await queryRunner.query('DROP TYPE IF EXISTS public.utilisateurs_role_enum');
    await queryRunner.query('DROP TYPE IF EXISTS public.stages_statut_enum');
    await queryRunner.query('DROP TYPE IF EXISTS public.situations_professionnelles_situation_enum');
    await queryRunner.query('DROP TYPE IF EXISTS public.notifications_type_enum');
  }
}
