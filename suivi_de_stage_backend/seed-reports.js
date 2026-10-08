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
  console.log('Connecté à la base de données PostgreSQL.');

  try {
    // 1. Récupérer les enseignants
    const enseignantRes = await client.query(
      "SELECT id, email FROM users WHERE role = 'ENSEIGNANT';"
    );
    console.log('Enseignants trouvés:', enseignantRes.rows);

    let mainTeacherId = enseignantRes.rows.find(u => u.email === 'marie.rakoto.demo@emit.mg')?.id;
    if (!mainTeacherId && enseignantRes.rows.length > 0) {
      mainTeacherId = enseignantRes.rows[0].id;
    }

    // 2. Associer tuteur_id sur TOUS les stages s'il est NULL
    if (mainTeacherId) {
      const updateTuteursRes = await client.query(
        "UPDATE internships SET tuteur_id = $1 WHERE tuteur_id IS NULL RETURNING id;",
        [mainTeacherId]
      );
      console.log(`Updated ${updateTuteursRes.rowCount} stages with tuteur_id = ${mainTeacherId}`);
    }

    // 3. S'assurer que les encadreurs (supervisors) sont bien associés aux stages
    // Vérifier les supervisors existants
    const supRes = await client.query("SELECT s.id, s.user_id, u.email FROM supervisors s JOIN users u ON s.user_id = u.id;");
    console.log('Supervisors existants:', supRes.rows);

    // 4. Ajouter de nouveaux étudiants et leurs stages s'il en faut
    // Créons 2 nouveaux étudiants pour étoffer la base
    const newStudentsData = [
      {
        nom: 'RAHERINIRINA',
        prenom: 'Tolotra',
        email: 'tolotra.raherinirina.demo@emit.mg',
        matricule: 'EMIT-2024-010',
        formation: 'DA2I',
        niveau: 'M2',
        promotion: '2024',
        telephone: '+261 34 88 123 45',
        intitule: 'Développement d’une application mobile Flutter pour le suivi de la collecte de déchets',
        entrepriseNom: 'NEXTECH Madagascar'
      },
      {
        nom: 'ANDRIANARIVO',
        prenom: 'Mialy',
        email: 'mialy.andrianarivo.demo@emit.mg',
        matricule: 'EMIT-2024-011',
        formation: 'ICM',
        niveau: 'M1',
        promotion: '2024',
        telephone: '+261 33 44 987 65',
        intitule: 'Implémentation d’un pipeline CI/CD automatisé et conteneurisation Docker/Kubernetes',
        entrepriseNom: 'Orange Madagascar'
      }
    ];

    const companyRes = await client.query("SELECT id, nom FROM companies;");
    const companies = companyRes.rows;

    for (const studData of newStudentsData) {
      // Check user
      const existingUser = await client.query("SELECT id FROM users WHERE LOWER(email) = LOWER($1);", [studData.email]);
      let userId;
      if (existingUser.rowCount === 0) {
        const uRes = await client.query(
          `INSERT INTO users (nom, prenom, email, mot_de_passe, role, actif, telephone)
           VALUES ($1, $2, $3, '$2a$10$wT3yY1B1K5n8l1O3W4Z6e.r1W2X3Y4Z5A6B7C8D9E0F1G2H3I4J5K', 'ETUDIANT', true, $4)
           RETURNING id;`,
          [studData.nom, studData.prenom, studData.email.toLowerCase(), studData.telephone]
        );
        userId = uRes.rows[0].id;
        console.log(`Utilisateur créé: ${studData.email}`);
      } else {
        userId = existingUser.rows[0].id;
      }

      // Check student
      const existingStud = await client.query("SELECT id FROM students WHERE matricule = $1;", [studData.matricule]);
      let studentId;
      if (existingStud.rowCount === 0) {
        const stRes = await client.query(
          `INSERT INTO students (user_id, matricule, formation, niveau, promotion, telephone, statut_academique, situation_professionnelle)
           VALUES ($1, $2, $3, $4, $5, $6, 'ACTIF', 'NON_RENSEIGNE')
           RETURNING id;`,
          [userId, studData.matricule, studData.formation, studData.niveau, studData.promotion, studData.telephone]
        );
        studentId = stRes.rows[0].id;
        console.log(`Étudiant créé: ${studData.matricule}`);
      } else {
        studentId = existingStud.rows[0].id;
      }

      // Find company
      const comp = companies.find(c => c.nom.toLowerCase().includes(studData.entrepriseNom.toLowerCase())) || companies[0];
      const sup = supRes.rows[0];

      // Check stage
      const existingStage = await client.query("SELECT id FROM internships WHERE student_id = $1;", [studentId]);
      if (existingStage.rowCount === 0 && comp && sup) {
        await client.query(
          `INSERT INTO internships
            (student_id, company_id, supervisor_id, tuteur_id, intitule, description, domaine, lieu, ville, date_debut, date_fin, statut)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'EN_COURS');`,
          [
            studentId,
            comp.id,
            sup.id,
            mainTeacherId,
            studData.intitule,
            'Projet de fin d’études axé sur le développement et les nouvelles technologies.',
            'Informatique & Logiciel',
            'Antananarivo',
            'Antananarivo',
            '2024-08-01',
            '2024-12-31'
          ]
        );
        console.log(`Stage créé pour ${studData.matricule}`);
      }
    }

    // 5. Récupérer tous les stages pour y insérer des rapports (reports)
    const internshipsRes = await client.query("SELECT id, intitule FROM internships;");
    const stages = internshipsRes.rows;
    console.log(`Nombre total de stages pour l'insertion des rapports: ${stages.length}`);

    const reportSamples = [
      {
        type: 'PRISE_EN_MAIN',
        fileName: 'rapport_prise_en_main.pdf',
        originalName: 'Rapport_Prise_en_main.pdf',
        size: 1048576, // 1 MB
        statut: 'APPROUVE',
        commentaire: 'Rapport de prise en main validé. Objectifs de stage clairs et bien définis.'
      },
      {
        type: 'INTERMEDIAIRE',
        fileName: 'rapport_intermediaire.pdf',
        originalName: 'Rapport_Intermédiaire_Avancement.pdf',
        size: 2457600, // 2.3 MB
        statut: 'EN_ATTENTE',
        commentaire: 'En attente de révision par l’encadreur.'
      },
      {
        type: 'FINAL',
        fileName: 'rapport_final_stage.pdf',
        originalName: 'Rapport_Final_Version1.pdf',
        size: 4194304, // 4 MB
        statut: 'REJETE',
        commentaire: 'Veuillez approfondir la section architecture logicielle et corriger la conclusion.'
      },
      {
        type: 'PRISE_EN_MAIN',
        fileName: 'cahier_des_charges_v1.pdf',
        originalName: 'Cahier_Des_Charges_Etude.pdf',
        size: 854000,
        statut: 'APPROUVE',
        commentaire: 'Document bien rédigé.'
      },
      {
        type: 'INTERMEDIAIRE',
        fileName: 'rapport_mi_parcours.pdf',
        originalName: 'Rapport_Mi_Parcours_Stage.pdf',
        size: 1890000,
        statut: 'APPROUVE',
        commentaire: 'Bon avancement du projet.'
      }
    ];

    let reportsInserted = 0;
    for (const [idx, stage] of stages.entries()) {
      // Pour chaque stage, insérons 1 à 3 rapports de démo
      const sample1 = reportSamples[idx % reportSamples.length];
      const sample2 = reportSamples[(idx + 1) % reportSamples.length];

      // Vérifier si des rapports existent déjà pour ce stage
      const existingRep = await client.query("SELECT id FROM reports WHERE stage_id = $1;", [stage.id]);
      if (existingRep.rowCount === 0) {
        await client.query(
          `INSERT INTO reports (stage_id, type, file_name, original_name, size, statut, commentaire, date_creation)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '${idx + 1} days');`,
          [stage.id, sample1.type, sample1.fileName, sample1.originalName, sample1.size, sample1.statut, sample1.commentaire]
        );
        reportsInserted++;

        if (idx % 2 === 0) {
          await client.query(
            `INSERT INTO reports (stage_id, type, file_name, original_name, size, statut, commentaire, date_creation)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '${idx + 3} days');`,
            [stage.id, sample2.type, sample2.fileName, sample2.originalName, sample2.size, sample2.statut, sample2.commentaire]
          );
          reportsInserted++;
        }
      }
    }

    console.log(`✅ TOTAL: ${reportsInserted} rapports ajoutés avec succès !`);

  } catch (err) {
    console.error('Erreur lors du seeding des rapports:', err);
  } finally {
    await client.end();
  }
}

run();
