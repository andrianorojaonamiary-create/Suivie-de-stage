import { useState } from 'react';
import { 
  FaComment, FaPlus, FaEye, FaEdit, FaTrash,
  FaSearch, FaFilter, FaChevronLeft, FaChevronRight,
  FaUserGraduate, FaBuilding, FaTimes, FaSave,
  FaClock, FaInfoCircle
} from 'react-icons/fa';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';

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

  const [observations, setObservations] = useState([
    {
      id: 1,
      etudiant: 'Rakoto Miora',
      stage: 'Plateforme web RH',
      entreprise: 'TechMada SARL',
      date: '15 Mai 2024',
      contenu: "L'étudiant progresse bien, bon investissement dans le projet.",
      auteur: 'Prof. Andrianivo'
    },
    {
      id: 2,
      etudiant: 'Rakotondrabe Hery',
      stage: 'App mobile comptes',
      entreprise: 'Airtel Madagascar',
      date: '10 Mai 2024',
      contenu: 'Difficultés rencontrées sur la partie backend, besoin d\'accompagnement.',
      auteur: 'Prof. Andrianivo'
    },
    {
      id: 3,
      etudiant: 'Ramanantsoa Tojo',
      stage: 'Migration système',
      entreprise: 'BNI Madagascar',
      date: '05 Mai 2024',
      contenu: 'Très bon travail, l\'étudiant est autonome et force de proposition.',
      auteur: 'Prof. Andrianivo'
    }
  ]);

  const [formData, setFormData] = useState({
    etudiant: '',
    contenu: ''
  });

  const etudiants = ['tous', ...new Set(observations.map(o => o.etudiant))].map(v => ({ value: v, label: v === 'tous' ? 'Tous les étudiants' : v }));

  const filteredObs = observations.filter(o => {
    if (selectedEtudiant !== 'tous' && o.etudiant !== selectedEtudiant) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      return o.etudiant.toLowerCase().includes(term) ||
             o.stage.toLowerCase().includes(term) ||
             o.contenu.toLowerCase().includes(term);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredObs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedObs = filteredObs.slice(startIndex, startIndex + itemsPerPage);

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
    total: observations.length,
    recents: observations.filter(o => {
      const date = new Date(o.date);
      const now = new Date();
      const diff = (now - date) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }).length
  };

  const handleAdd = () => {
    if (!formData.etudiant || !formData.contenu) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    const newObs = {
      id: Date.now(),
      etudiant: formData.etudiant,
      stage: 'Stage en cours',
      entreprise: 'Entreprise',
      date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
      contenu: formData.contenu,
      auteur: 'Prof. Andrianivo'
    };
    setObservations([newObs, ...observations]);
    setShowAddModal(false);
    setFormData({ etudiant: '', contenu: '' });
  };

  const handleEdit = (obs) => {
    setSelectedObs(obs);
    setFormData({ etudiant: obs.etudiant, contenu: obs.contenu });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (!formData.etudiant || !formData.contenu) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    const updated = observations.map(o => 
      o.id === selectedObs.id ? { ...o, etudiant: formData.etudiant, contenu: formData.contenu } : o
    );
    setObservations(updated);
    setShowEditModal(false);
    setSelectedObs(null);
    setFormData({ etudiant: '', contenu: '' });
  };

  const handleDelete = (obs) => {
    setObsToDelete(obs);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setObservations(observations.filter(o => o.id !== obsToDelete.id));
    setShowDeleteModal(false);
    setObsToDelete(null);
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

        {filteredObs.length === 0 ? (
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
                  <th>Stage</th>
                  <th>Observation</th>
                  <th>Date</th>
                  <th className="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedObs.map((obs) => (
                  <tr key={obs.id}>
                    <td>
                      <div className="student-cell">
                        <span className="student-name">{obs.etudiant}</span>
                      </div>
                    </td>
                    <td>
                      <div className="stage-cell">
                        <span className="stage-title">{obs.stage}</span>
                        <span className="stage-company">{obs.entreprise}</span>
                      </div>
                    </td>
                    <td>
                      <div className="observation-cell">
                        <span className="observation-text">{obs.contenu}</span>
                        <span className="observation-author">{obs.auteur}</span>
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
                  {filteredObs.length} observation{filteredObs.length > 1 ? 's' : ''}
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
                  value={formData.etudiant}
                  onChange={(v) => setFormData({ ...formData, etudiant: v })}
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
              <button className="btn-modal-confirm btn-validate" onClick={handleAdd}>
                <FaSave /> Enregistrer
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
                <label><FaUserGraduate /> Étudiant *</label>
                <SelectPersonnalise
                  className="form-control"
                  value={formData.etudiant}
                  onChange={(v) => setFormData({ ...formData, etudiant: v })}
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
              <button className="btn-modal-cancel" onClick={() => setShowEditModal(false)}>Annuler</button>
              <button className="btn-modal-confirm btn-validate" onClick={handleUpdate}>
                <FaSave /> Modifier
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