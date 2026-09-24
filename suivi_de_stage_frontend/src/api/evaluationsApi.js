import apiClient, { unwrap } from './apiClient';

export const evaluationsApi = {
  /**
   * Créer une évaluation pour un stage (Admin, Encadreur, Entreprise)
  * @param {Object} data - { stageId, evaluateurId, typeEvaluateur, note, appreciationGenerale }
   */
  create: (data) => unwrap(apiClient.post('/evaluations', data)),

  /**
   * Consulter les évaluations d'un stage
   * @param {string} stageId
   * @param {Object} [params] - { page, limit }
   */
  getByInternship: (stageId, params) =>
    unwrap(apiClient.get(`/evaluations/internships/${stageId}`, { params })),

  /**
   * Consulter une évaluation par son ID
   * @param {string} id
   */
  getById: (id) => unwrap(apiClient.get(`/evaluations/${id}`)),

  /**
   * Modifier sa propre évaluation
   * @param {string} id
   * @param {Object} data
   */
  update: (id, data) => unwrap(apiClient.patch(`/evaluations/${id}`, data)),

  /**
   * Valider une évaluation (Admin uniquement)
   * @param {string} id
   */
  validate: (id) => unwrap(apiClient.patch(`/evaluations/${id}/validate`))
};

export default evaluationsApi;
