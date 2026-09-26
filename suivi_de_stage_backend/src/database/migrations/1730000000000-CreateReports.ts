import { MigrationInterface, QueryRunner } from 'typeorm';

// ============================================================================
// Ajoute le stockage des rapports de stage :
//  - table reports (un rapport par stage)
//  - enums reports_status_enum / reports_type_enum
// Fichiers déposés dans uploads/reports (nom de fichier stocké en base).
// ============================================================================

export class CreateReports1730000000000 implements MigrationInterface {
  name = 'CreateReports1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE public.reports_type_enum AS ENUM (
        'PRISE_EN_MAIN', 'INTERMEDIAIRE', 'FINAL'
      );
    `);
    await queryRunner.query(`
      CREATE TYPE public.reports_status_enum AS ENUM (
        'EN_ATTENTE', 'APPROUVE', 'REJETE'
      );
    `);

    await queryRunner.query(`
      CREATE TABLE public.reports (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        stage_id uuid NOT NULL,
        type public.reports_type_enum NOT NULL,
        file_name character varying(255) NOT NULL,
        original_name character varying(255) NOT NULL,
        size integer DEFAULT 0 NOT NULL,
        statut public.reports_status_enum DEFAULT 'EN_ATTENTE' NOT NULL,
        commentaire text,
        date_creation TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        date_modification TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        CONSTRAINT "PK_reports" PRIMARY KEY (id),
        CONSTRAINT "FK_reports_stage" FOREIGN KEY (stage_id)
          REFERENCES public.internships(id) ON DELETE CASCADE
      );
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_reports_stage" ON public.reports (stage_id)',
    );

    await queryRunner.query(`
      ALTER TYPE public.notifications_type_enum ADD VALUE IF NOT EXISTS 'RAPPORT_DEPOSE';
    `);
    await queryRunner.query(`
      ALTER TYPE public.notifications_type_enum ADD VALUE IF NOT EXISTS 'RAPPORT_REVU';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE public.reports');
    await queryRunner.query('DROP TYPE public.reports_status_enum');
    await queryRunner.query('DROP TYPE public.reports_type_enum');
  }
}