import { useState, useEffect, useCallback } from 'react';
import {
  FaSearch,
  FaFilter,
  FaUserPlus,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserSlash,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaTrash,
  FaUserEdit,
} from 'react-icons/fa';
import { toast } from 'react-toastify';

import AffectationForm from './components/AffectationForm';
import TuteurEditModal from './components/TuteurEditModal';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';
import { getApiErrorMessage } from '../../api/apiClient';
import { teacherAssignmentsApi } from '../../api';

const TOUS = 'Tous';

function AdminAffectations() {
  const [assignments, setAssignments] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [options, setOptions] = useState({ students: [], teachers: [] });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterFormation, setFilterFormation] = useState(TOUS);
  const [filterTeacher, setFilterTeacher] = useState(TOUS);
  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [prefillStudentId, setPrefillStudentId] = useState('');
  const [editing, setEditing] = useState(null);
  const [showUnassigned, setShowUnassigned] = useState(false);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 5;

  const loadOptions = useCallback(async () => {
    try {
      const res = await teacherAssignmentsApi.getOptions();
      setOptions({
        students: res?.students ?? [],
        teachers: res?.teachers ?? [],
      });
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, 'Impossible de charger les listes de sélection.'),
      );
    }
  }, []);

  const loadAssignments = useCallback(async () => {
    try {
      const res = await teacherAssignmentsApi.getAll({ limit: 100 });
      setAssignments(res.items ?? []);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, 'Impossible de charger les affectations.'),
      );
    }
  }, []);

  const loadUnassigned = useCallback(async () => {
    try {
      const res = await teacherAssignmentsApi.getUnassigned();
      setUnassigned(res.items ?? []);
    } catch (err) {
      console.error('Erreur chargement étudiants sans tuteur:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadAssignments(), loadUnassigned(), loadOptions()]);
    setLoading(false);
  }, [loadAssignments, loadUnassigned, loadOptions]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await Promise.all([loadAssignments(), loadUnassigned(), loadOptions()]);
      if (!cancelled) setLoading(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [loadAssignments, loadUnassigned, loadOptions]);

  // --- Statistiques -------------------------------------------------------
  const activeAssignments = assignments.filter((a) => !a.dateFin);
  const stats = {
    etudiantsAffectes: new Set(activeAssignments.map((a) => a.studentId)).size,
    enseignants: new Set(activeAssignments.map((a) => a.teacherId)).size,
    sansTuteur: unassigned.length,
  };

  // --- Filtres ------------------------------------------------------------
  const formationOptions = [
    { value: TOUS, label: 'Toutes les formations' },
    ...[...new Set(options.students.map((s) => s.formation).filter(Boolean))].map(
      (v) => ({ value: v, label: v }),
    ),
  ];
  const teacherOptions = [
    { value: TOUS, label: 'Tous les enseignants' },
    ...options.teachers.map((t) => ({
      value: t.id,
      label: `${t.nom} ${t.prenom} — ${t.assignmentCount ?? 0} étudiant(s)`.trim(),
    })),
  ];

  const filteredAssignments = assignments.filter((a) => {
    const search = searchTerm.trim().toLowerCase();
    const haystack = [
      a.student?.nom,
      a.student?.prenom,
      a.student?.matricule,
      a.teacher?.nom,
      a.teacher?.prenom,
      a.teacher?.email,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchSearch = !search || haystack.includes(search);
    const matchFormation =
      filterFormation === TOUS || a.student?.formation === filterFormation;
    const matchTeacher =
      filterTeacher === TOUS || a.teacher?.id === filterTeacher;
    return matchSearch && matchFormation && matchTeacher;
  });

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage) || 1;
  const paginated = filteredAssignments.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage,
  );

  const goToPage = (page) =>
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  // --- Actions ------------------------------------------------------------
  const openForm = (studentId = '') => {
    setPrefillStudentId(studentId);
    setShowForm(true);
  };

  const handleClose = async (assignment) => {
    try {
      await teacherAssignmentsApi.remove(assignment.id);
      toast.success('Affectation clôturée.');
      await refreshAll();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Clôture impossible.'));
    }
  };

  const displayName = (person) =>
    [person?.prenom, person?.nom].filter(Boolean).join(' ').trim() || '—';

  const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('fr-FR');
  };

  return (
    <div className="admin-affectation-page">
      {/* ===== HEADER ===== */}
      <div className="admin-affectation-header">
        <div>
          <h1>Affectation des tuteurs pédagogiques</h1>
          <p className="admin-affectation-subtitle">
            Associez un enseignant tuteur à un étudiant. Un étudiant ne peut
            avoir qu&apos;un seul tuteur actif : clôturez l&apos;affectation
            précédente pour le remplacer.
          </p>
        </div>
        <button className="admin-affectation-btn-primary" onClick={() => openForm()}>
          <FaUserPlus /> Affecter un tuteur
        </button>
      </div>

      {/* ===== STATISTIQUES ===== */}
      <div className="admin-affectation-stats">
        <div className="admin-affectation-stat-card">
          <div
            className="admin-affectation-stat-icon-wrapper"
            style={{ background: '#E1ECFE', color: '#6BA9E6' }}
          >
            <FaUserGraduate />
          </div>
          <div className="admin-affectation-stat-content">
            <span className="admin-affectation-stat-value">
              {stats.etudiantsAffectes}
            </span>
            <span className="admin-affectation-stat-label">Étudiants affectés</span>
          </div>
        </div>
        <div className="admin-affectation-stat-card">
          <div
            className="admin-affectation-stat-icon-wrapper"
            style={{ background: '#D1FAE5', color: '#22C55E' }}
          >
            <FaChalkboardTeacher />
          </div>
          <div className="admin-affectation-stat-content">
            <span
              className="admin-affectation-stat-value"
              style={{ color: '#22C55E' }}
            >
              {stats.enseignants}
            </span>
            <span className="admin-affectation-stat-label">
              Enseignants tuteurs
            </span>
          </div>
        </div>
        <div className="admin-affectation-stat-card">
          <div
            className="admin-affectation-stat-icon-wrapper"
            style={{ background: '#FEE2E2', color: '#EF4444' }}
          >
            <FaUserSlash />
          </div>
          <div className="admin-affectation-stat-content">
            <span
              className="admin-affectation-stat-value"
              style={{ color: '#EF4444' }}
            >
              {stats.sansTuteur}
            </span>
            <span className="admin-affectation-stat-label">Sans tuteur</span>
          </div>
        </div>
      </div>

      {/* ===== ÉTUDIANTS SANS TUTEUR (liste déroulante) ===== */}
      {unassigned.length > 0 && (
        <div className="admin-affectation-unassigned-collapsible">
          <button
            type="button"
            className="admin-affectation-unassigned-toggle"
            onClick={() => setShowUnassigned((previous) => !previous)}
          >
            <FaFilter /> Étudiants sans tuteur pédagogique
            <span className="admin-affectation-unassigned-count">
              {unassigned.length}
            </span>
            <FaChevronDown
              className={`admin-affectation-chevron ${showUnassigned ? 'open' : ''}`}
            />
          </button>

          {showUnassigned && (
            <div className="admin-affectation-table-container">
              <table className="admin-affectation-table">
                <thead>
                  <tr>
                    <th>Étudiant</th>
                    <th>Matricule</th>
                    <th>Formation</th>
                    <th>Promotion</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {unassigned.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="admin-affectation-user">
                          <span className="admin-affectation-avatar">
                            {student.prenom?.[0] ?? ''}
                            {student.nom?.[0] ?? ''}
                          </span>
                          <div>
                            <div className="admin-affectation-name">
                              {displayName(student)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{student.matricule}</td>
                      <td>{student.formation || '—'}</td>
                      <td>{student.promotion || '—'}</td>
                      <td>
                        <button
                          className="admin-affectation-btn-primary"
                          onClick={() => openForm(student.id)}
                        >
                          Affecter
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== FILTRES ===== */}
      <div className="admin-affectation-filters">
        <div className="admin-affectation-filter-group">
          <label>
            <FaFilter /> Filtres
          </label>
          <SelectPersonnalise
            value={filterFormation}
            onChange={setFilterFormation}
            options={formationOptions}
            className="admin-affectation-filter-select"
          />
          <SelectPersonnalise
            value={filterTeacher}
            onChange={setFilterTeacher}
            options={teacherOptions}
            className="admin-affectation-filter-select"
          />
        </div>
        <div className="admin-affectation-filter-group admin-affectation-search-group">
          <FaSearch className="admin-affectation-search-icon" />
          <input
            type="text"
            placeholder="Rechercher un étudiant ou un enseignant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-affectation-search-input"
          />
        </div>
      </div>

      {/* ===== TABLEAU ===== */}
      <div className="admin-affectation-table-container">
        <table className="admin-affectation-table">
          <thead>
            <tr>
              <th>Étudiant</th>
              <th>Enseignant</th>
              <th>Date d&apos;affectation</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="admin-affectation-empty">
                  Chargement...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan="5" className="admin-affectation-empty">
                  Aucune affectation trouvée
                </td>
              </tr>
            ) : (
              paginated.map((assignment) => (
                <tr key={assignment.id}>
                  <td>
                    <div className="admin-affectation-user">
                      <span className="admin-affectation-avatar">
                        {assignment.student?.prenom?.[0] ?? ''}
                        {assignment.student?.nom?.[0] ?? ''}
                      </span>
                      <div>
                        <div className="admin-affectation-name">
                          {displayName(assignment.student)}
                        </div>
                        <div className="admin-affectation-email">
                          {assignment.student?.matricule ?? '—'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="admin-affectation-teacher">
                      <div className="admin-affectation-name">
                        {displayName(assignment.teacher)}
                      </div>
                      <div className="admin-affectation-email">
                        {assignment.teacher?.grade ||
                          assignment.teacher?.email ||
                          '—'}
                      </div>
                    </div>
                  </td>
                  <td>{formatDate(assignment.dateAffectation)}</td>
                  <td>
                    <span
                      className={
                        assignment.dateFin
                          ? 'admin-affectation-badge-closed'
                          : 'admin-affectation-badge-active'
                      }
                    >
                      {assignment.dateFin ? 'Clôturée' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-affectation-actions">
                      {!assignment.dateFin && (
                        <>
                          <button
                            className="btn-action-icon btn-edit"
                            onClick={() => setEditing(assignment)}
                            title="Modifier l'encadreur"
                          >
                            <FaUserEdit />
                          </button>
                          <button
                            className="btn-action-icon btn-danger"
                            onClick={() => handleClose(assignment)}
                            title="Clôturer l'affectation"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="admin-affectation-pagination">
            <button
              className="admin-affectation-pagination-btn"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </button>
            <span className="admin-affectation-pagination-info">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              className="admin-affectation-pagination-btn"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* ===== MODALE ===== */}
      {showForm && (
        <AffectationForm
          options={options}
          prefillStudentId={prefillStudentId}
          existingAssignments={assignments.filter((a) => !a.dateFin)}
          onClose={() => {
            setShowForm(false);
            setPrefillStudentId('');
          }}
          onSaved={async () => {
            setShowForm(false);
            setPrefillStudentId('');
            await refreshAll();
          }}
        />
      )}

      {editing && (
        <TuteurEditModal
          assignment={editing}
          options={options}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await refreshAll();
          }}
        />
      )}
    </div>
  );
}

export default AdminAffectations;