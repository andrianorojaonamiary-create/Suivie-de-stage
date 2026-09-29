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
   * Supprimer une notification
   * @param {string} id
   */
  delete: (id) => unwrap(apiClient.delete(`/notifications/${id}`))
};

export default notificationsApi;
