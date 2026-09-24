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
      ...(userData.formation && { formation: userData.formation }),
      ...(userData.promotion && { promotion: userData.promotion }),
      ...(userData.grade && { grade: userData.grade }),
      ...(userData.departement && { departement: userData.departement }),
      ...(userData.specialite && { specialite: userData.specialite }),
      ...(userData.entreprise && { entreprise: userData.entreprise }),
      ...(userData.fonction && { fonction: userData.fonction }),
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
  },

  /**
   * Changement du mot de passe d'un utilisateur authentifié
   * @param {{ ancienMotDePasse: string, nouveauMotDePasse: string }} data
   */
  changePassword: async ({ ancienMotDePasse, nouveauMotDePasse }) => {
    return unwrap(
      apiClient.patch('/auth/change-password', { ancienMotDePasse, nouveauMotDePasse }),
    );
  },

  /**
   * Demande d'envoi d'un email de réinitialisation de mot de passe
   * @param {string} email
   */
  forgotPassword: async (email) => {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
  },

  /**
   * Vérifie le code de réinitialisation reçu par email
   * @param {string} email
   * @param {string} code
   */
  verifyResetCode: async (email, code) => {
    const { data } = await apiClient.post('/auth/verify-reset-code', { email, code });
    return data;
  },

  /**
   * Réinitialisation du mot de passe avec le code reçu par email
   * @param {string} email
   * @param {string} code
   * @param {string} motDePasse
   */
  resetPassword: async (email, code, motDePasse) => {
    const { data } = await apiClient.post('/auth/reset-password', {
      email,
      code,
      motDePasse
    });
    return data;
  }
};

export default authApi;
