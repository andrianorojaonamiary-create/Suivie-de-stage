import apiClient, { unwrap } from './apiClient';

export const supervisorsApi = {
  /**
   * Lister les encadreurs (Admin)
   * @param {Object} [params] - { search, type, entrepriseId, page, limit }
   */
  getAll: (params) => unwrap(apiClient.get('/supervisors', { params })),

  /**
   * Récupérer le profil de l'encadreur connecté
   */
  getMe: () => unwrap(apiClient.get('/supervisors/me')),

  /**
   * Récupérer les détails d'un encadreur
   * @param {string} id
   */
  getById: (id) => unwrap(apiClient.get(`/supervisors/${id}`)),

  /**
   * Récupérer les étudiants affectés à un encadreur
   * @param {string} id
   */
  getAssignedStudents: (id) => unwrap(apiClient.get(`/supervisors/${id}/students`)),

  /**
   * Créer un encadreur (Admin)
   * @param {Object} data
   */
  create: (data) => unwrap(apiClient.post('/supervisors', data)),

  /**
   * Mettre à jour un encadreur
   * @param {string} id
   * @param {Object} data
   */
  update: (id, data) => unwrap(apiClient.patch(`/supervisors/${id}`, data)),

  /**
   * Supprimer un encadreur (Admin)
   * @param {string} id
   */
  delete: (id) => unwrap(apiClient.delete(`/supervisors/${id}`))
};

export default supervisorsApi;
