const { Client } = require('pg');

async function run() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'metmsiloamafiv7',
    database: 'emit_careertrack'
  });
  await client.connect();

  const supMadama = await client.query("SELECT s.id FROM supervisors s JOIN users u ON s.user_id = u.id WHERE u.email = 'madama@gmail.com';");
  const supHery = await client.query("SELECT s.id FROM supervisors s JOIN users u ON s.user_id = u.id WHERE u.email = 'heryfehizoro@gmail.com';");

  const madamaSupId = supMadama.rows[0]?.id;
  const herySupId = supHery.rows[0]?.id;

  const allStages = await client.query("SELECT id FROM internships ORDER BY date_debut DESC;");
  const stageIds = allStages.rows.map(r => r.id);

  if (madamaSupId && stageIds.length >= 3) {
    await client.query("UPDATE internships SET supervisor_id = $1 WHERE id IN ($2, $3, $4);", [
      madamaSupId, stageIds[0], stageIds[1], stageIds[2]
    ]);
    console.log('Assigned 3 stages to madama@gmail.com');
  }

  if (herySupId && stageIds.length >= 6) {
    await client.query("UPDATE internships SET supervisor_id = $1 WHERE id IN ($2, $3, $4);", [
      herySupId, stageIds[3], stageIds[4], stageIds[5]
    ]);
    console.log('Assigned 3 stages to heryfehizoro@gmail.com');
  }

  await client.end();
}

run();
