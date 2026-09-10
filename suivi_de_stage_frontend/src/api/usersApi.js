import apiClient, { unwrap } from './apiClient';

export const usersApi = {
  /**
   * Lister les utilisateurs avec pagination et filtres
   * @param {Object} [params] - { search, role, status, page, limit, sort, order }
   */
  getAll: (params) => unwrap(apiClient.get('/users', { params })),

  /**
   * Récupérer un utilisateur par son ID
   * @param {string} id
   */
  getById: (id) => unwrap(apiClient.get(`/users/${id}`)),

  /**
   * Créer un utilisateur (réservé à l'administrateur)
   * @param {Object} data
   */
  create: (data) => unwrap(apiClient.post('/users', data)),

  /**
   * Mettre à jour le statut d'un utilisateur (actif/inactif)
   * @param {string} id
   * @param {{ statut: string }} data
   */
  updateStatus: (id, data) => unwrap(apiClient.patch(`/users/${id}/status`, data)),

  /**
   * Mettre à jour un utilisateur
   * @param {string} id
   * @param {Object} data
   */
  update: (id, data) => unwrap(apiClient.patch(`/users/${id}`, data)),

  /**
   * Supprimer un utilisateur
   * @param {string} id
   */
  delete: (id) => unwrap(apiClient.delete(`/users/${id}`))
};

export default usersApi;
