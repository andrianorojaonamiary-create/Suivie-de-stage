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
   *
   * `role` est transmis tel quel, avec le préfixe ROLE_ utilisé par les menus
   * de l'interface : le DTO backend le retire avant de le confronter à l'enum
   * Role, qui n'a pas de préfixe.
   *
   * promotion et specialite ne sont pas optionnels côté métier : sans eux la
   * ligne de profil (students ou supervisors) ne peut pas être créée.
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
      ...(userData.promotion && { promotion: userData.promotion }),
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
  },

  /**
   * Déconnexion côté serveur : invalide les JWT déjà émis pour ce compte.
   * À appeler avant de vider le localStorage, sinon la requête part sans token.
   * @param {boolean} [ignoreError] true pour une déconnexion locale (échec réseau)
   */
  logout: async (ignoreError = false) => {
    try {
      const { data } = await apiClient.post('/auth/logout');
      return data;
    } catch (error) {
      if (!ignoreError) throw error;
      return null;
    }
  }
};

export default authApi;
