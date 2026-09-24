import 'dotenv/config';
import { hash } from 'bcryptjs';
import { Client } from 'pg';

// Seed du compte administrateur par défaut.
// L'inscription ne permet pas le rôle ADMINISTRATEUR : ce compte est créé ici
// directement en base. Idempotent : ne recrée pas un email déjà présent.
//
// Usage : npm run seed:admin  (depuis suivi_de_stage_backend)

const HOST = process.env.DB_HOST ?? 'localhost';
const PORT = Number(process.env.DB_PORT ?? 5432);
const USERNAME = process.env.DB_USERNAME ?? process.env.DB_USER ?? 'postgres';
const PASSWORD = process.env.DB_PASSWORD ?? '';
const DATABASE =
  process.env.DB_DATABASE ?? process.env.DB_NAME ?? 'db_suivi_stages';

const ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL ?? 'admin@emit.mg').toLowerCase();
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@1234';

async function main() {
  const client = new Client({
    host: HOST,
    port: PORT,
    user: USERNAME,
    password: PASSWORD,
    database: DATABASE,
  });

  await client.connect();

  try {
    const existing = await client.query(
      'SELECT id FROM public.users WHERE LOWER(email) = LOWER($1)',
      [ADMIN_EMAIL],
    );

    if ((existing.rowCount ?? 0) > 0) {
      console.log(`Compte admin déjà présent (${ADMIN_EMAIL}) — aucune action.`);
      return;
    }

    const motDePasse = await hash(ADMIN_PASSWORD, 12);
    const { rows } = await client.query(
      `INSERT INTO public.users
         (nom, prenom, email, mot_de_passe, role, actif)
       VALUES ($1, $2, $3, $4, 'ADMINISTRATEUR', true)
       RETURNING id`,
      ['Administrateur', 'Système', ADMIN_EMAIL, motDePasse],
    );

    console.log(`Compte admin créé : ${ADMIN_EMAIL} (id=${rows[0].id}).`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Seed admin échoué :', err);
  process.exit(1);
});