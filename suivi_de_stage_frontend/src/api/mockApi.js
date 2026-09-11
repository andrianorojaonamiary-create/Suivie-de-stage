import api from './index';

// ============================================================
// BASE DE DONNÉES SIMULÉE (AVEC PROXY VERS LE BACKEND RÉEL)
// ============================================================

// ===== UTILISATEURS =====
const users = [
  // Admin
  {
    id: 1,
    nom: 'Admin',
    prenom: 'Admin',
    email: 'admin@emit.mg',
    password: 'admin123',
    telephone: '032 10 000 01',
    role: 'ROLE_ADMIN',
    dateCreation: new Date().toISOString()
  },
  // Étudiant
  {
    id: 2,
    nom: 'Rakoto',
    prenom: 'Miora',
    email: 'etudiant@test.mg',
    password: 'test1234',
    telephone: '032 10 000 02',
    role: 'ROLE_ETUDIANT',
    dateCreation: new Date().toISOString(),
    matricule: 'ETU-2024-0421',
    niveau: 'Master 2',
    filiere: 'Génie Logiciel',
    ville: 'Antananarivo'
  },
  // Enseignant
  {
    id: 3,
    nom: 'Andrianivo',
    prenom: 'Jean',
    email: 'enseignant@emit.mg',
    password: 'test1234',
    telephone: '032 10 000 03',
    role: 'ROLE_ENSEIGNANT',
    dateCreation: new Date().toISOString(),
    grade: 'Professeur',
    departement: 'Informatique',
    specialite: 'Génie logiciel',
    staffId: 'ENS-2024-042'
  },
  // Encadreur (Maître de stage)
  {
    id: 4,
    nom: 'Rakotomalala',
    prenom: 'Jean',
    email: 'encadreur@test.mg',
    password: 'test1234',
    telephone: '032 10 000 04',
    role: 'ROLE_ENCADREUR',
    dateCreation: new Date().toISOString(),
    entreprise: 'TechMada SARL',
    poste: 'Directeur technique',
    adresse: 'Lot II M 77, Antananarivo',
    secteur: "Technologies de l'information"
  }
];

// ===== ENTREPRISES =====
const entreprises = [
  {
    id: 1,
    nom: 'TechMada SARL',
    domaine: "Technologies de l'information",
    adresse: 'Lot II M 77, Antananarivo',
    ville: 'Antananarivo',
    telephone: '+261 34 12 345 67',
    email: 'contact@techmada.mg',
    site: 'www.techmada.mg',
    description: 'TechMada est une entreprise spécialisée dans le développement de solutions logicielles.',
    lat: -18.8792,
    lng: 47.5079
  },
  {
    id: 2,
    nom: 'Airtel Madagascar',
    domaine: 'Télécommunications',
    adresse: "Avenue de l'Indépendance, Antananarivo",
    ville: 'Antananarivo',
    telephone: '+261 34 12 345 68',
    email: 'contact@airtel.mg',
    site: 'www.airtel.mg',
    description: 'Opérateur de télécommunications mobile et internet.',
    lat: -18.8792,
    lng: 47.5079
  },
  {
    id: 3,
    nom: 'BNI Madagascar',
    domaine: 'Banque et Finance',
    adresse: 'Rue Ravoninahitriniarivo, Antananarivo',
    ville: 'Antananarivo',
    telephone: '+261 34 12 345 69',
    email: 'contact@bni.mg',
    site: 'www.bni.mg',
    description: "Banque nationale d'investissement.",
    lat: -18.8792,
    lng: 47.5079
  }
];

// ===== ENCADREURS (Maîtres de stage) =====
const encadreurs = [
  {
    id: 1,
    nom: 'Rakotomalala',
    prenom: 'Jean',
    fonction: 'Directeur technique',
    entreprise: 'TechMada SARL',
    email: 'j.rakotomalala@techmada.mg',
    telephone: '+261 34 12 345 78',
    specialite: 'Développement logiciel',
    etudiants: ['Miora Rakoto', 'Hery Rakotondrabe']
  },
  {
    id: 2,
    nom: 'Ralava',
    prenom: 'Marie',
    fonction: 'Responsable RH',
    entreprise: 'Airtel Madagascar',
    email: 'm.ralava@airtel.mg',
    telephone: '+261 34 12 345 79',
    specialite: 'Gestion des ressources humaines',
    etudiants: ['Fanja Andriantsoa']
  },
  {
    id: 3,
    nom: 'Randrianarison',
    prenom: 'Hery',
    fonction: 'Directeur des systèmes',
    entreprise: 'BNI Madagascar',
    email: 'h.randrianarison@bni.mg',
    telephone: '+261 34 12 345 80',
    specialite: 'Sécurité informatique',
    etudiants: ['Ramanantsoa Tojo']
  }
];

// ===== STAGES (AVEC VALIDATION) =====
const stages = [
  {
    id: 1,
    titre: "Développement d'une plateforme web de gestion RH",
    etudiant: 'Miora Rakoto',
    etudiantId: 2,
    entreprise: 'TechMada SARL',
    entrepriseId: 1,
    encadreur: 'M. Rakotomalala',
    encadreurId: 1,
    ville: 'Antananarivo',
    adresse: 'Lot II M 77, Antananarivo',
    dateDebut: '2024-03-01',
    dateFin: '2024-09-15',
    statut: 'En cours',           // Statut général : En cours | En attente | Terminé
    statutValidation: 'valide',    // Statut de validation : en_attente | valide | refuse
    tuteur: 'Prof. Andrianivo',
    enseignantId: 3,              // L'enseignant qui doit valider
    description: "Développement d'une plateforme web de gestion des ressources humaines.",
    progression: 65,
    commentaireValidation: 'Stage conforme aux attentes, bon travail.',
    dateValidation: '2024-03-15'
  },
  {
    id: 2,
    titre: "Application mobile de gestion des comptes",
    etudiant: 'Hery Rakotondrabe',
    etudiantId: 5,
    entreprise: 'Airtel Madagascar',
    entrepriseId: 2,
    encadreur: 'Mme. Ralava',
    encadreurId: 2,
    ville: 'Antananarivo',
    adresse: "Avenue de l'Indépendance, Antananarivo",
    dateDebut: '2024-04-01',
    dateFin: '2024-10-01',
    statut: 'En attente',
    statutValidation: 'en_attente',
    tuteur: 'Dr. Ranaivo',
    enseignantId: 3,
    description: "Développement d'une application mobile de gestion des comptes clients.",
    progression: 30,
    commentaireValidation: null,
    dateValidation: null
  },
  {
    id: 3,
    titre: "Migration et sécurisation du système d'information",
    etudiant: 'Ramanantsoa Tojo',
    etudiantId: 6,
    entreprise: 'BNI Madagascar',
    entrepriseId: 3,
    encadreur: 'M. Randrianarison',
    encadreurId: 3,
    ville: 'Antananarivo',
    adresse: 'Rue Ravoninahitriniarivo, Antananarivo',
    dateDebut: '2024-05-01',
    dateFin: '2024-11-01',
    statut: 'En attente',
    statutValidation: 'en_attente',
    tuteur: 'Prof. Andrianivo',
    enseignantId: 3,
    description: "Migration du système d'information vers une architecture sécurisée.",
    progression: 15,
    commentaireValidation: null,
    dateValidation: null
  },
  {
    id: 4,
    titre: "Analyse de données pour la relation client",
    etudiant: 'Andriantsoa Fanja',
    etudiantId: 7,
    entreprise: 'Airtel Madagascar',
    entrepriseId: 2,
    encadreur: 'Mme. Ralava',
    encadreurId: 2,
    ville: 'Antananarivo',
    adresse: "Avenue de l'Indépendance, Antananarivo",
    dateDebut: '2024-06-01',
    dateFin: '2024-12-01',
    statut: 'En attente',
    statutValidation: 'en_attente',
    tuteur: 'Dr. Ranaivo',
    enseignantId: 3,
    description: "Analyse des données clients pour améliorer la relation client.",
    progression: 10,
    commentaireValidation: null,
    dateValidation: null
  },
  {
    id: 5,
    titre: "Développement d'une plateforme de e-learning",
    etudiant: 'Rakotondrabe Hery',
    etudiantId: 5,
    entreprise: 'TechMada SARL',
    entrepriseId: 1,
    encadreur: 'M. Rakotomalala',
    encadreurId: 1,
    ville: 'Antananarivo',
    adresse: 'Lot II M 77, Antananarivo',
    dateDebut: '2024-02-01',
    dateFin: '2024-08-01',
    statut: 'Terminé',
    statutValidation: 'refuse',    // Refusé avec commentaire
    tuteur: 'Prof. Andrianivo',
    enseignantId: 3,
    description: "Développement d'une plateforme de e-learning pour les employés.",
    progression: 100,
    commentaireValidation: 'Stage non conforme au référentiel, travail insuffisant.',
    dateValidation: '2024-02-15'
  }
];

// ===== RAPPORTS =====
const rapports = [
  {
    id: 1,
    stageId: 1,
    etudiant: 'Miora Rakoto',
    titre: 'Rapport de prise en main',
    fileName: 'rapport_prise_en_main.pdf',
    date: '20 Mar 2024',
    status: 'Validé',
    size: '1.2 MB',
    commentaire: 'Très bon travail !'
  },
  {
    id: 2,
    stageId: 1,
    etudiant: 'Miora Rakoto',
    titre: 'Rapport intermédiaire',
    fileName: 'rapport_intermediaire.pdf',
    date: '15 Mai 2024',
    status: 'En révision',
    size: '2.4 MB',
    commentaire: 'En attente de validation'
  },
  {
    id: 3,
    stageId: 2,
    etudiant: 'Hery Rakotondrabe',
    titre: 'Rapport de prise en main',
    fileName: null,
    date: '—',
    status: 'À déposer',
    size: '—',
    commentaire: 'À déposer avant le 01 Avr 2024'
  }
];

// ===== ÉVALUATIONS =====
const evaluations = [
  {
    id: 1,
    stageId: 1,
    etudiant: 'Miora Rakoto',
    titre: 'Évaluation de mi-parcours',
    date: '01 Jun 2024',
    status: 'Validé',
    note: '16.3',
    commentaire: 'Stagiaire sérieux, motivé et impliqué.',
    evaluateur: 'Prof. Andrianivo',
    role: 'Tuteur pédagogique',
    type: 'tuteur'
  },
  {
    id: 2,
    stageId: 1,
    etudiant: 'Miora Rakoto',
    titre: 'Évaluation de fin de stage',
    date: '28/09/2026',
    status: 'Validé',
    note: '16.3',
    commentaire: 'Stagiaire sérieux, motivé et impliqué. Bonnes compétences techniques.',
    evaluateur: 'M. Rakotomalala',
    role: 'Maître de stage',
    type: 'encadreur',
    criteres: [
      { nom: 'Compétences techniques', note: 16, appreciation: 'Très satisfaisant' },
      { nom: 'Qualité du travail', note: 17, appreciation: 'Excellent' },
      { nom: 'Autonomie', note: 15, appreciation: 'Satisfaisant' },
      { nom: 'Respect des délais', note: 18, appreciation: 'Excellent' },
      { nom: "Intégration dans l'équipe", note: 16, appreciation: 'Très satisfaisant' },
      { nom: 'Communication', note: 15, appreciation: 'Satisfaisant' },
      { nom: 'Comportement professionnel', note: 17, appreciation: 'Excellent' }
    ]
  },
  {
    id: 3,
    stageId: 2,
    etudiant: 'Hery Rakotondrabe',
    titre: 'Évaluation de mi-parcours',
    date: '15 Jun 2024',
    status: 'En attente',
    note: null,
    commentaire: null,
    evaluateur: 'Dr. Ranaivo',
    role: 'Tuteur pédagogique',
    type: 'tuteur'
  }
];

// ============================================================
// NOTIFICATIONS PAR RÔLE
// ============================================================

const getNotifications = (role) => {
  const baseNotifications = [
    { id: 1, type: 'Bienvenue', text: 'Bienvenue sur la plateforme de suivi des stages', time: 'Maintenant', read: false }
  ];

  const roleNotifications = {
    'ROLE_ADMIN': [
      { id: 2, type: 'Système', text: 'Nouvel utilisateur inscrit : Miora Rakoto', time: 'Il y a 12 min', read: false },
      { id: 3, type: 'Validation', text: 'Stage validé pour TechMada SARL par l\'enseignant', time: 'Il y a 45 min', read: false },
      { id: 4, type: 'Alerte', text: '5 stages en attente de validation', time: 'Il y a 2 h', read: false },
      { id: 5, type: 'Statistique', text: 'Rapport mensuel des stages disponible', time: 'Il y a 3 h', read: true }
    ],
    'ROLE_ETUDIANT': [
      { id: 2, type: 'Validation', text: 'Votre stage chez TechMada SARL a été validé', time: 'Il y a 12 min', read: false },
      { id: 3, type: 'Rapport', text: 'Rapport intermédiaire à déposer', time: 'Il y a 45 min', read: false },
      { id: 4, type: 'Commentaire', text: 'Prof. Andrianivo a commenté votre stage', time: 'Il y a 2 h', read: false },
      { id: 5, type: 'Rapport', text: 'Votre rapport de prise en main a été accepté', time: 'Hier à 14:30', read: true }
    ],
    'ROLE_ENSEIGNANT': [
      { id: 2, type: 'Stage', text: 'Nouveau stage en attente de validation (Miora Rakoto)', time: 'Il y a 12 min', read: false },
      { id: 3, type: 'Rapport', text: 'Rapport déposé par Miora Rakoto à vérifier', time: 'Il y a 45 min', read: false },
      { id: 4, type: 'Évaluation', text: 'Évaluation à réaliser pour Hery Rakotondrabe', time: 'Il y a 2 h', read: false },
      { id: 5, type: 'Info', text: '12 étudiants suivis ce semestre', time: 'Il y a 3 h', read: true }
    ],
    'ROLE_ENCADREUR': [
      { id: 2, type: 'Stage', text: 'Nouveau stage à suivre chez TechMada SARL', time: 'Il y a 12 min', read: false },
      { id: 3, type: 'Rapport', text: 'Rapport de Miora Rakoto à commenter', time: 'Il y a 45 min', read: false },
      { id: 4, type: 'Évaluation', text: 'Évaluation du stagiaire Hery Rakotondrabe', time: 'Il y a 2 h', read: false },
      { id: 5, type: 'Rappel', text: 'Rappel : Fin de stage de Tojo Ramanantsoa', time: 'Hier à 14:30', read: true }
    ]
  };

  return [...baseNotifications, ...(roleNotifications[role] || [])];
};

// ============================================================
// DELAY SIMULÉ
// ============================================================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================
// API MOCK
// ============================================================

export const mockApi = {
  // ===== AUTHENTIFICATION =====
  login: async (email, password) => {
    try {
      const res = await api.auth.login({ email, motDePasse: password });
      return {
        token: res.token || res.access_token,
        user: res.user || res
      };
    } catch {
      await delay(400);
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }
      const token = btoa(JSON.stringify({ 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      }));
      return {
        token,
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          telephone: user.telephone || '',
          role: user.role
        }
      };
    }
  },

  register: async (userData) => {
    try {
      const res = await api.auth.register(userData);
      return {
        message: 'Inscription réussie !',
        user: res.user || res
      };
    } catch {
      await delay(400);
      if (users.find(u => u.email === userData.email)) {
        throw new Error('Cet email est déjà utilisé');
      }
      const newUser = {
        id: users.length + 1,
        ...userData,
        telephone: userData.telephone || '',
        dateCreation: new Date().toISOString()
      };
      users.push(newUser);
      return {
        message: 'Inscription réussie !',
        user: {
          id: newUser.id,
          nom: newUser.nom,
          prenom: newUser.prenom,
          email: newUser.email,
          telephone: newUser.telephone,
          role: newUser.role
        }
      };
    }
  },

  getProfile: async (token) => {
    try {
      return await api.auth.getMe();
    } catch {
      await delay(300);
      try {
        const payload = JSON.parse(atob(token));
        const user = users.find(u => u.id === payload.userId);
        if (!user) {
          throw new Error('Utilisateur non trouvé');
        }
        return {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          telephone: user.telephone || '',
          role: user.role
        };
      } catch {
        throw new Error('Token invalide');
      }
    }
  },

  // ===== NOTIFICATIONS =====
  getNotifications: async (role) => {
    await delay(300);
    return getNotifications(role);
  },

  markAllNotificationsAsRead: async () => {
    await delay(200);
    return { success: true };
  },

  // ===== ENTREPRISES =====
  getEntreprises: async () => {
    try {
      const res = await api.companies.getAll();
      return Array.isArray(res) ? res : res.data || res.items || entreprises;
    } catch {
      await delay(200);
      return entreprises;
    }
  },

  getEntreprise: async (id) => {
    try {
      return await api.companies.getById(id);
    } catch {
      await delay(200);
      const entreprise = entreprises.find(e => e.id === parseInt(id));
      if (!entreprise) throw new Error('Entreprise non trouvée');
      return entreprise;
    }
  },

  createEntreprise: async (data) => {
    await delay(500);
    const newEntreprise = {
      id: entreprises.length + 1,
      ...data,
      lat: data.lat || -18.8792,
      lng: data.lng || 47.5079
    };
    entreprises.push(newEntreprise);
    return newEntreprise;
  },

  updateEntreprise: async (id, data) => {
    await delay(500);
    const index = entreprises.findIndex(e => e.id === parseInt(id));
    if (index === -1) throw new Error('Entreprise non trouvée');
    entreprises[index] = { ...entreprises[index], ...data };
    return entreprises[index];
  },

  deleteEntreprise: async (id) => {
    await delay(500);
    const index = entreprises.findIndex(e => e.id === parseInt(id));
    if (index === -1) throw new Error('Entreprise non trouvée');
    entreprises.splice(index, 1);
    return { success: true };
  },

  // ===== ENCADREURS =====
  getEncadreurs: async () => {
    try {
      const res = await api.supervisors.getAll();
      return Array.isArray(res) ? res : res.data || res.items || encadreurs;
    } catch {
      await delay(200);
      return encadreurs;
    }
  },

  getEncadreur: async (id) => {
    try {
      return await api.supervisors.getById(id);
    } catch {
      await delay(200);
      const encadreur = encadreurs.find(e => e.id === parseInt(id));
      if (!encadreur) throw new Error('Encadreur non trouvé');
      return encadreur;
    }
  },

  createEncadreur: async (data) => {
    await delay(500);
    const newEncadreur = {
      id: encadreurs.length + 1,
      ...data,
      etudiants: []
    };
    encadreurs.push(newEncadreur);
    return newEncadreur;
  },

  updateEncadreur: async (id, data) => {
    await delay(500);
    const index = encadreurs.findIndex(e => e.id === parseInt(id));
    if (index === -1) throw new Error('Encadreur non trouvé');
    encadreurs[index] = { ...encadreurs[index], ...data };
    return encadreurs[index];
  },

  deleteEncadreur: async (id) => {
    await delay(500);
    const index = encadreurs.findIndex(e => e.id === parseInt(id));
    if (index === -1) throw new Error('Encadreur non trouvé');
    encadreurs.splice(index, 1);
    return { success: true };
  },

  // ===== STAGES =====
  getStages: async () => {
    try {
      const res = await api.internships.getAll();
      return Array.isArray(res) ? res : res.data || res.items || stages;
    } catch {
      await delay(200);
      return stages;
    }
  },

  getStage: async (id) => {
    try {
      return await api.internships.getById(id);
    } catch {
      await delay(200);
      const stage = stages.find(s => s.id === parseInt(id));
      if (!stage) throw new Error('Stage non trouvé');
      return stage;
    }
  },

  getStagesByEtudiant: async (etudiantId) => {
    await delay(300);
    return stages.filter(s => s.etudiantId === parseInt(etudiantId));
  },

  getStagesByEncadreur: async (encadreurId) => {
    await delay(300);
    return stages.filter(s => s.encadreurId === parseInt(encadreurId));
  },

  createStage: async (data) => {
    await delay(500);
    const newStage = {
      id: stages.length + 1,
      ...data,
      progression: 0,
      statut: 'En attente',
      statutValidation: 'en_attente',
      commentaireValidation: null,
      dateValidation: null
    };
    stages.push(newStage);
    return newStage;
  },

  updateStage: async (id, data) => {
    await delay(500);
    const index = stages.findIndex(s => s.id === parseInt(id));
    if (index === -1) throw new Error('Stage non trouvé');
    stages[index] = { ...stages[index], ...data };
    return stages[index];
  },

  deleteStage: async (id) => {
    await delay(500);
    const index = stages.findIndex(s => s.id === parseInt(id));
    if (index === -1) throw new Error('Stage non trouvé');
    stages.splice(index, 1);
    return { success: true };
  },

  // ===== NOUVELLES FONCTIONS POUR LA VALIDATION DES STAGES =====

  /**
   * Récupère les stages d'un enseignant
   */
  getStagesByEnseignant: async (enseignantId) => {
    await delay(300);
    return stages.filter(s => s.enseignantId === parseInt(enseignantId));
  },

  /**
   * Récupère les stages par statut de validation
   * @param {string} status - 'en_attente' | 'valide' | 'refuse' | 'tous'
   */
  getStagesByValidationStatus: async (status) => {
    await delay(300);
    if (status === 'tous') return stages;
    return stages.filter(s => s.statutValidation === status);
  },

  /**
   * Récupère les stages en attente de validation pour un enseignant
   */
  getStagesEnAttente: async (enseignantId) => {
    await delay(300);
    return stages.filter(s => 
      s.enseignantId === parseInt(enseignantId) && 
      s.statutValidation === 'en_attente'
    );
  },

  /**
   * Valider un stage
   * @param {number} id - ID du stage
   * @param {string} commentaire - Commentaire optionnel
   */
  validateStage: async (id, commentaire = '') => {
    await delay(500);
    const index = stages.findIndex(s => s.id === parseInt(id));
    if (index === -1) throw new Error('Stage non trouvé');
    
    stages[index].statutValidation = 'valide';
    stages[index].commentaireValidation = commentaire || 'Stage validé';
    stages[index].dateValidation = new Date().toISOString().split('T')[0];
    
    return stages[index];
  },

  /**
   * Refuser un stage
   * @param {number} id - ID du stage
   * @param {string} commentaire - Commentaire obligatoire
   */
  rejectStage: async (id, commentaire) => {
    await delay(500);
    const index = stages.findIndex(s => s.id === parseInt(id));
    if (index === -1) throw new Error('Stage non trouvé');
    
    if (!commentaire || commentaire.trim() === '') {
      throw new Error('Un commentaire est obligatoire pour refuser un stage');
    }
    
    stages[index].statutValidation = 'refuse';
    stages[index].commentaireValidation = commentaire;
    stages[index].dateValidation = new Date().toISOString().split('T')[0];
    
    return stages[index];
  },

  /**
   * Récupère les statistiques de validation pour un enseignant
   */
  getValidationStats: async (enseignantId) => {
    await delay(300);
    const teacherStages = stages.filter(s => s.enseignantId === parseInt(enseignantId));
    return {
      total: teacherStages.length,
      enAttente: teacherStages.filter(s => s.statutValidation === 'en_attente').length,
      valides: teacherStages.filter(s => s.statutValidation === 'valide').length,
      refuses: teacherStages.filter(s => s.statutValidation === 'refuse').length
    };
  },

  // ===== RAPPORTS =====
  getRapports: async () => {
    await delay(300);
    return rapports;
  },

  getRapportsByStage: async (stageId) => {
    await delay(300);
    return rapports.filter(r => r.stageId === parseInt(stageId));
  },

  getRapportsByEtudiant: async (etudiant) => {
    await delay(300);
    return rapports.filter(r => r.etudiant === etudiant);
  },

  createRapport: async (data) => {
    await delay(500);
    const newRapport = {
      id: rapports.length + 1,
      ...data,
      status: 'En révision',
      date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    rapports.push(newRapport);
    return newRapport;
  },

  updateRapport: async (id, data) => {
    await delay(500);
    const index = rapports.findIndex(r => r.id === parseInt(id));
    if (index === -1) throw new Error('Rapport non trouvé');
    rapports[index] = { ...rapports[index], ...data };
    return rapports[index];
  },

  deleteRapport: async (id) => {
    await delay(500);
    const index = rapports.findIndex(r => r.id === parseInt(id));
    if (index === -1) throw new Error('Rapport non trouvé');
    rapports.splice(index, 1);
    return { success: true };
  },

  // ===== ÉVALUATIONS =====
  getEvaluations: async () => {
    await delay(300);
    return evaluations;
  },

  getEvaluationsByEtudiant: async (etudiant) => {
    await delay(300);
    return evaluations.filter(e => e.etudiant === etudiant);
  },

  getEvaluationsByStage: async (stageId) => {
    await delay(300);
    return evaluations.filter(e => e.stageId === parseInt(stageId));
  },

  createEvaluation: async (data) => {
    await delay(500);
    const newEvaluation = {
      id: evaluations.length + 1,
      ...data,
      status: 'En attente'
    };
    evaluations.push(newEvaluation);
    return newEvaluation;
  },

  updateEvaluation: async (id, data) => {
    await delay(500);
    const index = evaluations.findIndex(e => e.id === parseInt(id));
    if (index === -1) throw new Error('Évaluation non trouvée');
    evaluations[index] = { ...evaluations[index], ...data };
    return evaluations[index];
  },

  validateEvaluation: async (id) => {
    await delay(500);
    const index = evaluations.findIndex(e => e.id === parseInt(id));
    if (index === -1) throw new Error('Évaluation non trouvée');
    evaluations[index].status = 'Validé';
    return evaluations[index];
  },

  // ===== OBSERVATIONS (Encadreur) =====
  getObservations: async (etudiantId) => {
    await delay(300);
    // Simulation d'observations
    return [
      {
        id: 1,
        etudiantId: etudiantId || 2,
        auteur: 'M. Rakotomalala',
        role: 'Maître de stage',
        date: '15 Mar 2024',
        contenu: "Bon début de stage, Miora s'est bien intégré dans l'équipe."
      },
      {
        id: 2,
        etudiantId: etudiantId || 2,
        auteur: 'Prof. Andrianivo',
        role: 'Tuteur pédagogique',
        date: '20 Mar 2024',
        contenu: 'La première semaine s\'est bien passée. L\'étudiant a déjà commencé à travailler.'
      }
    ];
  },

  createObservation: async (data) => {
    await delay(500);
    return {
      id: Date.now(),
      ...data,
      date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    };
  },

  // ===== UTILISATEURS (Admin) =====
  getUsers: async () => {
    try {
      const res = await api.users.getAll();
      return Array.isArray(res) ? res : res.data || res.items || users;
    } catch {
      await delay(200);
      return users;
    }
  },

  getUser: async (id) => {
    try {
      return await api.users.getById(id);
    } catch {
      await delay(200);
      const user = users.find(u => u.id === parseInt(id));
      if (!user) throw new Error('Utilisateur non trouvé');
      return user;
    }
  },

  updateUser: async (id, data) => {
    await delay(500);
    const index = users.findIndex(u => u.id === parseInt(id));
    if (index === -1) throw new Error('Utilisateur non trouvé');
    users[index] = { ...users[index], ...data };
    return users[index];
  },

  deleteUser: async (id) => {
    await delay(500);
    const index = users.findIndex(u => u.id === parseInt(id));
    if (index === -1) throw new Error('Utilisateur non trouvé');
    users.splice(index, 1);
    return { success: true };
  }
};

export default mockApi;