import { useState, useEffect } from 'react';
import {
  FaComment, FaPlus, FaEye, FaEdit, FaTrash,
  FaSearch, FaFilter, FaChevronLeft, FaChevronRight,
  FaUserGraduate, FaBuilding, FaTimes, FaSave,
  FaClock, FaInfoCircle
} from 'react-icons/fa';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';
import { toast } from 'react-toastify';
import { internshipsApi, trackingApi } from '../../api';

const TYPE_LABELS = {
  OBSERVATION: 'Observation',
  ENTRETIEN: 'Entretien',
  RAPPORT: 'Rapport',
};

function EnseignantObservations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEtudiant, setSelectedEtudiant] = useState('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedObs, setSelectedObs] = useState(null);
  const [obsToDelete, setObsToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  const [observations, setObservations] = useState([]);
  const [stages, setStages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ etudiantId: '', contenu: '' });

  const getPreferredStage = (studentIdTarget) => {
    return stages.find((s) => String(s.student?.id) === String(studentIdTarget) && s.statut === 'EN_COURS') ||
      stages.find((s) => String(s.student?.id) === String(studentIdTarget) && s.statut === 'TERMINE') ||
      stages.find((s) => String(s.student?.id) === String(studentIdTarget)) || null;
  };

  useEffect(() => {
    const fetchObservations = async () => {
      try {
        setLoading(true);
        const res = await internshipsApi.getAll({ limit: 100 });
        const internships = res?.data || (Array.isArray(res) ? res : []);
        setStages(internships);

        const followUpPromises = internships.map(async (s) => {
          const followRes = await trackingApi.getByInternship(s.id).catch(() => ({ data: [] }));
          const list = followRes?.data || (Array.isArray(followRes) ? followRes : []);
          return list.map((f) => ({
            id: f.id,
            stageId: s.id,
            etudiantId: s.student?.id,
            etudiant: s.student?.user
              ? `${s.student.user.prenom ?? ''} ${s.student.user.nom ?? ''}`.trim()
              : 'Étudiant',
            stage: s.intitule,
            entreprise: s.company?.nom || '',
            date: f.date ? new Date(f.date).toLocaleDateString('fr-FR') : '—',
            dateBrute: f.date || null,
            contenu: f.contenu || '',
            type: TYPE_LABELS[f.type] || f.type || 'Observation',
            auteur: f.auteur
              ? `${f.auteur.prenom ?? ''} ${f.auteur.nom ?? ''}`.trim() || 'Tuteur'
              : 'Tuteur',
          }));
        });

        const results = await Promise.all(followUpPromises);
        setObservations(results.flat());
      } catch (err) {
        console.error('Erreur chargement observations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchObservations();
  }, []);

  const filteredObs = observations;

  const etudiantOptions = stages
    .filter((s) => s.student?.id)
    .map((s) => ({
      value: String(s.student.id),
      label: `${s.student.user?.prenom ?? ''} ${s.student.user?.nom ?? ''}`.trim() || 'Étudiant',
    }))
    .filter((o, index, arr) => arr.findIndex((x) => x.value === o.value) === index);
  const etudiants = [
    { value: 'tous', label: 'Tous les étudiants' },
    ...etudiantOptions,
  ];

  const filteredData = filteredObs.filter(o => {
    if (selectedEtudiant !== 'tous' && String(o.etudiantId) !== String(selectedEtudiant)) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      return o.etudiant.toLowerCase().includes(term) ||
             o.stage.toLowerCase().includes(term) ||
             o.contenu.toLowerCase().includes(term);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedObs = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const stats = {
    total: filteredObs.length,
    recents: filteredObs.filter(o => {
      const date = new Date(o.dateBrute);
      if (Number.isNaN(date.getTime())) return false;
      const now = new Date();
      const diff = (now - date) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }).length
  };

  const handleAdd = async () => {
    if (!formData.etudiantId || !formData.contenu) {
      toast.warning('Veuillez remplir tous les champs');
      return;
    }
    const stage = getPreferredStage(formData.etudiantId);
    if (!stage) {
      toast.error('Aucun stage trouvé pour cet étudiant');
      return;
    }
    setSubmitting(true);
    try {
      const created = await trackingApi.create(stage.id, {
        contenu: formData.contenu,
        type: 'OBSERVATION',
      });
      const newObservation = {
        id: created?.id || Date.now(),
        stageId: stage.id,
        etudiantId: stage.student?.id,
        etudiant: stage.student?.user
          ? `${stage.student.user.prenom ?? ''} ${stage.student.user.nom ?? ''}`.trim()
          : 'Étudiant',
        stage: stage.intitule,
        entreprise: stage.company?.nom || '',
        date: new Date().toLocaleDateString('fr-FR'),
        contenu: formData.contenu,
        type: 'Observation',
        auteur: 'Tuteur',
      };
      setObservations([newObservation, ...observations]);
      toast.success('Observation ajoutée avec succès !');
      setShowAddModal(false);
      setFormData({ etudiantId: '', contenu: '' });
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Erreur lors de l'ajout";
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (obs) => {
    setSelectedObs(obs);
    setFormData({ etudiantId: String(obs.etudiantId), contenu: obs.contenu });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!formData.contenu) {
      toast.warning('Veuillez remplir le champ observation');
      return;
    }
    setSubmitting(true);
    try {
      await trackingApi.update(selectedObs.id, { contenu: formData.contenu });
      setObservations(observations.map(o =>
        o.id === selectedObs.id ? { ...o, contenu: formData.contenu } : o
      ));
      toast.success('Observation modifiée avec succès !');
      setShowEditModal(false);
      setSelectedObs(null);
      setFormData({ etudiantId: '', contenu: '' });
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Erreur lors de la modification';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (obs) => {
    setObsToDelete(obs);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setSubmitting(true);
    try {
      await trackingApi.delete(obsToDelete.id);
      setObservations(observations.filter(o => o.id !== obsToDelete.id));
      toast.success('Observation supprimée');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Erreur lors de la suppression';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setSubmitting(false);
      setShowDeleteModal(false);
      setObsToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setObsToDelete(null);
  };

  const handleView = (obs) => {
    setSelectedObs(obs);
    setShowViewModal(true);
  };

  return (
    <div className="observations-page">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div>
          <h1>Observations</h1>
          <p className="text-muted">Gérez les observations sur les étudiants</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Ajouter une observation
        </button>
      </div>

      {/* ===== STATISTIQUES ===== */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon total"><FaComment /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active"><FaClock /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.recents}</span>
            <span className="stat-label">Récentes (7j)</span>
          </div>
        </div>
      </div>

      {/* ===== TABLEAU ===== */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="toolbar-filters">
            <div className="filter-wrapper">
              <div className="filter-group">
                <FaFilter className="filter-icon" />
                <SelectPersonnalise
                  value={selectedEtudiant}
                  onChange={setSelectedEtudiant}
                  options={etudiants}
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
            <FaComment className="empty-icon" />
            <h3>Chargement...</h3>
          </div>
        ) : paginatedObs.length === 0 ? (
          <div className="empty-state">
            <FaComment className="empty-icon" />
            <h3>Aucune observation</h3>
            <p>Aucune observation ne correspond à vos critères</p>
          </div>
        ) : (
          <>
            <table className="observations-table">
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th> Stage</th>
                  <th>Observation</th>
                  <th>Date</th>
                  <th className="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedObs.map((obs) => (
                  <tr key={obs.id}>
                    <td><strong>{obs.etudiant}</strong></td>
                    <td>
                      <div className="stage-cell">
                        <span className="stage-title">{obs.stage}</span>
                        <span className="stage-company">{obs.entreprise}</span>
                      </div>
                    </td>
                    <td>
                      <div className="observation-cell">
                        <span className="observation-text">{obs.contenu}</span>
                        <span className="observation-author">{obs.type} · {obs.auteur}</span>
                      </div>
                    </td>
                    <td>{obs.date}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view" onClick={() => handleView(obs)} title="Voir">
                          <FaEye />
                        </button>
                        <button className="action-btn edit" onClick={() => handleEdit(obs)} title="Modifier">
                          <FaEdit />
                        </button>
                        <button className="action-btn delete" onClick={() => handleDelete(obs)} title="Supprimer">
                          <FaTrash />
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
                  {filteredData.length} observation{filteredData.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== MODAL AJOUT ===== */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaComment className="modal-icon-view" /> Ajouter une observation</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label><FaUserGraduate /> Étudiant *</label>
                <SelectPersonnalise
                  className="form-control"
                  value={formData.etudiantId}
                  onChange={(v) => setFormData({ ...formData, etudiantId: v })}
                  placeholder="Sélectionner un étudiant"
                  options={etudiants.filter(e => e.value !== 'tous')}
                />
              </div>
              <div className="form-group">
                <label><FaComment /> Observation *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Rédigez votre observation..."
                  value={formData.contenu}
                  onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setShowAddModal(false)}>Annuler</button>
              <button className="btn-modal-confirm btn-validate" onClick={handleAdd} disabled={submitting}>
                <FaSave /> {submitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL ÉDITION ===== */}
      {showEditModal && selectedObs && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaEdit className="modal-icon-view" /> Modifier l'observation</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label><FaUserGraduate /> Étudiant</label>
                <span className="form-control-static">{selectedObs.etudiant} · {selectedObs.stage}</span>
              </div>
              <div className="form-group">
                <label><FaComment /> Observation *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Rédigez votre observation..."
                  value={formData.contenu}
                  onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setShowEditModal(false)}>Annuler</button>
              <button className="btn-modal-confirm btn-validate" onClick={handleUpdate} disabled={submitting}>
                <FaSave /> {submitting ? 'Modification...' : 'Modifier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL VISUALISATION ===== */}
      {showViewModal && selectedObs && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaInfoCircle className="modal-icon-view" /> Détails de l'observation</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div className="view-row">
                <span className="view-label"><FaUserGraduate /> Étudiant</span>
                <span className="view-value"><strong>{selectedObs.etudiant}</strong></span>
              </div>
              <div className="view-row">
                <span className="view-label"><FaBuilding /> Stage</span>
                <span className="view-value">{selectedObs.stage}</span>
              </div>
              <div className="view-row">
                <span className="view-label"><FaBuilding /> Entreprise</span>
                <span className="view-value">{selectedObs.entreprise}</span>
              </div>
              <div className="view-row">
                <span className="view-label">Date</span>
                <span className="view-value">{selectedObs.date}</span>
              </div>
              <div className="view-row">
                <span className="view-label"><FaUserGraduate /> Auteur</span>
                <span className="view-value">{selectedObs.auteur}</span>
              </div>
              <div className="view-row view-description">
                <span className="view-label"><FaComment /> Observation</span>
                <span className="view-value view-description-text">{selectedObs.contenu}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setShowViewModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL CONFIRMATION SUPPRESSION ===== */}
      {showDeleteModal && obsToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmer la suppression</h3>
            <p>
              Voulez-vous vraiment supprimer cette observation de <strong>{obsToDelete.etudiant}</strong> ? Cette action est irréversible.
            </p>
            <div className="modal-actions">
              <button className="btn-danger" onClick={confirmDelete}>
                Supprimer
              </button>
              <button className="btn-secondary" onClick={cancelDelete}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnseignantObservations;