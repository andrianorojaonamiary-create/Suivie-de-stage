import apiClient, { unwrap } from './apiClient';

export const internshipsApi = {
  /**
   * Récupérer la liste des stages selon le rôle et les filtres
   * @param {Object} [params] - { search, statut, studentId, supervisorId, companyId, page, limit }
   */
  getAll: (params) => unwrap(apiClient.get('/internships', { params })),

  /**
   * Détail d'un stage par son ID
   * @param {string} id
   */
  getById: (id) => unwrap(apiClient.get(`/internships/${id}`)),

  /**
   * Créer un stage (Admin). supervisorId est obligatoire.
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
   * Changer l'encadreur d'un stage (Admin).
   * Renvoie 409 si l'encadreur atteint 10 stages actifs.
   * @param {string} id
   * @param {string} supervisorId
   */
  changeSupervisor: (id, supervisorId) =>
    unwrap(
      apiClient.patch(`/internships/${id}/supervisor`, { supervisorId })
    ),

  /**
   * Historique des affectations d'un stage, du plus récent au plus ancien
   * (Admin, Enseignant — lecture seule).
   * @param {string} id
   */
  getSupervisorHistory: (id) =>
    unwrap(apiClient.get(`/internships/${id}/historique-encadreurs`)),

  /**
   * Encadreurs avec leur charge active, pour le sélecteur d'affectation (Admin).
   * @param {Object} [params] - { excludeInternshipId }
   */
  getAvailableSupervisors: (params) =>
    unwrap(apiClient.get('/internships/encadreurs-disponibles', { params })),

  /**
   * Supprimer un stage (Admin)
   * @param {string} id
   */
  delete: (id) => unwrap(apiClient.delete(`/internships/${id}`))
};

export default internshipsApi;
