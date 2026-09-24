## Authentification

Cette API NestJS utilise JWT, Passport et `bcryptjs`. Les mots de passe sont
hashés avant stockage, ne sont jamais renvoyés par l'API et ne sont pas inclus
dans le JWT.

### Configuration

Copier `.env.example` vers `.env`, puis renseigner les paramètres PostgreSQL.
`JWT_SECRET` est lu depuis `.env` et doit contenir au moins 32 caractères. Ne
jamais committer `.env` ni écrire ce secret directement dans le code.

Générer un secret cryptographiquement aléatoire avec Node.js :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64url'))"
```

Puis placer le résultat dans `.env` :

```env
JWT_SECRET=valeur_generee
JWT_EXPIRES_IN=1h
```

### Routes

Le préfixe global `/api` s'applique aux routes d'authentification. Le JWT
contient `id`, `email` et `role`. Les rôles disponibles sont
`ETUDIANT`, `ENCADREUR`, `ENTREPRISE` et `ADMINISTRATEUR`. Les routes peuvent
utiliser `JwtAuthGuard`, `RolesGuard` et `@Roles(...)` pour limiter l'accès.

## Étudiants

Un étudiant possède un compte `User` via une relation `OneToOne` : la colonne
`students.user_id` est unique et référence `users.id`. Les étudiants ne voient
que leur fiche et ne peuvent modifier que leur téléphone et leur adresse.

## Encadreurs

Les routes sont préfixées par `/api/supervisors` :

| Méthode | Route | Accès |
| --- | --- | --- |
| POST | `/api/supervisors` | Administrateur |
| GET | `/api/supervisors` | Administrateur, avec recherche/filtres/pagination |
| GET | `/api/supervisors/me` | Encadreur connecté |
| GET | `/api/supervisors/:id` | Encadreur concerné ou administrateur |
| GET | `/api/supervisors/:id/students` | Encadreur concerné ou administrateur |
| PATCH | `/api/supervisors/:id` | Encadreur concerné ou administrateur |
| DELETE | `/api/supervisors/:id` | Administrateur |

Un `Supervisor` est lié à un compte `User` par une relation `OneToOne` via
`supervisors.user_id`, qui est unique. Les étudiants sont associés à
`users.id` dans `students.encadreur_id` ; cette relation permet de consulter
les étudiants affectés. La future relation avec un stage sera ajoutée dans le
module des stages, sans logique de stage dans ce module.

## Entreprises

Une entreprise est un compte `User` de rôle `ENTREPRISE`. Son profil
`Company` est lié à ce compte par une relation `OneToOne` via
`companies.user_id`, qui est unique. Les étudiants accueillis sont retrouvés
via `students.entreprise_id`, sans créer de logique d'offre ou de stage.

Routes principales sous `/api/companies` :

| Méthode | Route | Accès |
| --- | --- | --- |
| POST | `/api/companies` | Administrateur |
| GET | `/api/companies` | Administrateur, recherche/filtres/pagination |
| GET | `/api/companies/me` | Entreprise connectée |
| GET | `/api/companies/:id` | Entreprise concernée ou administrateur |
| GET | `/api/companies/:id/students` | Entreprise concernée ou administrateur |
| PATCH | `/api/companies/:id` | Entreprise concernée ou administrateur |
| PATCH | `/api/companies/:id/deactivate` | Administrateur |
| DELETE | `/api/companies/:id` | Désactivation par l'administrateur |

Les coordonnées d'entreprise sont prévues pour le futur module Stage. Les
offres de stage, évaluations et autres règles métier ne sont pas implémentées.

## Notifications

Les notifications sont personnelles et accessibles via :

- `GET /api/notifications` ;
- `PATCH /api/notifications/:id/read` ;
- `DELETE /api/notifications/:id`.

Elles sont déclenchées après la sauvegarde effective d'un stage ou d'une
évaluation. `InternshipsService` déclenche les notifications d'affectation,
de modification et de fin ; `EvaluationsService` déclenche les notifications
d'évaluation. Un scheduler NestJS (`NotificationsScheduler`) s'exécute chaque
jour pour détecter les stages dont la fin intervient sous sept jours. La
référence du stage rend cette alerte idempotente.

## Stages

Un stage est créé directement par l'administrateur à partir des informations
fournies par l'EMIT. La plateforme ne gère aucune offre, candidature,
acceptation ou refus de candidature.

Routes sous `/api/internships` :

| Méthode | Route | Accès |
| --- | --- | --- |
| POST | `/api/internships` | Administrateur |
| GET | `/api/internships` | Tous les rôles, dans leur périmètre |
| GET | `/api/internships/:id` | Tous les rôles autorisés sur ce stage |
| PATCH | `/api/internships/:id` | Administrateur ; observations par encadreur/entreprise |
| DELETE | `/api/internships/:id` | Administrateur, suppression logique |

Permissions :

- `ADMINISTRATEUR` : création, affectations, modification des dates, statut,
	observations, consultation, filtres, recherche et suppression logique.
- `ETUDIANT` : consultation de ses propres stages uniquement ; aucune
	modification.
- `ENCADREUR` : consultation des stages qui lui sont affectés et modification
	de leurs observations uniquement.
- `ENTREPRISE` : consultation des stages accueillis et modification de leurs
	observations uniquement.

Les relations sont `Student 1-N Internship`, `Company 1-N Internship` et
`Supervisor 1-N Internship`. Les clés étrangères sont obligatoires et la
relation avec les futurs processus d'évaluation pourra être ajoutée sans
introduire d'offres ou de candidatures.

## Statistiques

## Carte interactive

Les données cartographiques sont disponibles pour les utilisateurs authentifiés
sous `/api/map`. Les réponses sont volontairement limitées aux informations
publiques utiles à l'affichage dans Leaflet/React-Leaflet : elles ne contiennent
ni étudiant, ni adresse e-mail, ni téléphone, ni informations de compte.

| Méthode | Route | Description |
| --- | --- | --- |
| GET | `/api/map/internships` | Points géographiques des stages |
| GET | `/api/map/companies` | Points géographiques des entreprises |

Filtres query communs : `ville`, `region`, `domaine`, `promotion`, `statut` et
`limit`. Le statut accepte les valeurs de `InternshipStatus` (`A_VENIR`,
`EN_COURS`, `TERMINE`, `SUSPENDU`, `ANNULE`). Les stages supprimés logiquement
et les points sans latitude ou longitude sont exclus.

Chaque point de stage contient `id`, `companyId`, `nomEntreprise`,
`latitude`, `longitude`, `ville`, `region`, `domaine`, `statut`, `intitule`,
`description`, `lieu`, `dateDebut` et `dateFin`. Chaque point d'entreprise
contient `id`, `nom`, `latitude`, `longitude`, `ville`, `region`,
`secteurActivite`, `statut` et `nombreStages`.

## Suivi professionnel et insertion

Le statut de diplômé reste un statut académique de l'étudiant ; `ALUMNI` n'est
pas un rôle de connexion. Les situations professionnelles sont historisées
dans `professional_situations` et restent liées au même étudiant.

Routes sous `/api/professional-situations` :

| Méthode | Route | Accès |
| --- | --- | --- |
| POST | `/api/professional-situations` | Étudiant connecté, création pour lui-même |
| GET | `/api/professional-situations/me` | Étudiant connecté, historique personnel |
| PATCH | `/api/professional-situations/:id` | Étudiant propriétaire ou administrateur |
| GET | `/api/professional-situations/student/:studentId` | Administrateur |
| GET | `/api/professional-situations` | Administrateur, toutes les situations |

Une situation contient le type (`EMPLOYE`, `EN_RECHERCHE_EMPLOI`,
`ENTREPRENEUR`, `POURSUITE_ETUDES` ou `AUTRE`), l'entreprise, le poste, le
domaine, la ville, le pays, les dates et une description. Les statistiques
`GET /api/statistics/employment` utilisent la dernière situation connue de
chaque étudiant diplômé et retournent aussi `bySituation`.

Les endpoints du tableau de bord sont réservés à `ADMINISTRATEUR` :

- `GET /api/statistics/dashboard` : compteurs globaux, répartition des stages et insertion professionnelle ;
- `GET /api/statistics/internships` : stages par année, domaine et ville ;
- `GET /api/statistics/employment` : diplômés, employés, recherche d'emploi et taux d'insertion ;
- `GET /api/statistics/geography` : volumes par ville et coordonnées disponibles.

Les réponses utilisent des tableaux d'objets nommés (`year`, `domain`, `city`,
`count`) regroupés sous (`byYear`, `byDomain`, `byCity`, `coordinates`), directement exploitables
par React et Chart.js. Le taux d'insertion est calculé comme
`diplômés employés / diplômés * 100`. Le statut professionnel est renseigné
sur la fiche étudiant (`EMPLOYE`, `RECHERCHE_EMPLOI` ou `NON_RENSEIGNE`).

## Suivi des stages

Les suivis sont des observations historisées liées à un stage et à leur auteur.
Routes sous `/api/internship-tracking` :

| Méthode | Route | Accès |
| --- | --- | --- |
| POST | `/api/internship-tracking/internships/:internshipId` | Administrateur ou encadreur affecté |
| GET | `/api/internship-tracking/internships/:internshipId` | Acteurs autorisés sur le stage |
| PATCH | `/api/internship-tracking/:id` | Administrateur ou auteur encadreur |
| DELETE | `/api/internship-tracking/:id` | Administrateur ou auteur encadreur |

L'encadreur ne peut ajouter, consulter, modifier ou supprimer que les suivis
des stages qui lui sont affectés. L'étudiant consulte uniquement l'historique
de ses propres stages. L'entreprise consulte uniquement les suivis de ses
stages accueillis, sans droit d'écriture. L'administrateur peut tout consulter
et tout gérer.

## Évaluations

Une évaluation est liée à un stage et à un évaluateur de type `ENCADREUR` ou
`ENTREPRISE`. L'encadreur ne peut évaluer que le stage qui lui est affecté et
l'entreprise uniquement un stage qu'elle accueille. L'étudiant ne peut jamais
créer une évaluation, mais peut consulter celles de ses stages.

Routes sous `/api/evaluations` :

- `POST /api/evaluations` : créer une évaluation
- `GET /api/evaluations/internships/:stageId` : consulter les évaluations d'un stage
- `GET /api/evaluations/:id` : consulter une évaluation autorisée
- `PATCH /api/evaluations/:id` : modifier sa propre évaluation ou toute évaluation pour l'administrateur
- `PATCH /api/evaluations/:id/validate` : valider une évaluation, administrateur uniquement

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
