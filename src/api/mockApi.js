const users = [
  {
    id: 1,
    nom: 'Admin',
    prenom: 'Admin',
    email: 'admin@emit.mg',
    password: 'admin123',
    telephone: '032 10 000 01',  // ← Ajout du téléphone
    role: 'ROLE_ADMIN',
    dateCreation: new Date().toISOString()
  },
  {
    id: 2,
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'etudiant@test.mg',
    password: 'test123',
    telephone: '032 10 000 02',  // ← Ajout du téléphone
    role: 'ROLE_ETUDIANT',
    dateCreation: new Date().toISOString()
  }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  login: async (email, password) => {
    await delay(800);
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
        telephone: user.telephone || '',  // ← Ajout du téléphone
        role: user.role
      }
    };
  },

  register: async (userData) => {
    await delay(800);
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
  },

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
        telephone: user.telephone || '',
        role: user.role
      };
    } catch {
      throw new Error('Token invalide');
    }
  }
};