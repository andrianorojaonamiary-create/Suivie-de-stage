import 'dotenv/config';
import { Client } from 'pg';

const HOST = process.env.DB_HOST ?? 'localhost';
const PORT = Number(process.env.DB_PORT ?? 5432);
const USERNAME = process.env.DB_USERNAME ?? 'postgres';
const PASSWORD = process.env.DB_PASSWORD ?? '';
const DATABASE = process.env.DB_DATABASE ?? 'emit_careertrack';

// Ancien matricule → Nouveau matricule
const UPDATES: [string, string][] = [
  ['ETU-2024-001', '001I24'],
  ['ETU-2024-002', '002M24'],
  ['ETU-2024-003', '003C24'],
  ['ETU-2024-004', '004I24'],
  ['ETU-2024-005', '005A24'],
  ['ETU-2023-010', '006M23'],
  ['ETU-2023-011', '007C23'],
  ['ETU-2023-012', '008I23'],
];

async function main() {
  const client = new Client({ host: HOST, port: PORT, user: USERNAME, password: PASSWORD, database: DATABASE });
  await client.connect();
  console.log(`\n✅ Connecté à "${DATABASE}"\n`);

  try {
    for (const [oldMat, newMat] of UPDATES) {
      const result = await client.query(
        'UPDATE public.students SET matricule = $1 WHERE matricule = $2 RETURNING matricule',
        [newMat, oldMat],
      );
      if ((result.rowCount ?? 0) > 0) {
        console.log(`  [OK]   ${oldMat}  →  ${newMat}`);
      } else {
        console.log(`  [SKIP] ${oldMat} introuvable en base`);
      }
    }

    const { rows } = await client.query(
      'SELECT matricule, formation, promotion FROM public.students ORDER BY matricule',
    );
    console.log('\nMatricules actuels en base :');
    rows.forEach((r) =>
      console.log(`  ${r.matricule.padEnd(8)} | ${r.formation.padEnd(6)} | promo ${r.promotion}`),
    );
  } finally {
    await client.end();
  }

  console.log('\n🎉 Mise à jour terminée.\n');
}

main().catch((err) => {
  console.error('❌ Erreur :', err);
  process.exit(1);
});
