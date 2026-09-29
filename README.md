# EMIT — Plateforme de Suivi des Stages

Monorepo NestJS + React (Vite) pour la gestion des stages étudiants de l'EMIT (Fianarantsoa, Madagascar).

---

## Stack

| Côté | Tech |
|------|------|
| **Backend** | NestJS 11, TypeORM 0.3, PostgreSQL, Passport-JWT, bcryptjs, Nodemailer, @nestjs/schedule |
| **Frontend** | React 19, Vite 8, React Router 7, Axios, Leaflet, Recharts, Bootstrap 5, Zod |
| **Auth** | JWT (access token 1h), `tokenVersion` pour révocation serveur, reset MDP par code 6 chiffres email |
| **Rôles** | `ETUDIANT`, `ENCADREUR`, `ENSEIGNANT`, `ENTREPRISE`, `ADMINISTRATEUR` |

---

## Arborescence

```
├── backend/          # NestJS API (port 3000, préfixe /api)
│   ├── src/
│   │   ├── auth/           # Register, login, forgot/reset password, JWT, guards
│   │   ├── users/          # Comptes de base
│   │   ├── students/       # Profil étudiant + matricule/formation
│   │   ├── supervisors/    # Profil encadreur
│   │   ├── companies/      # Profil entreprise + géoloc
│   │   ├── internships/    # Stage core (étudiant+entreprise+encadreur)
│   │   ├── internship-tracking/  # Suivi historisé
│   │   ├── evaluations/    # Notes 0–20 + validation admin
│   │   ├── notifications/  # Temps réel + scheduler (fin stage proche)
│   │   ├── statistics/     # Agrégats admin (carte, insertion, par année/domaine)
│   │   ├── professional-situations/  # Post-diplôme
│   │   ├── map/            # Endpoints Leaflet (public)
│   │   └── database/       # TypeORM DataSource + migration unique
│   └── test/
├── frontend/         # React + Vite (port 5173)
│   ├── src/
│   │   ├── api/              # Axios client + 14 modules API
│   │   ├── context/AuthProvider.jsx  # AuthContext + tokenVersion sync
│   │   ├── pages/
│   │   │   ├── admin/        # Dashboard, stats, CRUD users/stages/entreprises...
│   │   │   ├── enseignant/   # Vues encadrantes (évals, rapports, stages)
│   │   │   ├── encadreur/    # Vues encadrantes (quasi identiques à enseignant)
│   │   │   └── etudiant/     # Mon stage, encadreur, entreprise, suivi, avenir
│   │   ├── components/
│   │   └── styles/           # 53 fichiers CSS + tokens (emit-theme.css)
├── package.json        # Workspaces root (concurrently dev)
└── README_base_de_donnees.md
```

---

## Démarrage

```bash
# 1. Dépendances (workspaces)
npm install

# 2. Configurer le backend
cd backend
cp .env.example .env
# → définir DB_*, JWT_SECRET, SMTP_*, FRONTEND_URL

# 3. Base de données (PostgreSQL requis, port 5432)
# La migration initiale crée le schéma complet
npm run migration:run

# 4. Lancer les deux serveurs
cd ..
npm run dev
```

> L'API répond sur `http://localhost:3000/api`  
> Le front sur `http://localhost:5173`

---

## Scripts racine

| Commande | Description |
|----------|-------------|
| `npm run dev` | `concurrently` backend (`start:dev`) + frontend (`vite`) |
| `npm run dev:backend` | NestJS watch mode seul |
| `npm run dev:frontend` | Vite dev server seul |
| `npm run build` | `build` backend + frontend |
| `npm run lint` | ESLint backend + frontend |
| `npm test` | Tests backend (Jest) |
| `npm run migration:generate` | Génère migration TypeORM |
| `npm run migration:run` | Applique les migrations |

---

## Variables d'environnement principales (`backend/.env`)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=emit_careertrack
JWT_SECRET=your_32_char_random_secret_minimum
JWT_EXPIRES_IN=1h
FRONTEND_URL=http://localhost:5173

# SMTP (Gmail app password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your_16_char_app_password
SMTP_FROM=your@gmail.com
```

---

## Fonctionnalités clés

- **Auth** : Register (forcé `ETUDIANT`), login, forgot password (code 6ch CSPRNG + email), reset, logout (révoque tokens via `tokenVersion`).
- **RBAC** : Guards `JwtAuthGuard` + `RolesGuard` + décorateur `@Roles(...)` sur tous les contrôleurs.
- **Stages** : Cycle complet étudiant → entreprise → encadreur → suivi → évaluation → rapport.
- **Carte** : Endpoints `/map/internships` et `/map/companies` (GeoJSON-ready pour Leaflet).
- **Notifications** : Scheduler 8h (stages finissant dans 7j) + déduplication + temps réel.
- **Stats** : Dashboard admin (KPIs, par année/domaine/ville, taux insertion, géographie).
- **Export PDF** : `jspdf` + `html2canvas` sur pages rapports.

---

## Tests & Qualité

```bash
cd backend
npm test           # 48 tests (unit + guards + services)
npm run lint       # 0 erreurs (warn sur raw SQL TypeORM + setState-in-effect frontend)

cd ../frontend
npm run lint       # 0 erreurs (8 warn set-state-in-effect, pattern fetch-on-mount)
npm run build      # Production build OK
```

---

## Dette technique connue (non corrigée dans ce passage)

| Zone | Description | Effort estimé |
|------|-------------|---------------|
| **Doublons enseignant/encadreur** | 8 fichiers ~90% identiques (RejectModal, ValidateModal, EvaluationForm, Rapports, StudentDetail, Evaluations, Observations, ViewModal, Etudiants) | ~1 jour (fusion en pages partagées paramétrées par rôle) |
| **AuthorizationService** | `ensureAdmin` ×5, contrôle accès stage ×3, `saveOrConflict` ×6 extraits en helper ; `findEntity` deep ×6 encore dupliqués | ~0.5 jour |
| **Pagination manquante** | 5 endpoints non bornés (pro-situations ×3, supervisors/:id/students, companies/:id/students) | ~0.5 jour |
| **CSS** | 53 fichiers / 24k lignes, tous chargés globalement ; Tailwind v4 installé mais inutilisé | ~1 jour (supprimer Tailwind, split CSS par route, tokens complets) |
| **Pages monolithiques** | `etudiant/MonAvenir.jsx` 754 lignes, `admin/Diplomes.jsx` 584 lignes | Refactor progressif |

---

## Sécurité

- Secret Gmail **révoqué** (était commité dans l'historique — changer le mot de passe d'application).
- `logout` invalide les tokens existants (`tokenVersion` incrémentée, vérifiée à chaque requête dans `JwtStrategy`).
- Rate limiting `@nestjs/throttler` global (300 req/min/IP) + resserré sur auth (login 10/min, reset 5/min).
- Helmet activé.
- Reset MDP : code CSPRNG, message neutre anti-énumération, TTL 15 min.

---

## Auteurs / Contexte

Projet étudiant EMIT (École de Management et d'Informatique de Tana / Fianarantsoa).  
Code ouvert à contribution — voir les sections "Dette technique" pour les chantiers prioritaires.