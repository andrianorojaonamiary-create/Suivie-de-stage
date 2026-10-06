import apiClient, { unwrap } from './apiClient';

export const notificationsApi = {
  /**
   * Consulter ses notifications
   * @param {Object} [params] - { page, limit, unreadOnly }
   */
  getAll: (params) => unwrap(apiClient.get('/notifications', { params })),

  /**
   * Marquer une notification comme lue
   * @param {string} id
   */
  markAsRead: (id) => unwrap(apiClient.patch(`/notifications/${id}/read`)),

  /**
   * Envoyer un rappel à l'enseignant tuteur pour un stage en attente (admin)
   * @param {string} stageId
   */
  sendReminder: (stageId) =>
    unwrap(apiClient.post('/notifications/reminder', { stageId })),

  /**
   * Supprimer une notification
   * @param {string} id
   */
  delete: (id) => unwrap(apiClient.delete(`/notifications/${id}`))
};

export default notificationsApi;
