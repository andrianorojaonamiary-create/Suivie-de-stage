// Simulation d'une base de données PostgreSQL
const users = [
  {
    id: 1,
    nom: 'Admin',
    prenom: 'Admin',
    email: 'admin@emit.mg',
    password: 'admin123',
    role: 'ROLE_ADMIN',
    dateCreation: new Date().toISOString()
  },
  {
    id: 2,
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'etudiant@test.mg',
    password: 'test123',
    role: 'ROLE_ETUDIANT',
    dateCreation: new Date().toISOString()
  }
];

// Simuler un délai réseau
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Connexion
  login: async (email, password) => {
    await delay(800);

    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Générer un faux token JWT
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
        role: user.role
      }
    };
  },

  // Inscription
  register: async (userData) => {
    await delay(800);

    // Vérifier si l'email existe déjà
    if (users.find(u => u.email === userData.email)) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Créer le nouvel utilisateur
    const newUser = {
      id: users.length + 1,
      ...userData,
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
        role: newUser.role
      }
    };
  },

  // Récupérer le profil
  getProfile: async (token) => {
    await delay(500);
    
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
        role: user.role
      };
    } catch {
      throw new Error('Token invalide');
    }
  }
};