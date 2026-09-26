import apiClient, { unwrap } from './apiClient';

export const statisticsApi = {
  /**
   * Vue d'ensemble du tableau de bord statistique (Admin)
   * @param {Object} [params] - { debut, fin } (année scolaire, bornes inclusives sur date_debut)
   */
  getDashboard: (params) => unwrap(apiClient.get('/statistics/dashboard', { params })),

  /**
   * Statistiques détaillées des stages (par année, domaine, statut, etc.)
   */
  getInternships: (params) => unwrap(apiClient.get('/statistics/internships', { params })),

  /**
   * Statistiques d'insertion professionnelle et suivi des diplômés
   */
  getEmployment: () => unwrap(apiClient.get('/statistics/employment')),

  /**
   * Statistiques géographiques (par ville et coordonnées)
   */
  getGeography: () => unwrap(apiClient.get('/statistics/geography')),

  /**
   * Vue d'ensemble avancée : stages/mois, top entreprises, niveau, évaluations
   */
  getOverview: (params) => unwrap(apiClient.get('/statistics/overview', { params }))
};

export default statisticsApi;
