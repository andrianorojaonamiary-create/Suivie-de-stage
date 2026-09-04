--
-- PostgreSQL database dump
--

\restrict YNfuhVEwHiMFuJMLdhAS8gsGoat54ulbqH5i60WEktMu4gScqDj20ZvpmlX1XsZ

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: notifications_type_enum; Type: TYPE; Schema: public; Owner: emit_stage_user
--

CREATE TYPE public.notifications_type_enum AS ENUM (
    'info',
    'alerte',
    'rappel'
);


ALTER TYPE public.notifications_type_enum OWNER TO emit_stage_user;

--
-- Name: situations_professionnelles_situation_enum; Type: TYPE; Schema: public; Owner: emit_stage_user
--

CREATE TYPE public.situations_professionnelles_situation_enum AS ENUM (
    'en_recherche',
    'en_emploi',
    'poursuite_etudes',
    'sans_nouvelles'
);


ALTER TYPE public.situations_professionnelles_situation_enum OWNER TO emit_stage_user;

--
-- Name: stages_statut_enum; Type: TYPE; Schema: public; Owner: emit_stage_user
--

CREATE TYPE public.stages_statut_enum AS ENUM (
    'a_venir',
    'en_cours',
    'termine'
);


ALTER TYPE public.stages_statut_enum OWNER TO emit_stage_user;

--
-- Name: utilisateurs_role_enum; Type: TYPE; Schema: public; Owner: emit_stage_user
--

CREATE TYPE public.utilisateurs_role_enum AS ENUM (
    'etudiant',
    'encadreur',
    'entreprise',
    'admin'
);


ALTER TYPE public.utilisateurs_role_enum OWNER TO emit_stage_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: emplois; Type: TABLE; Schema: public; Owner: emit_stage_user
--

CREATE TABLE public.emplois (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    poste character varying NOT NULL,
    entreprise character varying NOT NULL,
    domaine character varying,
    localisation character varying,
    date_debut date NOT NULL,
    date_fin date,
    situation_id uuid
);


ALTER TABLE public.emplois OWNER TO emit_stage_user;

--
-- Name: encadreurs; Type: TABLE; Schema: public; Owner: emit_stage_user
--

CREATE TABLE public.encadreurs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nom character varying NOT NULL,
    prenom character varying NOT NULL,
    fonction character varying NOT NULL,
    utilisateur_id uuid
);


ALTER TABLE public.encadreurs OWNER TO emit_stage_user;

--
-- Name: entreprises; Type: TABLE; Schema: public; Owner: emit_stage_user
--

CREATE TABLE public.entreprises (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nom character varying NOT NULL,
    domaine character varying NOT NULL,
    adresse character varying NOT NULL,
    ville character varying NOT NULL,
    telephone character varying,
    email character varying NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    utilisateur_id uuid
);


ALTER TABLE public.entreprises OWNER TO emit_stage_user;

--
-- Name: etudiants; Type: TABLE; Schema: public; Owner: emit_stage_user
--

CREATE TABLE public.etudiants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    matricule character varying NOT NULL,
    nom character varying NOT NULL,
    prenom character varying NOT NULL,
    formation character varying NOT NULL,
    niveau character varying NOT NULL,
    utilisateur_id uuid,
    promotion_id uuid,
    filiere_id uuid
);


ALTER TABLE public.etudiants OWNER TO emit_stage_user;

--
-- Name: evaluations; Type: TABLE; Schema: public; Owner: emit_stage_user
--

CREATE TABLE public.evaluations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    note numeric(4,2) NOT NULL,
    commentaire text,
    observation text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    stage_id uuid,
    evaluateur_id uuid,
    CONSTRAINT "CHK_39b8e2f6017539a609e389dfb0" CHECK (((note >= (0)::numeric) AND (note <= (20)::numeric)))
);


ALTER TABLE public.evaluations OWNER TO emit_stage_user;

--
-- Name: filieres; Type: TABLE; Schema: public; Owner: emit_stage_user
--

CREATE TABLE public.filieres (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nom character varying NOT NULL
);


ALTER TABLE public.filieres OWNER TO emit_stage_user;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: emit_stage_user
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    type public.notifications_type_enum DEFAULT 'info'::public.notifications_type_enum NOT NULL,
    message text NOT NULL,
    est_lue boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    utilisateur_id uuid
);


ALTER TABLE public.notifications OWNER TO emit_stage_user;

--
-- Name: promotions; Type: TABLE; Schema: public; Owner: emit_stage_user
--

CREATE TABLE public.promotions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    libelle character varying NOT NULL,
    "anneeUniversitaire" character varying NOT NULL
);


ALTER TABLE public.promotions OWNER TO emit_stage_user;

--
-- Name: situations_professionnelles; Type: TABLE; Schema: public; Owner: emit_stage_user
--

CREATE TABLE public.situations_professionnelles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    situation public.situations_professionnelles_situation_enum NOT NULL,
    date_debut date NOT NULL,
    diplome_id uuid
);


ALTER TABLE public.situations_professionnelles OWNER TO emit_stage_user;

--
-- Name: stages; Type: TABLE; Schema: public; Owner: emit_stage_user
--

CREATE TABLE public.stages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    domaine character varying NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    statut public.stages_statut_enum DEFAULT 'a_venir'::public.stages_statut_enum NOT NULL,
    etudiant_id uuid,
    entreprise_id uuid,
    encadreur_id uuid,
    CONSTRAINT "CHK_568967782091ffc529060f8c6b" CHECK ((date_fin > date_debut))
);


ALTER TABLE public.stages OWNER TO emit_stage_user;

--
-- Name: utilisateurs; Type: TABLE; Schema: public; Owner: emit_stage_user
--

CREATE TABLE public.utilisateurs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying NOT NULL,
    mot_de_passe character varying NOT NULL,
    role public.utilisateurs_role_enum NOT NULL,
    statut boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.utilisateurs OWNER TO emit_stage_user;

--
-- Name: stages PK_16efa0f8f5386328944769b9e6d; Type: CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT "PK_16efa0f8f5386328944769b9e6d" PRIMARY KEY (id);


--
-- Name: promotions PK_380cecbbe3ac11f0e5a7c452c34; Type: CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT "PK_380cecbbe3ac11f0e5a7c452c34" PRIMARY KEY (id);


--
-- Name: etudiants PK_389912d5e775f236c582b85071c; Type: CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.etudiants
    ADD CONSTRAINT "PK_389912d5e775f236c582b85071c" PRIMARY KEY (id);


--
-- Name: filieres PK_3d799060d5ff97fcdb46b25c507; Type: CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.filieres
    ADD CONSTRAINT "PK_3d799060d5ff97fcdb46b25c507" PRIMARY KEY (id);


--
-- Name: notifications PK_6a72c3c0f683f6462415e653c3a; Type: CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY (id);


--
-- Name: situations_professionnelles PK_901998b33e86ebf1933a36305ff; Type: CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.situations_professionnelles
    ADD CONSTRAINT "PK_901998b33e86ebf1933a36305ff" PRIMARY KEY (id);


--
-- Name: emplois PK_91cb63cfacab8ee76ee55a970cb; Type: CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.emplois
    ADD CONSTRAINT "PK_91cb63cfacab8ee76ee55a970cb" PRIMARY KEY (id);


--
-- Name: utilisateurs PK_d3c39b551c51a0bdc76e07b9197; Type: CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT "PK_d3c39b551c51a0bdc76e07b9197" PRIMARY KEY (id);


--
-- Name: entreprises PK_e22358220a9a964ed3a142f2539; Type: CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.entreprises
    ADD CONSTRAINT "PK_e22358220a9a964ed3a142f2539" PRIMARY KEY (id);


--
-- Name: encadreurs PK_e51a68053be5f5a312bfba57c0d; Type: CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.encadreurs
    ADD CONSTRAINT "PK_e51a68053be5f5a312bfba57c0d" PRIMARY KEY (id);


--
-- Name: evaluations PK_f683b433eba0e6dae7e19b29e29; Type: CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT "PK_f683b433eba0e6dae7e19b29e29" PRIMARY KEY (id);


--
-- Name: etudiants REL_3f27a0fea1e9bc78e8709b3c7a; Type: CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.etudiants
    ADD CONSTRAINT "REL_3f27a0fea1e9bc78e8709b3c7a" UNIQUE (utilisateur_id);


--
-- Name: encadreurs REL_5c2a665ba7797b30a2cab515a4; Type: CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.encadreurs
    ADD CONSTRAINT "REL_5c2a665ba7797b30a2cab515a4" UNIQUE (utilisateur_id);


--
-- Name: entreprises REL_dbe0506bbe2d6dd846b8594e67; Type: CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.entreprises
    ADD CONSTRAINT "REL_dbe0506bbe2d6dd846b8594e67" UNIQUE (utilisateur_id);


--
-- Name: utilisateurs UQ_6b14325a486fe68d16aa889e4dc; Type: CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT "UQ_6b14325a486fe68d16aa889e4dc" UNIQUE (email);


--
-- Name: etudiants UQ_b70955fa3f0b73f3715684fff29; Type: CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.etudiants
    ADD CONSTRAINT "UQ_b70955fa3f0b73f3715684fff29" UNIQUE (matricule);


--
-- Name: stages FK_2b8f66bfc6fea4d75ee2347ad30; Type: FK CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT "FK_2b8f66bfc6fea4d75ee2347ad30" FOREIGN KEY (encadreur_id) REFERENCES public.encadreurs(id);


--
-- Name: etudiants FK_3f27a0fea1e9bc78e8709b3c7a0; Type: FK CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.etudiants
    ADD CONSTRAINT "FK_3f27a0fea1e9bc78e8709b3c7a0" FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id) ON DELETE CASCADE;


--
-- Name: encadreurs FK_5c2a665ba7797b30a2cab515a49; Type: FK CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.encadreurs
    ADD CONSTRAINT "FK_5c2a665ba7797b30a2cab515a49" FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id) ON DELETE CASCADE;


--
-- Name: emplois FK_623fc2e24b40d37388113c3f8da; Type: FK CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.emplois
    ADD CONSTRAINT "FK_623fc2e24b40d37388113c3f8da" FOREIGN KEY (situation_id) REFERENCES public.situations_professionnelles(id);


--
-- Name: stages FK_9996dd8210733d37aa7236d1602; Type: FK CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT "FK_9996dd8210733d37aa7236d1602" FOREIGN KEY (etudiant_id) REFERENCES public.etudiants(id);


--
-- Name: notifications FK_ac86d3ab7a1928851fb24416c6e; Type: FK CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "FK_ac86d3ab7a1928851fb24416c6e" FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id);


--
-- Name: etudiants FK_c0949984bf5882b3ffbf9e839dc; Type: FK CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.etudiants
    ADD CONSTRAINT "FK_c0949984bf5882b3ffbf9e839dc" FOREIGN KEY (promotion_id) REFERENCES public.promotions(id);


--
-- Name: evaluations FK_c221b5e929724fbc162d2d950fe; Type: FK CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT "FK_c221b5e929724fbc162d2d950fe" FOREIGN KEY (stage_id) REFERENCES public.stages(id);


--
-- Name: entreprises FK_dbe0506bbe2d6dd846b8594e673; Type: FK CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.entreprises
    ADD CONSTRAINT "FK_dbe0506bbe2d6dd846b8594e673" FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id) ON DELETE CASCADE;


--
-- Name: evaluations FK_e586f31665185492fa0f2275418; Type: FK CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT "FK_e586f31665185492fa0f2275418" FOREIGN KEY (evaluateur_id) REFERENCES public.utilisateurs(id);


--
-- Name: etudiants FK_f505bdbeddbcf305c5f44e56ed3; Type: FK CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.etudiants
    ADD CONSTRAINT "FK_f505bdbeddbcf305c5f44e56ed3" FOREIGN KEY (filiere_id) REFERENCES public.filieres(id);


--
-- Name: stages FK_fd5adb3e49944fd0c2d36b5fb6e; Type: FK CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT "FK_fd5adb3e49944fd0c2d36b5fb6e" FOREIGN KEY (entreprise_id) REFERENCES public.entreprises(id);


--
-- Name: situations_professionnelles FK_ffc75464e69b1f4e0cf56953f39; Type: FK CONSTRAINT; Schema: public; Owner: emit_stage_user
--

ALTER TABLE ONLY public.situations_professionnelles
    ADD CONSTRAINT "FK_ffc75464e69b1f4e0cf56953f39" FOREIGN KEY (diplome_id) REFERENCES public.etudiants(id);


--
-- PostgreSQL database dump complete
--

\unrestrict YNfuhVEwHiMFuJMLdhAS8gsGoat54ulbqH5i60WEktMu4gScqDj20ZvpmlX1XsZ

