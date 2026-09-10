import apiClient, { unwrap } from './apiClient';

export const mapApi = {
  /**
   * Points géographiques des stages pour la carte interactive
   * @param {Object} [params] - { ville, region, domaine, promotion, statut, limit }
   */
  getInternships: (params) => unwrap(apiClient.get('/map/internships', { params })),

  /**
   * Points géographiques des entreprises pour la carte interactive
   * @param {Object} [params] - { ville, region, domaine, promotion, statut, limit }
   */
  getCompanies: (params) => unwrap(apiClient.get('/map/companies', { params }))
};

export default mapApi;
