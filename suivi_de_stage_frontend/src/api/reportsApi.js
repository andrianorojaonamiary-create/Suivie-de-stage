import apiClient, { unwrap } from './apiClient';

export const reportsApi = {
  /**
   * Déposer un rapport (etudiant propriétaire du stage)
   * @param {string} stageId
   * @param {File} fichier
   * @param {string} type - PRISE_EN_MAIN | INTERMEDIAIRE | FINAL
   */
  upload: (stageId, fichier, type) => {
    const formData = new FormData();
    formData.append('fichier', fichier);
    formData.append('type', type);
    return unwrap(
      apiClient.post(`/reports/stages/${stageId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  },

  /**
   * Liste des rapports d'un stage
   * @param {string} stageId
   */
  byStage: (stageId) =>
    unwrap(apiClient.get(`/reports/stages/${stageId}`)),

  /**
   * Liste globale des rapports (selon le rôle)
   * @param {Object} [params] - { statut, page, limit }
   */
  getAll: (params) =>
    unwrap(apiClient.get('/reports', { params })).then((res) => ({
      items: res?.data ?? [],
      meta: res?.meta ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
    })),

  /**
   * Détail d'un rapport
   * @param {string} id
   */
  getById: (id) => unwrap(apiClient.get(`/reports/${id}`)),

  /**
   * Valider / refuser un rapport (enseignant, encadreur, admin)
   * @param {string} id
   * @param {Object} data - { statut: APPROUVE | REJETE, commentaire }
   */
  updateStatus: (id, data) =>
    unwrap(apiClient.patch(`/reports/${id}`, data)),

  /**
   * Supprimer un rapport (étudiant propriétaire si en attente, ou admin)
   * @param {string} id
   */
  remove: (id) => unwrap(apiClient.delete(`/reports/${id}`)),

  /**
   * Télécharger le fichier d'un rapport (cez un Blob)
   * @param {string} id
   */
  download: (id) =>
    unwrap(
      apiClient.get(`/reports/${id}/download`, { responseType: 'blob' }),
    ),
};

export default reportsApi;