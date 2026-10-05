import apiClient, { unwrap } from './apiClient';

// Affectations enseignant (tuteur pédagogique) <-> étudiant.
// Les affectations sont gérées par l'administration depuis
// /admin/affectations ; l'étudiant ne fait que lire les tuteurs qui lui
// sont affectés via getMyTeachers().

export const teacherAssignmentsApi = {
  /**
   * Tuteurs pédagogiques affectés à l'étudiant connecté.
   * C'est la source unique du sélecteur « Tuteur pédagogique » côté étudiant :
   * il ne voit QUE les enseignants que l'administration lui a affectés.
   * L'étudiant est déduit du JWT, aucun paramètre n'est exposé.
   */
  getMyTeachers: () =>
    unwrap(apiClient.get('/teacher-assignments/my-teachers')).then((res) => ({
      items: res?.data ?? [],
    })),

  /**
   * Listes de sélection de la page admin (tous étudiants, tous enseignants actifs)
   */
  getOptions: () => unwrap(apiClient.get('/teacher-assignments/options')),

  /**
   * Étudiants actifs sans aucun tuteur pédagogique affecté
   */
  getUnassigned: () =>
    unwrap(apiClient.get('/teacher-assignments/unassigned')).then((res) => ({
      items: res?.data ?? [],
      meta: res?.meta ?? { total: 0 },
    })),

  /**
   * Liste paginée des affectations (Admin)
   * @param {Object} [params] - { studentId, teacherId, formation, search, actifOnly, page, limit }
   */
  getAll: (params) =>
    unwrap(apiClient.get('/teacher-assignments', { params })).then((res) => ({
      items: res?.data ?? [],
      meta: res?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    })),

  /**
   * Affectations d'un étudiant donné
   * @param {string} studentId
   */
  getByStudent: (studentId) =>
    unwrap(apiClient.get(`/teacher-assignments/student/${studentId}`)).then(
      (res) => ({ items: res?.data ?? [] }),
    ),

  /**
   * Étudiants affectés à un enseignant donné
   * @param {string} teacherId
   */
  getByTeacher: (teacherId) =>
    unwrap(apiClient.get(`/teacher-assignments/teacher/${teacherId}`)).then(
      (res) => ({ items: res?.data ?? [] }),
    ),

  /**
   * Affecter un tuteur pédagogique à un étudiant (Admin).
   * Un étudiant ne peut avoir qu'un tuteur actif : le backend répond 409 s'il
   * en a déjà un, il faut clôturer l'affectation précédente d'abord.
   * @param {Object} data - { studentId, teacherId }
   */
  create: (data) => unwrap(apiClient.post('/teacher-assignments', data)),

  /**
   * Clôturer une affectation à une date donnée
   * @param {string} id
   * @param {Object} data - { dateFin }
   */
  update: (id, data) =>
    unwrap(apiClient.patch(`/teacher-assignments/${id}`, data)),

  /**
   * Clôturer une affectation (conservation de l'historique)
   * @param {string} id
   */
  remove: (id) => unwrap(apiClient.delete(`/teacher-assignments/${id}`))
};

export default teacherAssignmentsApi;