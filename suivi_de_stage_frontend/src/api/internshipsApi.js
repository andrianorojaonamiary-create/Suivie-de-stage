import apiClient, { unwrap } from './apiClient';

export const internshipsApi = {
  /**
   * Récupérer la liste des stages selon le rôle et les filtres
   * @param {Object} [params] - { search, status, studentId, supervisorId, companyId, year, page, limit }
   */
  getAll: (params) => unwrap(apiClient.get('/internships', { params })),

  /**
   * Détail d'un stage par son ID
   * @param {string} id
   */
  getById: (id) => unwrap(apiClient.get(`/internships/${id}`)),

  /**
   * Créer un stage (Admin)
   * @param {Object} data
   */
  create: (data) => unwrap(apiClient.post('/internships', data)),

  /**
   * Mettre à jour un stage (Admin, ou observations par encadreur/entreprise)
   * @param {string} id
   * @param {Object} data
   */
  update: (id, data) => unwrap(apiClient.patch(`/internships/${id}`, data)),

  /**
   * Supprimer un stage (Admin)
   * @param {string} id
   */
  delete: (id) => unwrap(apiClient.delete(`/internships/${id}`))
};

export default internshipsApi;
