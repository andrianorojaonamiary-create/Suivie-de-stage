import apiClient, { unwrap } from './apiClient';

export const companiesApi = {
  /**
   * Lister les entreprises (Admin)
   * @param {Object} [params] - { search, secteurActivite, ville, region, statut, page, limit }
   */
  getAll: (params) => unwrap(apiClient.get('/companies', { params })),

  /**
   * Profil entreprise connectée
   */
  getMe: () => unwrap(apiClient.get('/companies/me')),

  /**
   * Sociétés des stages encadrés par l'encadreur connecté
   */
  getSupervised: () => unwrap(apiClient.get('/companies/encadreur')),

  /**
   * Détail d'une entreprise par son ID
   * @param {string} id
   */
  getById: (id) => unwrap(apiClient.get(`/companies/${id}`)),

  /**
   * Étudiants accueillis par une entreprise
   * @param {string} id
   */
  getHostedStudents: (id) => unwrap(apiClient.get(`/companies/${id}/students`)),

  /**
   * Créer une entreprise (Admin)
   * @param {Object} data
   */
  create: (data) => unwrap(apiClient.post('/companies', data)),

  /**
   * Mettre à jour une entreprise
   * @param {string} id
   * @param {Object} data
   */
  update: (id, data) => unwrap(apiClient.patch(`/companies/${id}`, data)),

  /**
   * Désactiver une entreprise (Admin)
   * @param {string} id
   */
  deactivate: (id) => unwrap(apiClient.patch(`/companies/${id}/deactivate`)),

  /**
   * Supprimer/Désactiver une entreprise (Admin)
   * @param {string} id
   */
  delete: (id) => unwrap(apiClient.delete(`/companies/${id}`))
};

export default companiesApi;
