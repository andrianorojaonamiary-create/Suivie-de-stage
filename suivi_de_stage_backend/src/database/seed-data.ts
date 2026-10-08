import 'dotenv/config';
import { hash } from 'bcryptjs';
import { Client } from 'pg';

// ============================================================
// Script de seed complet pour les tests
// Insère des données réalistes : utilisateurs, étudiants,
// encadreurs, entreprises et stages.
//
// Usage : npm run seed:data
// ============================================================

const HOST = process.env.DB_HOST ?? 'localhost';
const PORT = Number(process.env.DB_PORT ?? 5432);
const USERNAME = process.env.DB_USERNAME ?? process.env.DB_USER ?? 'postgres';
const PASSWORD = process.env.DB_PASSWORD ?? '';
const DATABASE =
  process.env.DB_DATABASE ?? process.env.DB_NAME ?? 'emit_careertrack';

const DEFAULT_PASSWORD = 'Test@1234';

// ---------- helpers ----------
async function upsertUser(
  client: Client,
  nom: string,
  prenom: string,
  email: string,
  role: string,
  options: {
    matricule?: string;
    grade?: string;
    departement?: string;
    specialite?: string;
    telephone?: string;
  } = {},
): Promise<string> {
  const existing = await client.query<{ id: string }>(
    'SELECT id FROM public.users WHERE LOWER(email) = LOWER($1)',
    [email],
  );
  if ((existing.rowCount ?? 0) > 0) {
    console.log(`  [SKIP] Utilisateur déjà présent : ${email}`);
    return existing.rows[0].id;
  }
  const mdp = await hash(DEFAULT_PASSWORD, 10);
  const { rows } = await client.query<{ id: string }>(
    `INSERT INTO public.users
       (nom, prenom, email, mot_de_passe, role, actif,
        matricule, grade, departement, specialite, telephone)
     VALUES ($1,$2,$3,$4,$5,true,$6,$7,$8,$9,$10)
     RETURNING id`,
    [
      nom,
      prenom,
      email.toLowerCase(),
      mdp,
      role,
      options.matricule ?? null,
      options.grade ?? null,
      options.departement ?? null,
      options.specialite ?? null,
      options.telephone ?? null,
    ],
  );
  console.log(`  [OK] Utilisateur créé : ${email} (${role})`);
  return rows[0].id;
}

async function upsertStudent(
  client: Client,
  userId: string,
  matricule: string,
  formation: string,
  niveau: string,
  promotion: string,
  telephone: string | null,
  adresse: string | null,
): Promise<string> {
  const existing = await client.query<{ id: string }>(
    'SELECT id FROM public.students WHERE matricule = $1',
    [matricule],
  );
  if ((existing.rowCount ?? 0) > 0) {
    console.log(`  [SKIP] Étudiant déjà présent : ${matricule}`);
    return existing.rows[0].id;
  }
  const { rows } = await client.query<{ id: string }>(
    `INSERT INTO public.students
       (user_id, matricule, formation, niveau, promotion,
        telephone, adresse, statut_academique, situation_professionnelle)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'ACTIF','NON_RENSEIGNE')
     RETURNING id`,
    [userId, matricule, formation, niveau, promotion, telephone, adresse],
  );
  console.log(`  [OK] Étudiant créé : ${matricule}`);
  return rows[0].id;
}

async function upsertSupervisor(
  client: Client,
  userId: string,
  fonction: string,
  specialite: string,
  telephone: string | null,
  entreprise: string | null,
): Promise<string> {
  const existing = await client.query<{ id: string }>(
    'SELECT id FROM public.supervisors WHERE user_id = $1',
    [userId],
  );
  if ((existing.rowCount ?? 0) > 0) {
    console.log(`  [SKIP] Encadreur déjà présent (user_id=${userId})`);
    return existing.rows[0].id;
  }
  const { rows } = await client.query<{ id: string }>(
    `INSERT INTO public.supervisors
       (user_id, fonction, specialite, telephone, entreprise)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id`,
    [userId, fonction, specialite, telephone, entreprise],
  );
  console.log(`  [OK] Encadreur créé (user_id=${userId})`);
  return rows[0].id;
}

async function upsertCompany(
  client: Client,
  userId: string,
  nom: string,
  secteur: string,
  adresse: string,
  ville: string,
  region: string,
  email: string,
  telephone: string | null,
  siteWeb: string | null,
  description: string | null,
  latitude: number | null,
  longitude: number | null,
): Promise<string> {
  const existing = await client.query<{ id: string }>(
    'SELECT id FROM public.companies WHERE LOWER(email) = LOWER($1)',
    [email],
  );
  if ((existing.rowCount ?? 0) > 0) {
    console.log(`  [SKIP] Entreprise déjà présente : ${nom}`);
    return existing.rows[0].id;
  }
  const { rows } = await client.query<{ id: string }>(
    `INSERT INTO public.companies
       (user_id, nom, secteur_activite, adresse, ville, region,
        email, telephone, site_web, description,
        latitude, longitude, statut)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'ACTIVE')
     RETURNING id`,
    [
      userId,
      nom,
      secteur,
      adresse,
      ville,
      region,
      email.toLowerCase(),
      telephone,
      siteWeb,
      description,
      latitude,
      longitude,
    ],
  );
  console.log(`  [OK] Entreprise créée : ${nom}`);
  return rows[0].id;
}

async function upsertInternship(
  client: Client,
  studentId: string,
  companyId: string,
  supervisorId: string | null,
  intitule: string,
  description: string,
  domaine: string,
  lieu: string,
  ville: string,
  dateDebut: string,
  dateFin: string,
  statut: string,
  latitude: number | null,
  longitude: number | null,
): Promise<string> {
  const existing = await client.query<{ id: string }>(
    `SELECT id FROM public.internships
      WHERE student_id=$1 AND company_id=$2 AND date_debut=$3`,
    [studentId, companyId, dateDebut],
  );
  if ((existing.rowCount ?? 0) > 0) {
    console.log(`  [SKIP] Stage déjà présent pour student_id=${studentId}`);
    return existing.rows[0].id;
  }
  const { rows } = await client.query<{ id: string }>(
    `INSERT INTO public.internships
       (student_id, company_id, supervisor_id, intitule, description,
        domaine, lieu, ville, date_debut, date_fin, statut,
        latitude, longitude)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING id`,
    [
      studentId,
      companyId,
      supervisorId,
      intitule,
      description,
      domaine,
      lieu,
      ville,
      dateDebut,
      dateFin,
      statut,
      latitude,
      longitude,
    ],
  );
  console.log(`  [OK] Stage créé : ${intitule}`);
  return rows[0].id;
}

// ============================================================
// DONNÉES DE TEST
// ============================================================

async function main() {
  const client = new Client({ host: HOST, port: PORT, user: USERNAME, password: PASSWORD, database: DATABASE });
  await client.connect();
  console.log(`\n✅ Connecté à la base de données "${DATABASE}"\n`);

  try {
    // ────────────────────────────────────────────────
    // 1. ENCADREURS (enseignants / tuteurs)
    // ────────────────────────────────────────────────
    console.log('── Encadreurs ──────────────────────────────────');

    const encadreur1UserId = await upsertUser(
      client, 'Rakotomalala', 'Jean-Pierre', 'jp.rakotomalala@emit.mg', 'ENCADREUR',
      { grade: 'Maître de conférences', departement: 'Informatique', telephone: '+261 34 10 000 01' },
    );
    const sup1Id = await upsertSupervisor(client, encadreur1UserId, 'Enseignant-chercheur', 'Génie logiciel', '+261 34 10 000 01', null);

    const encadreur2UserId = await upsertUser(
      client, 'Razafindrakoto', 'Hanitriniaina', 'h.razafindrakoto@emit.mg', 'ENCADREUR',
      { grade: 'Professeur', departement: 'Réseaux & Télécoms', telephone: '+261 33 20 000 02' },
    );
    const sup2Id = await upsertSupervisor(client, encadreur2UserId, 'Professeur titulaire', 'Réseaux & Sécurité', '+261 33 20 000 02', null);

    const encadreur3UserId = await upsertUser(
      client, 'Andriamananjara', 'Solo', 's.andriamananjara@emit.mg', 'ENCADREUR',
      { grade: 'Maître assistant', departement: 'Systèmes d\'Information', telephone: '+261 32 30 000 03' },
    );
    const sup3Id = await upsertSupervisor(client, encadreur3UserId, 'Enseignant', 'Base de données & BI', '+261 32 30 000 03', null);

    // ────────────────────────────────────────────────
    // 2. ENTREPRISES (avec comptes utilisateur associés)
    // ────────────────────────────────────────────────
    console.log('\n── Entreprises ─────────────────────────────────');

    const entreprise1UserId = await upsertUser(
      client, 'NEXTECH', 'Madagascar', 'contact@nextech-mg.com', 'ENCADREUR',
      { telephone: '+261 20 22 300 01' },
    );
    const company1Id = await upsertCompany(
      client, entreprise1UserId,
      'NEXTECH Madagascar',
      'Technologies de l\'Information',
      'Lot II M 85 Ankadifotsy',
      'Antananarivo',
      'Analamanga',
      'contact@nextech-mg.com',
      '+261 20 22 300 01',
      'https://www.nextech-mg.com',
      'Entreprise spécialisée dans le développement logiciel et la transformation digitale à Madagascar.',
      -18.9068, 47.5361,
    );

    const entreprise2UserId = await upsertUser(
      client, 'ORANGE', 'Madagascar', 'rh@orange.mg', 'ENCADREUR',
      { telephone: '+261 20 23 500 00' },
    );
    const company2Id = await upsertCompany(
      client, entreprise2UserId,
      'Orange Madagascar',
      'Télécommunications',
      'Immeuble Orange, Ankorondrano',
      'Antananarivo',
      'Analamanga',
      'rh@orange.mg',
      '+261 20 23 500 00',
      'https://www.orange.mg',
      'Opérateur téléphonique leader à Madagascar, offrant des services mobiles, internet et B2B.',
      -18.8952, 47.5290,
    );

    const entreprise3UserId = await upsertUser(
      client, 'BNI', 'Madagascar', 'rh@bni.mg', 'ENCADREUR',
      { telephone: '+261 20 22 200 00' },
    );
    const company3Id = await upsertCompany(
      client, entreprise3UserId,
      'BNI Madagascar',
      'Banque & Finance',
      '74 Rue du 26 Juin 1960, Analakely',
      'Antananarivo',
      'Analamanga',
      'rh@bni.mg',
      '+261 20 22 200 00',
      'https://www.bni.mg',
      'Banque nationale d\'investissement proposant des services bancaires complets pour particuliers et entreprises.',
      -18.9101, 47.5263,
    );

    const entreprise4UserId = await upsertUser(
      client, 'SIGMATEK', 'Consulting', 'info@sigmatek.mg', 'ENCADREUR',
      { telephone: '+261 34 05 111 22' },
    );
    const company4Id = await upsertCompany(
      client, entreprise4UserId,
      'SIGMATEK Consulting',
      'Conseil & Audit Informatique',
      'Immeuble Paositra, Ampefiloha',
      'Antananarivo',
      'Analamanga',
      'info@sigmatek.mg',
      '+261 34 05 111 22',
      null,
      'Cabinet de conseil en systèmes d\'information et audit informatique pour les PME malgaches.',
      -18.9180, 47.5340,
    );

    const entreprise5UserId = await upsertUser(
      client, 'TELMA', 'SA', 'stages@telma.mg', 'ENCADREUR',
      { telephone: '+261 20 22 600 00' },
    );
    const company5Id = await upsertCompany(
      client, entreprise5UserId,
      'TELMA SA',
      'Télécommunications',
      'ZI Forello, Tanjombato',
      'Antananarivo',
      'Analamanga',
      'stages@telma.mg',
      '+261 20 22 600 00',
      'https://www.telma.mg',
      'Premier opérateur fixe et internet de Madagascar, présent dans toutes les régions.',
      -18.9500, 47.5192,
    );

    // ────────────────────────────────────────────────
    // 3. ÉTUDIANTS
    // ────────────────────────────────────────────────
    console.log('\n── Étudiants ───────────────────────────────────');

    const stud1UserId = await upsertUser(
      client, 'Rabemananjara', 'Fanantenana', 'f.rabemananjara@etu.emit.mg', 'ETUDIANT',
      { telephone: '+261 34 11 222 33' },
    );
    const stud1Id = await upsertStudent(
      client, stud1UserId, '001I24', 'DA2I', 'M2', '2024',
      '+261 34 11 222 33', 'Lot III A 12 Ankadivato, Antananarivo',
    );

    const stud2UserId = await upsertUser(
      client, 'Andriantsoa', 'Harilalaina', 'h.andriantsoa@etu.emit.mg', 'ETUDIANT',
      { telephone: '+261 33 22 333 44' },
    );
    const stud2Id = await upsertStudent(
      client, stud2UserId, '002M24', 'ICM', 'M1', '2024',
      '+261 33 22 333 44', 'Villa 7 Cité Meva, Fianarantsoa',
    );

    const stud3UserId = await upsertUser(
      client, 'Razafindrabe', 'Tsilavina', 't.razafindrabe@etu.emit.mg', 'ETUDIANT',
      { telephone: '+261 32 33 444 55' },
    );
    const stud3Id = await upsertStudent(
      client, stud3UserId, '003C24', 'CIGSI', 'L3', '2024',
      '+261 32 33 444 55', 'Rue de l\'Indépendance, Toamasina',
    );

    const stud4UserId = await upsertUser(
      client, 'Rakotoarimanana', 'Miora', 'm.rakotoarimanana@etu.emit.mg', 'ETUDIANT',
      { telephone: '+261 34 44 555 66' },
    );
    const stud4Id = await upsertStudent(
      client, stud4UserId, '004I24', 'DA2I', 'M1', '2024',
      '+261 34 44 555 66', 'Lot IVC 45 Ambohimanarina, Antananarivo',
    );

    const stud5UserId = await upsertUser(
      client, 'Rasoanaivo', 'Nirina', 'n.rasoanaivo@etu.emit.mg', 'ETUDIANT',
      { telephone: '+261 33 55 666 77' },
    );
    const stud5Id = await upsertStudent(
      client, stud5UserId, '005A24', 'AES', 'L3', '2024',
      '+261 33 55 666 77', 'Cité Universitaire, Ankatso, Antananarivo',
    );

    const stud6UserId = await upsertUser(
      client, 'Randriamihaja', 'Ny Aina', 'nyaina.randriamihaja@etu.emit.mg', 'ETUDIANT',
      { telephone: '+261 32 66 777 88' },
    );
    const stud6Id = await upsertStudent(
      client, stud6UserId, '006M23', 'ICM', 'M2', '2023',
      '+261 32 66 777 88', 'Villa Rosa, Ambatobe, Antananarivo',
    );

    const stud7UserId = await upsertUser(
      client, 'Ratsimbazafy', 'Lova', 'l.ratsimbazafy@etu.emit.mg', 'ETUDIANT',
      { telephone: '+261 34 77 888 99' },
    );
    const stud7Id = await upsertStudent(
      client, stud7UserId, '007C23', 'CIGSI', 'M1', '2023',
      '+261 34 77 888 99', 'Quartier Ambohipo, Antananarivo',
    );

    const stud8UserId = await upsertUser(
      client, 'Andriamampionona', 'Fenitra', 'f.andriamampionona@etu.emit.mg', 'ETUDIANT',
      { telephone: '+261 33 88 999 00' },
    );
    const stud8Id = await upsertStudent(
      client, stud8UserId, '008I23', 'DA2I', 'L3', '2023',
      '+261 33 88 999 00', 'Rue Jean Laborde, Tanambao, Toamasina',
    );

    // ────────────────────────────────────────────────
    // 4. STAGES
    // ────────────────────────────────────────────────
    console.log('\n── Stages ──────────────────────────────────────');

    // Stage 1 — EN_COURS
    await upsertInternship(
      client,
      stud1Id, company1Id, sup1Id,
      'Développement d\'une application de gestion des ressources humaines',
      'Conception et développement d\'une application web full-stack pour la gestion du personnel de NEXTECH Madagascar. Technologies utilisées : React, NestJS, PostgreSQL.',
      'Génie Logiciel',
      'Lot II M 85 Ankadifotsy, Antananarivo',
      'Antananarivo',
      '2024-07-01', '2024-12-31',
      'EN_COURS',
      -18.9068, 47.5361,
    );

    // Stage 2 — EN_COURS
    await upsertInternship(
      client,
      stud2Id, company2Id, sup2Id,
      'Optimisation du réseau 5G – Analyse des performances',
      'Participation à l\'équipe réseau d\'Orange Madagascar pour l\'analyse et l\'optimisation des performances du réseau 5G déployé sur l\'axe Antananarivo–Toamasina.',
      'Réseaux & Télécommunications',
      'Immeuble Orange, Ankorondrano, Antananarivo',
      'Antananarivo',
      '2024-06-15', '2024-11-15',
      'EN_COURS',
      -18.8952, 47.5290,
    );

    // Stage 3 — TERMINE
    await upsertInternship(
      client,
      stud3Id, company3Id, sup3Id,
      'Mise en place d\'un système de détection de fraude bancaire',
      'Développement d\'un module de détection de transactions frauduleuses basé sur des règles métier et des algorithmes de scoring pour le département informatique de BNI Madagascar.',
      'Systèmes d\'Information',
      '74 Rue du 26 Juin 1960, Analakely, Antananarivo',
      'Antananarivo',
      '2024-02-01', '2024-07-31',
      'TERMINE',
      -18.9101, 47.5263,
    );

    // Stage 4 — A_VENIR
    await upsertInternship(
      client,
      stud4Id, company4Id, sup1Id,
      'Audit de sécurité et plan de remédiation',
      'Réalisation d\'un audit complet de la sécurité informatique d\'une PME cliente de SIGMATEK, identification des vulnérabilités et élaboration d\'un plan de remédiation.',
      'Sécurité Informatique',
      'Immeuble Paositra, Ampefiloha, Antananarivo',
      'Antananarivo',
      '2025-01-06', '2025-06-30',
      'A_VENIR',
      -18.9180, 47.5340,
    );

    // Stage 5 — EN_COURS
    await upsertInternship(
      client,
      stud5Id, company5Id, sup2Id,
      'Analyse des données clients pour la segmentation marketing',
      'Extraction, nettoyage et analyse des données clients TELMA afin de construire des segments marketing personnalisés et d\'identifier des opportunités d\'upsell sur la base abonnés mobile.',
      'Intelligence d\'Affaires (BI)',
      'ZI Forello, Tanjombato, Antananarivo',
      'Antananarivo',
      '2024-09-02', '2025-02-28',
      'EN_COURS',
      -18.9500, 47.5192,
    );

    // Stage 6 — TERMINE
    await upsertInternship(
      client,
      stud6Id, company1Id, sup3Id,
      'Refonte de l\'interface utilisateur de la plateforme e-commerce',
      'Migration de l\'interface legacy vers une architecture React moderne, intégration d\'un design system et amélioration de l\'accessibilité (WCAG 2.1) pour la plateforme e-commerce de NEXTECH.',
      'Développement Web Frontend',
      'Lot II M 85 Ankadifotsy, Antananarivo',
      'Antananarivo',
      '2024-01-08', '2024-06-07',
      'TERMINE',
      -18.9068, 47.5361,
    );

    // Stage 7 — EN_ATTENTE
    await upsertInternship(
      client,
      stud7Id, company2Id, sup2Id,
      'Déploiement et supervision d\'infrastructure cloud hybride',
      'Aide à la mise en place d\'une infrastructure cloud hybride (AWS + on-premise) pour les services internes d\'Orange Madagascar, incluant la supervision et l\'automatisation des déploiements avec Terraform et Ansible.',
      'Cloud & DevOps',
      'Immeuble Orange, Ankorondrano, Antananarivo',
      'Antananarivo',
      '2025-02-01', '2025-07-31',
      'EN_ATTENTE',
      -18.8952, 47.5290,
    );

    // Stage 8 — SUSPENDU
    await upsertInternship(
      client,
      stud8Id, company3Id, sup1Id,
      'Développement d\'une API REST pour le module de virements internationaux',
      'Conception et développement d\'une API sécurisée (OAuth 2.0 / JWT) permettant aux partenaires bancaires de BNI Madagascar d\'initier et de suivre des virements internationaux SWIFT.',
      'Développement Backend',
      '74 Rue du 26 Juin 1960, Analakely, Antananarivo',
      'Antananarivo',
      '2024-04-01', '2024-09-30',
      'SUSPENDU',
      -18.9101, 47.5263,
    );

    console.log('\n🎉 Seed terminé avec succès !\n');
    console.log('Comptes créés (mot de passe par défaut : Test@1234) :');
    console.log('  Encadreurs : jp.rakotomalala@emit.mg | h.razafindrakoto@emit.mg | s.andriamananjara@emit.mg');
    console.log('  Étudiants  : f.rabemananjara@etu.emit.mg | h.andriantsoa@etu.emit.mg | t.razafindrabe@etu.emit.mg');
    console.log('             : m.rakotoarimanana@etu.emit.mg | n.rasoanaivo@etu.emit.mg | nyaina.randriamihaja@etu.emit.mg');
    console.log('             : l.ratsimbazafy@etu.emit.mg | f.andriamampionona@etu.emit.mg');
    console.log('  Admin      : admin@emit.mg (Admin@1234)');

  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('❌ Seed échoué :', err);
  process.exit(1);
});
