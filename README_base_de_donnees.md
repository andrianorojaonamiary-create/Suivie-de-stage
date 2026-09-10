# Base de données — Plateforme de suivi des stages (EMIT)

Ce dossier contient le schéma PostgreSQL du projet, prêt à être importé sur n'importe quelle machine.

## Contenu

- `schema_db_suivi_stages.sql` — structure complète de la base : 11 tables, types enum, clés primaires/étrangères et contraintes `CHECK` (voir ci-dessous). Ne contient **aucune donnée**, uniquement la structure.

## Installation (pour chaque membre de l'équipe)

### 1. Installer PostgreSQL

Si ce n'est pas déjà fait : télécharger sur https://www.postgresql.org/download/ et installer (garder le port par défaut 5432, noter le mot de passe de l'utilisateur `postgres`).

### 2. Créer la base et l'utilisateur du projet

Avec pgAdmin (ou psql) :

```sql
CREATE USER emit_stage_user WITH PASSWORD 'votre_mot_de_passe';
CREATE DATABASE db_suivi_stages OWNER emit_stage_user;
```

### 3. Importer le schéma

Depuis un terminal, dans le dossier contenant `schema_db_suivi_stages.sql` :

**Windows :**
```
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U emit_stage_user -h localhost -d db_suivi_stages -f schema_db_suivi_stages.sql
```

**macOS / Linux :**
```
psql -U emit_stage_user -h localhost -d db_suivi_stages -f schema_db_suivi_stages.sql
```

Entrer le mot de passe d'`emit_stage_user` quand demandé.

### 4. Vérifier

Dans pgAdmin : `db_suivi_stages` → Schemas → public → Tables. Vous devez voir 11 tables : `utilisateurs`, `etudiants`, `promotions`, `filieres`, `entreprises`, `encadreurs`, `stages`, `evaluations`, `notifications`, `situations_professionnelles`, `emplois`.

### 5. Configurer le `.env` du backend NestJS

Dans le projet backend, créer un fichier `.env` (non fourni ici, à créer par chacun individuellement — jamais partagé) :

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=emit_stage_user
DB_PASSWORD=votre_mot_de_passe
DB_NAME=db_suivi_stages
```

## Contraintes d'intégrité

| Table | Contrainte |
|---|---|
| `stages` | `date_fin` doit être postérieure à `date_debut` |
| `evaluations` | `note` doit être comprise entre 0 et 20 |

## Modèle de données

| Table | Rôle |
|---|---|
| `utilisateurs` | Compte de connexion (email, mot de passe, rôle) |
| `etudiants` | Infos étudiant, lié à un utilisateur |
| `encadreurs` | Infos encadreur, lié à un utilisateur |
| `entreprises` | Infos entreprise (+ coordonnées GPS) |
| `promotions` / `filieres` | Classification des étudiants |
| `stages` | Relie étudiant, entreprise, encadreur — dates et statut (`a_venir`, `en_cours`, `termine`) |
| `evaluations` | Note (0-20) et commentaire sur un stage |
| `notifications` | Messages système pour un utilisateur |
| `situations_professionnelles` / `emplois` | Suivi des diplômés après le stage |
