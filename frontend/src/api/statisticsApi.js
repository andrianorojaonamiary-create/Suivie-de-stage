import apiClient, { unwrap } from './apiClient';

export const statisticsApi = {
  /**
   * Vue d'ensemble du tableau de bord statistique (Admin)
   */
  getDashboard: () => unwrap(apiClient.get('/statistics/dashboard')),

  /**
   * Statistiques détaillées des stages (par année, domaine, statut, etc.)
   */
  getInternships: () => unwrap(apiClient.get('/statistics/internships')),

  /**
   * Statistiques d'insertion professionnelle et suivi des diplômés
   */
  getEmployment: () => unwrap(apiClient.get('/statistics/employment')),

  /**
   * Statistiques géographiques (par ville et coordonnées)
   */
  getGeography: () => unwrap(apiClient.get('/statistics/geography'))
};

export default statisticsApi;
