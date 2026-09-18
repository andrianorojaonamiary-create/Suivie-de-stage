# Base de données — Plateforme de suivi des stages (EMIT)

Le schéma PostgreSQL est géré **exclusivement par les migrations TypeORM** du backend. Il n'y a plus de fichier SQL à importer à la main.

- Migrations : `suivi_de_stage_backend/src/database/migrations/` (fichiers `*SchemaSuiviStages*`).
- Source de vérité du schéma : les entités TypeORM (`suivi_de_stage_backend/src/**/*.entity.ts`).
- Configuration : `suivi_de_stage_backend/src/database/data-source.ts` (`synchronize: false`, tables et enums créés uniquement via migrations).

## Installation / mise à niveau (pour chaque membre de l'équipe)

### 1. Installer PostgreSQL

Si ce n'est pas déjà fait : https://www.postgresql.org/download/ (garder le port par défaut 5432, noter le mot de passe de l'utilisateur `postgres`).

### 2. Créer la base

Depuis le backend (`suivi_de_stage_backend`) :

```bash
npm install          # la 1re fois
npm run migration:run
```

Configurer `.env` dans `suivi_de_stage_backend` (non versionné) :

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe
DB_DATABASE=db_suivi_stages
JWT_SECRET=une_phrase_secrete_longue
JWT_EXPIRES_IN=1h
```

### 3. Base existante avec l'ancien schéma

Les anciennes tables (schéma « français » : `utilisateurs`, `etudiants`, `promotions`, `filieres`, `entreprises`, `encadreurs`, `stages`, `evaluations`, `notifications`, `situations_professionnelles`, `emplois`) **ne sont plus compatibles** avec le backend.

La migration ne s'appliquera pas sur une base non vide → **seule une base vierge peut être migrée**. Pour une machine de dev/test :

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

puis relancer `npm run migration:run` dans `suivi_de_stage_backend`.

**Attention :** cette procédure efface toutes les données locales. Le schéma actuel ne **contient a priori aucun compte** : le premier compte `ADMINISTRATEUR` doit être créé via le endpoint `POST /api/auth/register`, sinon via un INSERT manuel dans `users` (le champ `mot_de_passe` doit alors être un hash bcrypt).

### 4. Vérifier

Dans pgAdmin : `db_suivi_stages` → Schemas → public → Tables. Vous devez voir 9 tables :

`users`, `students`, `companies`, `supervisors`, `internships`, `evaluations`, `notifications`, `professional_situations`, `internship_follow_ups`

## Contraintes et types

| Élément | Détail |
|---|---|
| Types enum | `users_role_enum` (ETUDIANT, ENCADREUR, ENSEIGNANT, ENTREPRISE, ADMINISTRATEUR), `internships_status_enum`, `companies_status_enum`, `evaluations_evaluator_type_enum`, `students_academic_status_enum`, `students_employment_status_enum`, `professional_situations_type_enum`, `follow_ups_type_enum`, `notifications_type_enum` |
| `internships` | CHECK `date_fin > date_debut` |
| `evaluations` | CHECK `note >= 0 AND note <= 20`, unicité (stage, évaluateur, type) |

## Modèle de données

| Table | Rôle |
|---|---|
| `users` | Compte de connexion (email, mot de passe hashé, rôle, actif, reset de mot de passe) |
| `students` | Infos étudiant, lié à `users` (et optionnellement encadreur / entreprise) |
| `companies` | Infos entreprise (+ coordonnées GPS), lié à un compte `ENTREPRISE` |
| `supervisors` | Infos encadreur, lié à un compte `ENCADREUR` |
| `internships` | Relie étudiant, entreprise, encadreur — intitulé, dates et statut |
| `evaluations` | Note (0-20), commentaires et validation d'un stage |
| `notifications` | Messages système pour un utilisateur |
| `professional_situations` | Situation professionnelle d'un étudiant diplômé |
| `internship_follow_ups` | Suivi d'un stage (observation, entretien, rapport) |

## Utilitaires TypeORM

| Commande (dans `suivi_de_stage_backend`) | Effet |
|---|---|
| `npm run migration:run` | Applique les migrations en attente |
| `npm run migration:revert` | Annule la dernière migration |