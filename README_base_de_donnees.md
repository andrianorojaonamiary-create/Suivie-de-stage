# Base de données — Plateforme de suivi des stages (EMIT)

Ce dossier documente le schéma PostgreSQL **géré par les migrations TypeORM** (dossier `backend/src/database/migrations/`). **Ne créez pas le schéma à la main** : la migration initiale crée toutes les tables, enums, index et clés étrangères.

---

## 1. Démarrage rapide (base propre)

```bash
# 1. Configurer le backend
cd backend
cp .env.example .env
# Éditer .env avec vos identifiants PostgreSQL

# 2. Appliquer les migrations (crée le schéma complet)
npm run migration:run

# 3. (Optionnel) Vérifier le schéma
psql -U <user> -d <db> -c "\dt"
```

La migration initiale `1789000000000-SchemaInitial.ts` crée :
- **9 tables** : `users`, `students`, `supervisors`, `companies`, `internships`, `internship_follow_ups`, `evaluations`, `notifications`, `professional_situations`
- **9 enums** : `users_role_enum` (ETUDIANT, ENCADREUR, ENSEIGNANT, ENTREPRISE, ADMINISTRATEUR), `companies_status_enum`, `students_academic_status_enum`, `students_employment_status_enum`, `internships_status_enum`, `evaluations_evaluator_type_enum`, `follow_ups_type_enum`, `notifications_type_enum`, `professional_situations_type_enum`
- **Index** uniques et de performance (FK, filtres, déduplication)
- **Soft delete** sur `students`, `internships` (`date_suppression`)

---

## 2. Variables d'environnement requises (`backend/.env`)

| Variable | Défaut | Description |
|----------|--------|-------------|
| `DB_HOST` | `localhost` | Hôte PostgreSQL |
| `DB_PORT` | `5432` | Port PostgreSQL |
| `DB_USERNAME` | `postgres` | Utilisateur PostgreSQL |
| `DB_PASSWORD` | (requis) | Mot de passe |
| `DB_DATABASE` | `emit_careertrack` | Nom de la base |
| `JWT_SECRET` | (requis, ≥32 caractères) | Secret JWT |
| `JWT_EXPIRES_IN` | `1h` | Expiration token |
| `FRONTEND_URL` | `http://localhost:5173` | Origine CORS (séparées par virgules) |
| `SMTP_HOST/PORT/SECURE/USER/PASS/FROM` | — | Config email (mot de passe oublié) |

> **Note** : les anciennes variables `DB_USER` / `DB_NAME` / `DB_DATABASE=db_suivi_stages` sont **obsolètes** et ignorées.

---

## 3. Modèle de données (résumé)

| Table | Rôle | Clés / Contraintes clés |
|-------|------|-------------------------|
| `users` | Comptes de connexion (email, hash bcrypt, rôle, `actif`, `token_version` pour révocation) | `email` unique, `role` enum |
| `students` | Profil étudiant 1:1 → `users` ; `matricule` unique ; `encadreur_id` / `entreprise_id` → `users` | `matricule` unique, `user_id` unique, soft delete |
| `supervisors` | Profil encadreur 1:1 → `users` ; spécialité, fonction | `user_id` unique |
| `companies` | Profil entreprise 1:1 → `users` ; géolocalisation (lat/lon) ; `statut` ACTIVE/INACTIVE | `user_id` unique, `email` unique |
| `internships` | Stage core (étudiant + entreprise + encadreur) ; dates, statut (A_VENIR..ANNULE), géoloc | FK vers les 3 profils, soft delete, index dates/statut |
| `internship_follow_ups` | Suivi historisé (auteur = `users`, type OBSERVATION/ENTRETIEN/RAPPORT) | FK stage (CASCADE), auteur (RESTRICT), index stage+date |
| `evaluations` | Note 0–20 par (stage, évaluateur, type ENCADREUR/ENTREPRISE) ; `validee` admin | Composite unique `(stage_id, evaluateur_id, type_evaluateur)` |
| `notifications` | Par utilisateur ; types STAGE_AFFECTE, FIN_STAGE_PROCHE, EVALUATION... ; dédup auto | Index destinataire+date, index dédup destinataire+type+reference_id |
| `professional_situations` | Post-diplôme par étudiant (EMPLOYE, EN_RECHERCHE_EMPLOI, ENTREPRENEUR...) | Index étudiant+date_creation |

---

## 4. Intégrité métier (validée côté API)

| Règle | Application |
|-------|-------------|
| `date_fin` > `date_debut` (stage) | DTO `@IsDateString` + service `BadRequestException` |
| Note 0 ≤ note ≤ 20 | DTO `@Min(0) @Max(20)` + `decimal(4,2)` |
| Unicité évaluation par (stage, évaluateur, type) | Index unique + `ConflictException` service |
| Password reset : code 6 chiffres, TTL 15 min, message neutre (anti-énumération) | `crypto.randomInt`, `tokenVersion` incrémentée au logout/changement MDP |
| Token JWT contient `tokenVersion` : logout invalide les tokens existants | `JwtStrategy.validate` vérifie la version |

---

## 5. Régénérer la migration (si entités modifiées)

```bash
# Depuis une base VIDE (important !)
cd backend
npm run migration:generate -- src/database/migrations/NomDescriptif
```

La migration générée reflète **exactement** les 9 entités TypeScript (`autoLoadEntities: true`). Supprimez l'ancienne migration initiale si vous repartez de zéro.

---

## 6. Ancien schéma (historique)

Les migrations `1710000000000-SchemaSuiviStages.ts` et `1720000000000-PasswordReset.ts` (noms français, enums minuscules) ont été **supprimées** : elles ne correspondaient pas aux entités anglaises/majuscules utilisées par l'application. Le schéma réel était maintenu hors dépôt. La migration unique actuelle réaligne le code et la base.

---

## 7. Développement / Tests

```bash
# Lancer backend + frontend
cd ..
npm run dev          # port 3000 (API) + 5173 (Vite)

# Tests backend
cd backend
npm test

# Lint
npm run lint
```

---

## 8. Variables d'environnement du README précédent (obsolètes)

L'ancien `README_base_de_donnees.md` référençait un fichier `schema_db_suivi_stages.sql` **qui n'existait pas** et des variables `DB_USER` / `DB_NAME` / `DB_DATABASE=db_suivi_stages` **incohérentes** avec le code. Cette version corrige et remplace ce document.