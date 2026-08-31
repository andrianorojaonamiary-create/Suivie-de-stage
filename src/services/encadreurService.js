import apiClient from '../api/apiClient';

const encadreurService = {
  getMe: () => apiClient.get('/supervisors/me'),
  getStudents: (supervisorId) => apiClient.get(`/supervisors/${supervisorId}/students`),
  getInternships: (supervisorId) => apiClient.get('/internships', { params: { supervisorId, limit: 100 } }),
  getFollowUps: (stageId) => apiClient.get(`/internship-tracking/internships/${stageId}`, { params: { type: 'OBSERVATION', limit: 100 } }),
  getCompany: (companyId) => apiClient.get(`/companies/${companyId}`),
  addFollowUp: (stageId, payload) => apiClient.post(`/internship-tracking/internships/${stageId}`, { ...payload, type: 'OBSERVATION' }),
  updateFollowUp: (followUpId, payload) => apiClient.patch(`/internship-tracking/${followUpId}`, payload),
  deleteFollowUp: (followUpId) => apiClient.delete(`/internship-tracking/${followUpId}`),
  getEvaluationsForInternship: (stageId) => apiClient.get(`/evaluations/internships/${stageId}`, { params: { typeEvaluateur: 'ENCADREUR', limit: 1 } }),
  createEvaluation: (payload) => apiClient.post('/evaluations', payload)
};

export default encadreurService;
