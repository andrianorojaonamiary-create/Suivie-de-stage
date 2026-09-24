import apiClient, { unwrap } from './apiClient';

export const studentsApi = {
  /**
   * Récupérer la liste des étudiants (Admin, Enseignant)
   * @param {Object} [params] - { search, formation, niveau, promotion, page, limit }
   */
  getAll: (params) =>
    unwrap(apiClient.get('/students', { params })).then((res) => ({
      items: res?.data ?? [],
      meta: res?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    })),

  /**
   * Récupérer la fiche d'un étudiant par son ID
   * @param {string} id
   */
  getById: (id) => unwrap(apiClient.get(`/students/${id}`)),

  /**
   * Créer un profil étudiant (Admin)
   * @param {Object} data
   */
  create: (data) => unwrap(apiClient.post('/students', data)),

  /**
   * Mettre à jour la fiche d'un étudiant
   * @param {string} id
   * @param {Object} data
   */
  update: (id, data) => unwrap(apiClient.patch(`/students/${id}`, data)),

  /**
   * Supprimer un étudiant (Admin)
   * @param {string} id
   */
  delete: (id) => unwrap(apiClient.delete(`/students/${id}`))
};

export default studentsApi;
