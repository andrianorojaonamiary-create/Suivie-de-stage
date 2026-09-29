import apiClient, { unwrap } from './apiClient';

export const trackingApi = {
  /**
   * Consulter l'historique de suivi d'un stage
   * @param {string} internshipId
   * @param {Object} [params] - { page, limit }
   */
  getByInternship: (internshipId, params) =>
    unwrap(apiClient.get(`/internship-tracking/internships/${internshipId}`, { params })),

  /**
   * Ajouter une observation / suivi pour un stage (Admin, Encadreur)
   * @param {string} internshipId
   * @param {Object} data - { commentaire, typeObservation, dateObservation }
   */
  create: (internshipId, data) =>
    unwrap(apiClient.post(`/internship-tracking/internships/${internshipId}`, data)),

  /**
   * Modifier une observation (Auteur ou Admin)
   * @param {string} id
   * @param {Object} data
   */
  update: (id, data) => unwrap(apiClient.patch(`/internship-tracking/${id}`, data)),

  /**
   * Supprimer une observation (Auteur ou Admin)
   * @param {string} id
   */
  delete: (id) => unwrap(apiClient.delete(`/internship-tracking/${id}`))
};

export default trackingApi;
