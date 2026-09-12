import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaStar, FaSearch, FaFilter, FaChevronLeft, FaChevronRight,
  FaCheckCircle, FaClock, FaEye, 
  FaTimes, FaArrowLeft, FaInfoCircle,
  FaUserTie, FaCalendarAlt, FaComment, FaSave,
  FaCode, FaClipboardCheck, FaRocket, FaUsers,
  FaChartLine, FaBuilding,FaUserGraduate
} from 'react-icons/fa';
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
    return statut === 'Validé' ? 'badge-valide' : 'badge-en-attente';
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
// FORMULAIRE D'ÉVALUATION AVEC CRITÈRES
// ============================================================
function EvaluationForm({ evaluation, onClose, onSave }) {
  const [formData, setFormData] = useState({
    competenceTech: 0,
    qualiteTravail: 0,
    autonomie: 0,
    respectDelais: 0,
    espritEquipe: 0,
    communication: 0,
    assiduite: 0,
    appreciation: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'appreciation') {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
      return;
    }

    const numValue = value === '' ? 0 : Number(value);
    
    if (numValue < 0 || numValue > 20) {
      setErrors(prev => ({ ...prev, [name]: 'Note entre 0 et 20' }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    setFormData(prev => ({ ...prev, [name]: numValue }));
  };

  const getStars = (note) => {
    if (!note && note !== 0) return '';
    const stars = Math.round(note / 4);
    return '★'.repeat(Math.min(stars, 5)) + '☆'.repeat(Math.max(0, 5 - Math.min(stars, 5)));
  };

  const calculateAverage = () => {
    const keys = ['competenceTech', 'qualiteTravail', 'autonomie', 'respectDelais', 'espritEquipe', 'communication', 'assiduite'];
    const total = keys.reduce((sum, key) => sum + (formData[key] || 0), 0);
    return (total / keys.length).toFixed(1);
  };

  const validate = () => {
    const newErrors = {};
    const keys = ['competenceTech', 'qualiteTravail', 'autonomie', 'respectDelais', 'espritEquipe', 'communication', 'assiduite'];
    
    keys.forEach(key => {
      if (formData[key] < 0 || formData[key] > 20) {
        newErrors[key] = 'Note entre 0 et 20';
      }
    });

    if (!formData.appreciation || formData.appreciation.trim() === '') {
      newErrors.appreciation = 'Appréciation obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const average = calculateAverage();
      onSave({ ...formData, moyenne: average, evaluationId: evaluation.id });
    }
  };

  const criteria = [
    { key: 'competenceTech', label: 'Compétences techniques', icon: <FaCode /> },
    { key: 'qualiteTravail', label: 'Qualité du travail', icon: <FaClipboardCheck /> },
    { key: 'autonomie', label: 'Autonomie', icon: <FaRocket /> },
    { key: 'respectDelais', label: 'Respect des délais', icon: <FaClock /> },
    { key: 'espritEquipe', label: "Esprit d'équipe", icon: <FaUsers /> },
    { key: 'communication', label: 'Communication', icon: <FaComment /> },
    { key: 'assiduite', label: 'Assiduité et ponctualité', icon: <FaCalendarAlt /> }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-evaluation" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FaStar className="modal-icon-validate" /> Évaluation du stage</h2>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="modal-body eval-form-body">
          {/* ===== INFOS ÉTUDIANT ===== */}
          <div className="eval-info-header">
            <div className="eval-info-row">
              <span className="eval-info-label"><FaUserGraduate /> Étudiant</span>
              <span className="eval-info-value"><strong>{evaluation.etudiant}</strong></span>
            </div>
            <div className="eval-info-row">
              <span className="eval-info-label"><FaBuilding /> Stage</span>
              <span className="eval-info-value">{evaluation.stage}</span>
            </div>
            <div className="eval-info-row">
              <span className="eval-info-label"><FaBuilding /> Entreprise</span>
              <span className="eval-info-value">{evaluation.entreprise}</span>
            </div>
            <div className="eval-info-row">
              <span className="eval-info-label"><FaUserTie /> Évaluateur</span>
              <span className="eval-info-value">{evaluation.type}</span>
            </div>
          </div>

          {/* ===== CRITÈRES ===== */}
          <div className="eval-criteres-container">
            <h3 className="eval-section-title"><FaChartLine /> Critères d'évaluation</h3>
            
            {criteria.map((critere) => (
              <div key={critere.key} className="eval-critere-row">
                <div className="eval-critere-label">
                  <span className="eval-critere-icon">{critere.icon}</span>
                  <span>{critere.label}</span>
                  <span className="eval-critere-stars">{getStars(formData[critere.key])}</span>
                </div>
                <div className="eval-critere-input">
                  <input
                    type="number"
                    name={critere.key}
                    value={formData[critere.key] || ''}
                    onChange={handleChange}
                    min="0"
                    max="20"
                    step="1"
                    className={`eval-input-number ${errors[critere.key] ? 'error' : ''}`}
                    placeholder="0"
                  />
                  <span className="eval-input-suffix">/ 20</span>
                </div>
                {errors[critere.key] && (
                  <span className="eval-error">{errors[critere.key]}</span>
                )}
              </div>
            ))}

            {/* ===== MOYENNE ===== */}
            <div className="eval-moyenne-row">
              <span className="eval-moyenne-label"><FaChartLine /> Moyenne</span>
              <span className="eval-moyenne-value">{calculateAverage()} / 20</span>
              <span className="eval-moyenne-stars">{getStars(calculateAverage())}</span>
            </div>
          </div>

          {/* ===== APPRÉCIATION ===== */}
          <div className="eval-appreciation-container">
            <h3 className="eval-section-title"><FaComment /> Appréciation générale</h3>
            <textarea
              name="appreciation"
              value={formData.appreciation}
              onChange={handleChange}
              className={`eval-textarea ${errors.appreciation ? 'error' : ''}`}
              placeholder="Rédigez votre appréciation générale sur l'étudiant..."
              rows="4"
              maxLength="500"
            />
            <div className="eval-textarea-footer">
              <span className="eval-char-count">
                {formData.appreciation.length} / 500 caractères
              </span>
              {errors.appreciation && (
                <span className="eval-error">{errors.appreciation}</span>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={onClose}>
            <FaArrowLeft /> Annuler
          </button>
          <button className="btn-modal-confirm btn-validate" onClick={handleSubmit}>
            <FaSave /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================
function EncadreurEvaluations() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEvalForm, setShowEvalForm] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  const allEvaluations = [
    { id: 1, etudiant: 'Rakoto Miora', etudiantId: 1, stage: 'Plateforme web RH', entreprise: 'TechMada SARL', type: 'Maître de stage', date: '15 Mai 2024', statut: 'Validé', note: '16.5', commentaire: 'Bon travail' },
    { id: 2, etudiant: 'Rakoto Miora', etudiantId: 1, stage: 'Plateforme web RH', entreprise: 'TechMada SARL', type: 'Entreprise', date: '20 Mai 2024', statut: 'À faire', note: null, commentaire: null },
    { id: 3, etudiant: 'Ramanantsoa Tojo', etudiantId: 2, stage: 'Migration système', entreprise: 'BNI Madagascar', type: 'Maître de stage', date: '10 Jun 2024', statut: 'À faire', note: null, commentaire: null },
    { id: 4, etudiant: 'Razafindramary Fy', etudiantId: 3, stage: 'Gestion rendez-vous', entreprise: 'Santé Plus', type: 'Maître de stage', date: '15 Aoû 2024', statut: 'À faire', note: null, commentaire: null }
  ];

  const evaluations = studentId 
    ? allEvaluations.filter(e => e.etudiantId === parseInt(studentId))
    : allEvaluations;

  const getStudentName = () => {
    if (studentId) {
      const student = allEvaluations.find(e => e.etudiantId === parseInt(studentId));
      return student ? student.etudiant : '';
    }
    return '';
  };

  const studentName = getStudentName();

  const stats = {
    total: evaluations.length,
    valides: evaluations.filter(e => e.statut === 'Validé').length,
    enAttente: evaluations.filter(e => e.statut === 'À faire' || e.statut === 'En attente').length
  };

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
    return statut === 'Validé' ? 'badge-valide' : 'badge-en-attente';
  };

  const getStars = (note) => {
    if (!note) return null;
    const stars = Math.round(note / 4);
    return '★'.repeat(Math.min(stars, 5)) + '☆'.repeat(Math.max(0, 5 - Math.min(stars, 5)));
  };

  const openDetailModal = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowDetailModal(true);
  };

  const openEvalForm = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowEvalForm(true);
  };

  const handleSaveEvaluation = (data) => {
    alert(`Évaluation enregistrée avec succès !\nNote moyenne : ${data.moyenne}/20`);
    setShowEvalForm(false);
    setSelectedEvaluation(null);
  };

  return (
    <div className="evaluations-page">
      <div className="page-header">
        <div>
          {studentId && (
            <button className="btn-back-header" onClick={() => navigate('/encadreur/etudiants')}>
              <FaArrowLeft /> Retour
            </button>
          )}
          <h1>Évaluations</h1>
          <p className="text-muted">
            {studentId ? `Évaluations de ${studentName}` : 'Gérer les évaluations des étudiants'}
          </p>
        </div>
      </div>

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

      <div className="table-container">
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

        {filteredEvals.length === 0 ? (
          <div className="empty-state">
            <FaStar className="empty-icon" />
            <h3>Aucune évaluation</h3>
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
                      <td><strong>{evalItem.etudiant}</strong></td>
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
                            onClick={() => openEvalForm(evalItem)}
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

      {showDetailModal && selectedEvaluation && (
        <EvalDetailModal
          evaluation={selectedEvaluation}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {showEvalForm && selectedEvaluation && (
        <EvaluationForm
          evaluation={selectedEvaluation}
          onClose={() => setShowEvalForm(false)}
          onSave={handleSaveEvaluation}
        />
      )}
    </div>
  );
}

export default EncadreurEvaluations;