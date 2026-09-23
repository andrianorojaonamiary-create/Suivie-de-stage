import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaStar, FaSearch, FaFilter, FaChevronLeft, FaChevronRight,
  FaCheckCircle, FaEye, FaUserGraduate,
  FaBuilding, FaTimes, FaArrowLeft, FaInfoCircle,
  FaUserTie, FaCalendarAlt, FaComment
} from 'react-icons/fa';

import SelectPersonnalise from '../../components/Common/SelectPersonnalise';
import { internshipsApi, evaluationsApi } from '../../api';

// ============================================================
// MODAL DÉTAILS ÉVALUATION
// ============================================================
function EvalDetailModal({ evaluation, onClose }) {
  if (!evaluation) return null;

  

  const getStatusClass = (statut) => {
    return statut === 'Évalué' ? 'eval-badge-valide' : 'eval-badge-en-attente';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-eval-detail" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FaInfoCircle className="modal-icon-view" /> Détails de l'évaluation</h2>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="modal-body">
          <div className="eval-detail-row">
            <span className="eval-detail-label"><FaUserGraduate /> Étudiant</span>
            <span className="eval-detail-value"><strong>{evaluation.etudiant}</strong></span>
          </div>
          <div className="eval-detail-row">
            <span className="eval-detail-label"><FaBuilding /> Stage</span>
            <span className="eval-detail-value">{evaluation.stage}</span>
          </div>
          <div className="eval-detail-row">
            <span className="eval-detail-label"><FaBuilding /> Entreprise</span>
            <span className="eval-detail-value">{evaluation.entreprise}</span>
          </div>
          <div className="eval-detail-row">
            <span className="eval-detail-label"><FaUserTie /> Évaluateur</span>
            <span className="eval-detail-value">{evaluation.type}</span>
          </div>
          <div className="eval-detail-row">
            <span className="eval-detail-label"><FaCalendarAlt /> Date</span>
            <span className="eval-detail-value">{evaluation.date}</span>
          </div>
          <div className="eval-detail-row">
            <span className="eval-detail-label"><FaStar /> Note</span>
            <span className="eval-detail-value">
              {evaluation.note ? (
                <span className="eval-detail-note">{evaluation.note} / 20</span>
              ) : (
                <span className="eval-detail-empty">Non évalué</span>
              )}
            </span>
          </div>
          {evaluation.commentaire && (
            <div className="eval-detail-row eval-detail-comment">
              <span className="eval-detail-label"><FaComment /> Commentaire</span>
              <span className="eval-detail-value">{evaluation.commentaire}</span>
            </div>
          )}
          <div className="eval-detail-row">
            <span className="eval-detail-label">Statut</span>
            <span className="eval-detail-value">
              <span className={`badge ${getStatusClass(evaluation.statut)}`}>
                {evaluation.statut}
              </span>
            </span>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================
function EnseignantEvaluations() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [loading, setLoading] = useState(true);
  const [allEvaluations, setAllEvaluations] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true);
        const res = await internshipsApi.getAll({ limit: 100 });
        const internships = res?.data || (Array.isArray(res) ? res : []);

        const promises = internships.map(async (s) => {
          const evalRes = await evaluationsApi.getByInternship(s.id).catch(() => ({ data: [] }));
          const list = evalRes?.data || (Array.isArray(evalRes) ? evalRes : []);
          return list.map((e) => ({
            id: e.id,
            etudiantId: s.student?.id,
            etudiant: s.student?.user
              ? `${s.student.user.prenom ?? ''} ${s.student.user.nom ?? ''}`.trim()
              : 'Étudiant',
            filiere: s.student?.formation || 'Non renseigné',
            stage: s.intitule,
            entreprise: s.company?.nom || '',
            type: 'Encadreur',
            date: e.dateEvaluation
              ? new Date(e.dateEvaluation).toLocaleDateString('fr-FR')
              : '—',
            note: e.note,
            commentaire: e.commentaire || '',
            statut: 'Évalué',
          }));
        });

        const results = await Promise.all(promises);
        setAllEvaluations(results.flat());
      } catch (err) {
        console.error('Erreur chargement évaluations enseignant:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
  }, []);

  // ===== FILTRER PAR ÉTUDIANT =====
  const evaluations = studentId
    ? allEvaluations.filter(e => String(e.etudiantId) === String(studentId))
    : allEvaluations;

  // ===== RÉCUPÉRER LE NOM DE L'ÉTUDIANT =====
  const getStudentName = () => {
    if (studentId) {
      const student = allEvaluations.find(e => String(e.etudiantId) === String(studentId));
      return student ? student.etudiant : '';
    }
    return '';
  };

  const studentName = getStudentName();

  // ===== STATISTIQUES =====
  const stats = {
    total: evaluations.length,
    valides: evaluations.filter(e => e.statut === 'Évalué').length
  };

  // ===== FILTRAGE =====
  const filteredEvals = evaluations.filter(e => {
    if (selectedStatus !== 'tous' && e.statut !== selectedStatus) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      return e.etudiant.toLowerCase().includes(term) ||
             e.stage.toLowerCase().includes(term) ||
             e.entreprise.toLowerCase().includes(term);
    }
    return true;
  });

  // ===== PAGINATION =====
  const totalPages = Math.ceil(filteredEvals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvals = filteredEvals.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusClass = (statut) => {
    return statut === 'Évalué' ? 'eval-badge-valide' : 'eval-badge-en-attente';
  };

  const openDetailModal = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowDetailModal(true);
  };

  return (
    <div className="evaluations-page">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div>
          {studentId && (
            <button className="btn-back-header" onClick={() => navigate('/enseignant/etudiants')}>
              <FaArrowLeft /> Retour
            </button>
          )}
          <h1>Évaluations</h1>
          <p className="text-muted">
            {studentId ? `Évaluations de ${studentName}` : 'Consulter les évaluations des étudiants'}
          </p>
        </div>
      </div>

      {/* ===== STATISTIQUES ===== */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon total"><FaStar /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon done"><FaCheckCircle /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.valides}</span>
            <span className="stat-label">Évaluées</span>
          </div>
        </div>
      </div>

      {/* ===== TABLEAU ===== */}
      <div className="table-container">
        {/* ===== TOOLBAR ===== */}
        <div className="table-toolbar">
          <div className="toolbar-filters">
            <div className="filter-wrapper">
              <div className="filter-group">
                <FaFilter className="filter-icon" />
                <SelectPersonnalise
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={[
                    { value: 'tous', label: 'Tous les statuts' },
                    { value: 'Évalué', label: 'Évalué' }
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="search-wrapper">
            <div className="search-group">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm('')}>
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ===== TABLEAU ===== */}
        {loading ? (
          <div className="empty-state">
            <FaStar className="empty-icon" />
            <h3>Chargement...</h3>
          </div>
        ) : filteredEvals.length === 0 ? (
          <div className="empty-state">
            <FaStar className="empty-icon" />
            <h3>Aucune évaluation</h3>
            <p>Aucune évaluation ne correspond à vos critères</p>
          </div>
        ) : (
          <>
            <table className="evaluations-table">
              <thead>
                <tr>
                  {!studentId && <th>Étudiant</th>}
                  <th>Stage</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Note</th>
                  <th>Statut</th>
                  <th className="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEvals.map((evalItem) => (
                  <tr key={evalItem.id}>
                    {!studentId && (
                      <td>
                        <div className="student-cell">
                          <span className="student-name">{evalItem.etudiant}</span>
                          <span className="student-sub">{evalItem.filiere}</span>
                        </div>
                      </td>
                    )}
                    <td>
                      <div className="stage-cell">
                        <span className="stage-title">{evalItem.stage}</span>
                        <span className="stage-company">{evalItem.entreprise}</span>
                      </div>
                    </td>
                    <td>{evalItem.type}</td>
                    <td>{evalItem.date}</td>
                    <td>
                      {evalItem.note ? (
                        <div className="note-cell">
                          <span className="note-value">{evalItem.note}/20</span>
                        </div>
                      ) : (
                        <span className="note-empty">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${getStatusClass(evalItem.statut)}`}>
                        {evalItem.statut}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view"
                          onClick={() => openDetailModal(evalItem)}
                          title="Voir les détails"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ===== PAGINATION ===== */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft />
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                    onClick={() => goToPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  className="page-btn"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <FaChevronRight />
                </button>

                <span className="page-info">
                  {filteredEvals.length} évaluation{filteredEvals.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== MODALS ===== */}
      {showDetailModal && selectedEvaluation && (
        <EvalDetailModal
          evaluation={selectedEvaluation}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
}

export default EnseignantEvaluations;