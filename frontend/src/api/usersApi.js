import apiClient, { unwrap } from './apiClient';

export const usersApi = {
  /**
   * Lister les utilisateurs avec pagination et filtres
   *
   * FindUsersDto n'accepte que search, role, status, page et limit. Les
   * `sort` et `order` annoncés ici n'existent pas côté serveur : les envoyer
   * provoquait un 400 « property sort should not exist », la ValidationPipe
   * globale rejettant toute propriété non déclarée.
   *
   * limit vaut 10 par défaut : suffisant pour un tableau, trop court pour un
   * sélecteur (passer 200).
   *
   * @param {Object} [params] - { search, role, status, page, limit }
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
