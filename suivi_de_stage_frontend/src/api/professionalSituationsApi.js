import apiClient, { unwrap } from './apiClient';

export const professionalSituationsApi = {
  /**
   * Déclarer une nouvelle situation professionnelle (Étudiant/Diplômé)
   * @param {Object} data - { type, entreprise, poste, domaine, ville, pays, dateDebut, dateFin, description }
   */
  create: (data) => unwrap(apiClient.post('/professional-situations', data)),

  /**
   * Consulter son propre historique de situations professionnelles
   */
  getMe: () => unwrap(apiClient.get('/professional-situations/me')),

  /**
   * Consulter l'historique d'un étudiant spécifique (Admin)
   * @param {string} studentId
   */
  getByStudentId: (studentId) =>
    unwrap(apiClient.get(`/professional-situations/student/${studentId}`)),

  /**
   * Consulter toutes les situations professionnelles (Admin)
   */
  getAll: () => unwrap(apiClient.get('/professional-situations')),

  /**
   * Mettre à jour une situation professionnelle (Étudiant propriétaire ou Admin)
   * @param {string} id
   * @param {Object} data
   */
  update: (id, data) => unwrap(apiClient.patch(`/professional-situations/${id}`, data)),

  /**
   * Supprimer une situation professionnelle (Étudiant propriétaire ou Admin)
   * @param {string} id
   */
  delete: (id) => unwrap(apiClient.delete(`/professional-situations/${id}`))
};

export default professionalSituationsApi;
