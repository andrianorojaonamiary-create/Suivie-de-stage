import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaStar, FaSearch, FaFilter, FaChevronLeft, FaChevronRight,
  FaCheckCircle, FaClock, FaEye, FaUserGraduate,
  FaBuilding, FaTimes, FaArrowLeft, FaInfoCircle,
  FaUserTie, FaCalendarAlt, FaComment
} from 'react-icons/fa';

import EvaluationForm from './components/EvaluationForm';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';

// ============================================================
// MODAL DÉTAILS ÉVALUATION
// ============================================================
function EvalDetailModal({ evaluation, onClose }) {
  if (!evaluation) return null;

  const getStars = (note) => {
    if (!note) return null;
    const stars = Math.round(note / 4);
    return '★'.repeat(Math.min(stars, 5)) + '☆'.repeat(Math.max(0, 5 - Math.min(stars, 5)));
  };

  const getStatusClass = (statut) => {
    return statut === 'Validé' ? 'eval-badge-valide' : 'eval-badge-en-attente';
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
                <>
                  <span className="eval-detail-note">{evaluation.note} / 20</span>
                  <span className="eval-detail-stars">{getStars(evaluation.note)}</span>
                </>
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
  
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  // ===== DONNÉES SIMULÉES =====
  const allEvaluations = [
    { id: 1, etudiant: 'Rakoto Miora', etudiantId: 1, filiere: 'Génie Logiciel', stage: 'Plateforme web RH', entreprise: 'TechMada SARL', type: 'Tuteur pédagogique', date: '15 Mai 2024', statut: 'Validé', note: '16.5', commentaire: 'Bon travail' },
    { id: 2, etudiant: 'Rakoto Miora', etudiantId: 1, filiere: 'Génie Logiciel', stage: 'Plateforme web RH', entreprise: 'TechMada SARL', type: 'Maître de stage', date: '20 Mai 2024', statut: 'Validé', note: '17.0', commentaire: 'Très impliqué' },
    { id: 3, etudiant: 'Rakoto Miora', etudiantId: 1, filiere: 'Génie Logiciel', stage: 'Plateforme web RH', entreprise: 'TechMada SARL', type: 'Entreprise', date: '25 Mai 2024', statut: 'À faire', note: null, commentaire: null },
    { id: 4, etudiant: 'Rakotondrabe Hery', etudiantId: 2, filiere: 'Réseaux', stage: 'App mobile comptes', entreprise: 'Airtel Madagascar', type: 'Tuteur pédagogique', date: '01 Mai 2024', statut: 'À faire', note: null, commentaire: null },
    { id: 5, etudiant: 'Rakotondrabe Hery', etudiantId: 2, filiere: 'Réseaux', stage: 'App mobile comptes', entreprise: 'Airtel Madagascar', type: 'Maître de stage', date: '05 Mai 2024', statut: 'À faire', note: null, commentaire: null },
    { id: 6, etudiant: 'Ramanantsoa Tojo', etudiantId: 3, filiere: 'Sécurité Info.', stage: 'Migration système', entreprise: 'BNI Madagascar', type: 'Tuteur pédagogique', date: '10 Jun 2024', statut: 'À faire', note: null, commentaire: null }
  ];

  // ===== FILTRER PAR ÉTUDIANT =====
  const evaluations = studentId 
    ? allEvaluations.filter(e => e.etudiantId === parseInt(studentId))
    : allEvaluations;

  // ===== RÉCUPÉRER LE NOM DE L'ÉTUDIANT =====
  const getStudentName = () => {
    if (studentId) {
      const student = allEvaluations.find(e => e.etudiantId === parseInt(studentId));
      return student ? student.etudiant : '';
    }
    return '';
  };

  const studentName = getStudentName();

  // ===== STATISTIQUES =====
  const stats = {
    total: evaluations.length,
    valides: evaluations.filter(e => e.statut === 'Validé').length,
    enAttente: evaluations.filter(e => e.statut === 'À faire' || e.statut === 'En attente').length
  };

  // ===== FILTRAGE =====
  const filteredEvals = evaluations.filter(e => {
    if (selectedStatus !== 'tous' && e.statut !== selectedStatus) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      return e.etudiant.toLowerCase().includes(term) ||
             e.stage.toLowerCase().includes(term) ||
             e.entreprise.toLowerCase().includes(term) ||
             e.type.toLowerCase().includes(term);
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
    return statut === 'Validé' ? 'eval-badge-valide' : 'eval-badge-en-attente';
  };

  const openEvaluationForm = (evaluation) => {
    const student = {
      nom: evaluation.etudiant,
      filiere: evaluation.filiere,
      stage: {
        titre: evaluation.stage,
        entreprise: evaluation.entreprise
      },
      evaluateur: evaluation.type,
      evaluationId: evaluation.id
    };
    setSelectedStudent(student);
    setShowEvaluationForm(true);
  };

  const openDetailModal = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowDetailModal(true);
  };

  const handleSaveEvaluation = (data) => {
    alert(`Évaluation enregistrée avec succès !\nNote moyenne : ${data.moyenne}/20`);
    setShowEvaluationForm(false);
  };

  const getStars = (note) => {
    if (!note) return null;
    const stars = Math.round(note / 4);
    return '★'.repeat(Math.min(stars, 5)) + '☆'.repeat(Math.max(0, 5 - Math.min(stars, 5)));
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
            {studentId ? `Évaluations de ${studentName}` : 'Gérer les évaluations des étudiants'}
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
            <span className="stat-label">Validées</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending"><FaClock /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.enAttente}</span>
            <span className="stat-label">En attente</span>
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
                    { value: 'Validé', label: 'Validé' },
                    { value: 'À faire', label: 'À faire' },
                    { value: 'En attente', label: 'En attente' }
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
        {filteredEvals.length === 0 ? (
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
                        {evalItem.statut === 'À faire' && (
                          <button 
                            className="action-btn eval" 
                            onClick={() => openEvaluationForm(evalItem)}
                            title="Commencer l'évaluation"
                          >
                            <FaStar />
                          </button>
                        )}
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
      {showEvaluationForm && selectedStudent && (
        <EvaluationForm
          student={selectedStudent}
          onClose={() => setShowEvaluationForm(false)}
          onSave={handleSaveEvaluation}
        />
      )}

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