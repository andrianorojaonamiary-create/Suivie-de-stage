import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaStar, FaSearch, FaFilter, FaChevronLeft, FaChevronRight,
  FaCheckCircle, FaClock, FaEye,
  FaTimes, FaArrowLeft, FaInfoCircle,
  FaUserTie, FaCalendarAlt, FaComment, FaSave,
  FaCode, FaClipboardCheck, FaRocket, FaUsers,
  FaChartLine, FaBuilding, FaUserGraduate
} from 'react-icons/fa';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';
import { toast } from 'react-toastify';
import { internshipsApi, evaluationsApi } from '../../api';
import { useAuth } from '../../hooks/useAuth';

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
    return statut === 'Évalué' ? 'badge-valide' : 'badge-en-attente';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-eval-detail modal-detail-role" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FaInfoCircle className="modal-icon-view" /> Détails de l'évaluation</h2>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="modal-body">
          <div className="eval-detail-row eval-detail-status">
            <span className="eval-detail-label">Statut</span>
            <span className="eval-detail-value">
              <span className={`badge ${getStatusClass(evaluation.statut)}`}>
                {evaluation.statut}
              </span>
            </span>
          </div>
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
        </div>
        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FORMULAIRE D'ÉVALUATION AVEC CRITÈRES DYNAMIQUES
// ============================================================
function EvaluationForm({ evaluation, onClose, onSave }) {
  // Liste de tous les critères (modifiables et supprimables)
  const [criteriaList, setCriteriaList] = useState([
    { id: 'competenceTech', label: 'Compétences techniques', note: 0, icon: <FaCode /> },
    { id: 'qualiteTravail', label: 'Qualité du travail', note: 0, icon: <FaClipboardCheck /> },
    { id: 'autonomie', label: 'Autonomie', note: 0, icon: <FaRocket /> },
    { id: 'respectDelais', label: 'Respect des délais', note: 0, icon: <FaClock /> },
    { id: 'espritEquipe', label: "Esprit d'équipe", note: 0, icon: <FaUsers /> },
    { id: 'communication', label: 'Communication', note: 0, icon: <FaComment /> },
    { id: 'assiduite', label: 'Assiduité et ponctualité', note: 0, icon: <FaCalendarAlt /> }
  ]);

  const [appreciation, setAppreciation] = useState('');
  const [errors, setErrors] = useState({});

  // État pour l'ajout d'un nouveau critère
  const [showAddCriteria, setShowAddCriteria] = useState(false);
  const [newCriteriaLabel, setNewCriteriaLabel] = useState('');
  const [newCriteriaError, setNewCriteriaError] = useState('');

  // État pour l'édition inline d'un critère existant
  const [editingId, setEditingId] = useState(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [editingError, setEditingError] = useState('');

  // Gestion du changement de note
  const handleNoteChange = (id, value) => {
    const numValue = value === '' ? 0 : Number(value);
    const clamped = Math.min(20, Math.max(0, numValue));
    setCriteriaList(prev =>
      prev.map(c => c.id === id ? { ...c, note: clamped } : c)
    );
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  // Ajout d'un critère avec l'ICÔNE PAR DÉFAUT (<FaStar />)
  const addCriteria = () => {
    const label = newCriteriaLabel.trim();
    if (!label) {
      setNewCriteriaError('Le nom du critère est obligatoire');
      return;
    }
    const alreadyExists = criteriaList.some(
      c => c.label.toLowerCase() === label.toLowerCase()
    );
    if (alreadyExists) {
      setNewCriteriaError('Ce critère existe déjà');
      return;
    }
    setCriteriaList(prev => [
      ...prev,
      { id: Date.now().toString(), label, note: 0, icon: <FaStar /> }
    ]);
    setNewCriteriaLabel('');
    setNewCriteriaError('');
    setShowAddCriteria(false);
  };

  // Lancer l'édition d'un critère
  const startEditCriteria = (critere) => {
    setEditingId(critere.id);
    setEditingLabel(critere.label);
    setEditingError('');
  };

  // Sauvegarder l'édition d'un critère
  const saveEditCriteria = (id) => {
    const label = editingLabel.trim();
    if (!label) {
      setEditingError('Le nom ne peut pas être vide');
      return;
    }
    const alreadyExists = criteriaList.some(
      c => c.id !== id && c.label.toLowerCase() === label.toLowerCase()
    );
    if (alreadyExists) {
      setEditingError('Ce nom de critère existe déjà');
      return;
    }
    setCriteriaList(prev =>
      prev.map(c => c.id === id ? { ...c, label } : c)
    );
    setEditingId(null);
    setEditingLabel('');
    setEditingError('');
  };

  // Annuler l'édition
  const cancelEditCriteria = () => {
    setEditingId(null);
    setEditingLabel('');
    setEditingError('');
  };

  // Supprimer un critère (quel qu'il soit)
  const removeCriteria = (id) => {
    setCriteriaList(prev => prev.filter(c => c.id !== id));
    setErrors(prev => {
      const e = { ...prev };
      delete e[id];
      return e;
    });
    if (editingId === id) {
      cancelEditCriteria();
    }
  };

  const getStars = (note) => {
    if (!note && note !== 0) return '';
    const stars = Math.round(note / 4);
    return '★'.repeat(Math.min(stars, 5)) + '☆'.repeat(Math.max(0, 5 - Math.min(stars, 5)));
  };

  // Calcul dynamique de la moyenne
  const calculateAverage = () => {
    if (criteriaList.length === 0) return '0.0';
    const total = criteriaList.reduce((sum, c) => sum + (c.note || 0), 0);
    return (total / criteriaList.length).toFixed(1);
  };

  const validate = () => {
    const newErrors = {};
    criteriaList.forEach(c => {
      if (c.note < 0 || c.note > 20) {
        newErrors[c.id] = 'Note entre 0 et 20';
      }
    });

    if (!appreciation || appreciation.trim() === '') {
      newErrors.appreciation = 'Appréciation obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const average = calculateAverage();
      onSave({
        criteriaList,
        appreciation,
        moyenne: average,
        evaluationId: evaluation.id
      });
    }
  };

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
            
            {criteriaList.length === 0 ? (
              <div className="eval-empty-criteria">
                Aucun critère d'évaluation. Cliquez ci-dessous pour en ajouter un.
              </div>
            ) : (
              criteriaList.map((critere) => (
                <div key={critere.id} className="eval-critere-row">
                  <div className="eval-critere-label">
                    <span className="eval-critere-icon">{critere.icon || <FaStar />}</span>
                    
                    {editingId === critere.id ? (
                      <div className="eval-critere-edit-container">
                        <input
                          type="text"
                          className={`eval-critere-edit-input ${editingError ? 'error' : ''}`}
                          value={editingLabel}
                          onChange={(e) => { setEditingLabel(e.target.value); setEditingError(''); }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditCriteria(critere.id);
                            if (e.key === 'Escape') cancelEditCriteria();
                          }}
                          autoFocus
                          maxLength={60}
                        />
                        <button
                          type="button"
                          className="eval-critere-action-btn btn-save"
                          onClick={() => saveEditCriteria(critere.id)}
                          title="Valider la modification"
                        >
                          <FaCheck />
                        </button>
                        <button
                          type="button"
                          className="eval-critere-action-btn btn-cancel"
                          onClick={cancelEditCriteria}
                          title="Annuler"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="eval-critere-name-text">{critere.label}</span>
                        <span className="eval-critere-stars">{getStars(critere.note)}</span>
                      </>
                    )}
                  </div>

                  <div className="eval-critere-right">
                    <div className="eval-critere-input">
                      <input
                        type="number"
                        value={critere.note || ''}
                        onChange={(e) => handleNoteChange(critere.id, e.target.value)}
                        min="0"
                        max="20"
                        step="1"
                        className={`eval-input-number ${errors[critere.id] ? 'error' : ''}`}
                        placeholder="0"
                      />
                      <span className="eval-input-suffix">/ 20</span>
                    </div>

                    <div className="eval-critere-actions">
                      {editingId !== critere.id && (
                        <button
                          type="button"
                          className="eval-critere-action-btn btn-edit"
                          onClick={() => startEditCriteria(critere)}
                          title="Modifier ce critère"
                        >
                          <FaEdit />
                        </button>
                      )}
                      <button
                        type="button"
                        className="eval-critere-action-btn btn-delete"
                        onClick={() => removeCriteria(critere.id)}
                        title="Supprimer ce critère"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {editingId === critere.id && editingError && (
                    <span className="eval-error edit-error">{editingError}</span>
                  )}
                  {errors[critere.id] && (
                    <span className="eval-error">{errors[critere.id]}</span>
                  )}
                </div>
              ))
            )}

            {/* ===== BOUTON AJOUTER CRITÈRE ===== */}
            {showAddCriteria ? (
              <div className="eval-add-critere-form">
                <div className="eval-add-critere-input-row">
                  <input
                    type="text"
                    className={`eval-add-critere-input ${newCriteriaError ? 'error' : ''}`}
                    placeholder="Nom du critère (ex: Initiative, Créativité...)"
                    value={newCriteriaLabel}
                    onChange={(e) => { setNewCriteriaLabel(e.target.value); setNewCriteriaError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && addCriteria()}
                    autoFocus
                    maxLength={60}
                  />
                  <button type="button" className="eval-add-critere-confirm" onClick={addCriteria} title="Confirmer">
                    <FaPlus /> Ajouter
                  </button>
                  <button type="button" className="eval-add-critere-cancel" onClick={() => { setShowAddCriteria(false); setNewCriteriaLabel(''); setNewCriteriaError(''); }} title="Annuler">
                    <FaTimes />
                  </button>
                </div>
                {newCriteriaError && <span className="eval-error">{newCriteriaError}</span>}
              </div>
            ) : (
              <button
                type="button"
                className="eval-add-critere-btn"
                onClick={() => setShowAddCriteria(true)}
              >
                <FaPlus /> Ajouter un critère
              </button>
            )}

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
              value={appreciation}
              onChange={(e) => {
                setAppreciation(e.target.value);
                if (errors.appreciation) setErrors(prev => ({ ...prev, appreciation: '' }));
              }}
              className={`eval-textarea ${errors.appreciation ? 'error' : ''}`}
              placeholder="Rédigez votre appréciation générale sur l'étudiant..."
              rows="4"
              maxLength="500"
            />
            <div className="eval-textarea-footer">
              <span className="eval-char-count">
                {appreciation.length} / 500 caractères
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
async function loadAllEvaluations() {
  const internshipsRes = await internshipsApi.getAll({ limit: 100 });
  const internships = internshipsRes?.data || (Array.isArray(internshipsRes) ? internshipsRes : []);

  const evalPromises = internships.map((s) =>
    evaluationsApi.getByInternship(s.id).catch(() => ({ data: [] }))
  );
  const evalResults = await Promise.all(evalPromises);

  const rows = [];
  internships.forEach((s, i) => {
    const evals = evalResults[i]?.data || [];
    if (evals.length === 0) {
      rows.push({
        id: `pending-${s.id}`,
        stageId: s.id,
        etudiantId: s.student?.id,
        etudiant: s.student?.user
          ? `${s.student.user.prenom ?? ''} ${s.student.user.nom ?? ''}`.trim()
          : 'Étudiant',
        stage: s.intitule,
        entreprise: s.company?.nom || '',
        type: 'ENCADREUR',
        statut: 'À faire',
        date: '',
        note: null,
        filiere: s.student?.formation || '',
        pending: true,
      });
      return;
    }
    evals.forEach((e) => {
      rows.push({
        ...e,
        stageId: s.id,
        etudiantId: s.student?.id,
        etudiant: s.student?.user
          ? `${s.student.user.prenom ?? ''} ${s.student.user.nom ?? ''}`.trim()
          : 'Étudiant',
        stage: s.intitule,
        entreprise: s.company?.nom || '',
        type: e.typeEvaluateur,
        statut: 'Évalué',
        date: e.dateEvaluation ? new Date(e.dateEvaluation).toLocaleDateString('fr-FR') : '',
        note: e.note,
        filiere: s.student?.formation || '',
        pending: false,
      });
    });
  });

  return { rows, internships };
}

function EncadreurEvaluations() {
  const { user } = useAuth();
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [loading, setLoading] = useState(true);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEvalForm, setShowEvalForm] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [allEvaluations, setAllEvaluations] = useState([]);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true);
        const { rows } = await loadAllEvaluations();
        setAllEvaluations(rows);
      } catch (err) {
        console.error(' chargement évaluations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
  }, []);

  const evaluations = studentId
    ? allEvaluations.filter(e => String(e.etudiantId) === String(studentId))
    : allEvaluations;

  const getStudentName = () => {
    if (studentId) {
      const student = allEvaluations.find(e => String(e.etudiantId) === String(studentId));
      return student ? student.etudiant : '';
    }
    return '';
  };

  const studentName = getStudentName();

  const stats = {
    total: evaluations.length,
    valides: evaluations.filter(e => e.statut === 'Évalué').length,
    enAttente: new Set(
      evaluations.filter(e => e.pending).map(e => String(e.etudiantId))
    ).size
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
    return statut === 'Évalué' ? 'badge-valide' : 'badge-en-attente';
  };

  const openDetailModal = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowDetailModal(true);
  };

  const openEvalForm = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowEvalForm(true);
  };

  const handleSaveEvaluation = async (data) => {
    try {
      if (!selectedEvaluation?.stageId) {
        toast.error('Stage introuvable pour cette évaluation');
        return;
      }
      const criteriaLabels = [
        ['Compétences techniques', data.competenceTech],
        ['Qualité du travail', data.qualiteTravail],
        ['Autonomie', data.autonomie],
        ['Respect des délais', data.respectDelais],
        ["Esprit d'équipe", data.espritEquipe],
        ['Communication', data.communication],
        ['Assiduité et ponctualité', data.assiduite],
      ];
      const observation = criteriaLabels
        .map(([label, val]) => `${label} : ${val}/20`)
        .join(' | ');
      const payload = {
        stageId: selectedEvaluation.stageId,
        evaluateurId: user?.id,
        typeEvaluateur: 'ENCADREUR',
        note: Number(data.moyenne),
        observation,
      };
      if (data.appreciation?.trim()) {
        payload.commentaire = data.appreciation.trim();
      }
      await evaluationsApi.create(payload);
      toast.success(<>
        <div>Évaluation enregistrée avec succès !</div>
        <div>Note moyenne : {data.moyenne}/20</div>
      </>);
      setShowEvalForm(false);
      setSelectedEvaluation(null);
      const { rows } = await loadAllEvaluations();
      setAllEvaluations(rows);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Erreur lors de l'enregistrement";
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
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
            <span className="stat-label">Évaluées</span>
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
                    { value: 'Évalué', label: 'Évalué' },
                    { value: 'À faire', label: 'À faire' }
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

        {loading ? (
          <div className="empty-state">
            <FaStar className="empty-icon" />
            <h3>Chargement...</h3>
          </div>
        ) : filteredEvals.length === 0 ? (
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