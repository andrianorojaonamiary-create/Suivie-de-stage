import apiClient, { unwrap, normalizeUser } from './apiClient';

export const authApi = {
  /**
   * Connexion utilisateur
   * @param {{ email: string, motDePasse?: string, password?: string }} credentials
   */
  login: async (credentials) => {
    const payload = {
      email: credentials.email,
      motDePasse: credentials.motDePasse || credentials.password
    };
    const { data } = await apiClient.post('/auth/login', payload);
    if (data?.user) {
      data.user = normalizeUser(data.user);
    }
    return data;
  },

  /**
   * Inscription d'un nouvel utilisateur
   * @param {Object} userData
   */
  register: async (userData) => {
    const payload = {
      nom: userData.nom,
      prenom: userData.prenom,
      email: userData.email,
      motDePasse: userData.motDePasse || userData.password,
      role: userData.role,
      ...(userData.matricule && { matricule: userData.matricule }),
      ...(userData.niveau && { niveau: userData.niveau }),
      ...(userData.filiere && { filiere: userData.filiere }),
      ...(userData.grade && { grade: userData.grade }),
      ...(userData.departement && { departement: userData.departement }),
      ...(userData.specialite && { specialite: userData.specialite }),
      ...(userData.entreprise && { entreprise: userData.entreprise }),
      ...(userData.poste && { poste: userData.poste }),
      ...(userData.telephone && { telephone: userData.telephone }),
      ...(userData.adresse && { adresse: userData.adresse })
    };
    const { data } = await apiClient.post('/auth/register', payload);
    if (data?.user) {
      data.user = normalizeUser(data.user);
    }
    return data;
  },

  /**
   * Profil de l'utilisateur connecté
   */
  getMe: async () => {
    const data = await unwrap(apiClient.get('/auth/me'));
    return normalizeUser(data);
  },

  /**
   * Mise à jour du profil personnel (nom, prénom, mot de passe)
   * @param {{ nom?: string, prenom?: string, motDePasse?: string }} data
   */
  updateMe: async (data) => {
    const res = await unwrap(apiClient.patch('/auth/me', data));
    return normalizeUser(res);
  }
};

export default authApi;
