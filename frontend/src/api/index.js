import apiClient, { getApiErrorMessage, normalizeUser, unwrap } from './apiClient';
import authApi from './authApi';
import usersApi from './usersApi';
import studentsApi from './studentsApi';
import supervisorsApi from './supervisorsApi';
import companiesApi from './companiesApi';
import internshipsApi from './internshipsApi';
import trackingApi from './trackingApi';
import evaluationsApi from './evaluationsApi';
import notificationsApi from './notificationsApi';
import mapApi from './mapApi';
import statisticsApi from './statisticsApi';
import professionalSituationsApi from './professionalSituationsApi';

export {
  apiClient,
  getApiErrorMessage,
  normalizeUser,
  unwrap,
  authApi,
  usersApi,
  studentsApi,
  supervisorsApi,
  companiesApi,
  internshipsApi,
  trackingApi,
  evaluationsApi,
  notificationsApi,
  mapApi,
  statisticsApi,
  professionalSituationsApi
};

export const api = {
  auth: authApi,
  users: usersApi,
  students: studentsApi,
  supervisors: supervisorsApi,
  companies: companiesApi,
  internships: internshipsApi,
  tracking: trackingApi,
  evaluations: evaluationsApi,
  notifications: notificationsApi,
  map: mapApi,
  statistics: statisticsApi,
  professionalSituations: professionalSituationsApi
};

export default api;
