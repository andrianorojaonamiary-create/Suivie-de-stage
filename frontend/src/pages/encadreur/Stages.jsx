import { useState } from 'react';
import { 
  FaClipboardList, FaSearch, FaFilter, FaChevronLeft, FaChevronRight,
  FaClock, FaCheckCircle, FaEye, FaTimes, 
} from 'react-icons/fa';
import ViewModal from './components/ViewModal';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';

function EncadreurStages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ===== MODAL =====
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);

  const [stages] = useState([
    {
      id: 1,
      titre: "Plateforme web RH",
      etudiant: 'Rakoto Miora',
      entreprise: 'TechMada SARL',
      ville: 'Antananarivo',
      dateDebut: '2024-03-01',
      dateFin: '2024-09-15',
      statut: 'En cours',
      statutValidation: 'valide',
      progression: 65,
      description: "Développement d'une plateforme web de gestion RH",
      encadreur: 'M. Rakotomalala',
      tuteur: 'Prof. Andrianivo'
    },
    {
      id: 2,
      titre: "Migration système",
      etudiant: 'Ramanantsoa Tojo',
      entreprise: 'BNI Madagascar',
      ville: 'Antananarivo',
      dateDebut: '2024-05-01',
      dateFin: '2024-11-01',
      statut: 'En attente',
      statutValidation: 'en_attente',
      progression: 15,
      description: "Migration du système d'information",
      encadreur: 'M. Rakotomalala',
      tuteur: 'Prof. Andrianivo'
    },
    {
      id: 3,
      titre: "Gestion rendez-vous",
      etudiant: 'Razafindramary Fy',
      entreprise: 'Santé Plus',
      ville: 'Antananarivo',
      dateDebut: '2024-08-01',
      dateFin: '2025-01-15',
      statut: 'En cours',
      statutValidation: 'valide',
      progression: 5,
      description: "Application de gestion des rendez-vous",
      encadreur: 'M. Rakotomalala',
      tuteur: 'Prof. Andrianivo'
    },
    {
      id: 4,
      titre: "Gestion de stock",
      etudiant: 'Rajaonarivelo Ando',
      entreprise: 'DistriTech',
      ville: 'Antananarivo',
      dateDebut: '2024-07-01',
      dateFin: '2024-12-31',
      statut: 'Refusé',
      statutValidation: 'refuse',
      progression: 20,
      description: "Système de gestion de stock",
      encadreur: 'M. Rakotomalala',
      tuteur: 'Dr. Ranaivo'
    }
  ]);

  const stats = {
    total: stages.length,
    enCours: stages.filter(s => s.statut === 'En cours').length,
    enAttente: stages.filter(s => s.statut === 'En attente').length,
    termines: stages.filter(s => s.statut === 'Terminé' || s.statut === 'Validé').length,
    refuses: stages.filter(s => s.statut === 'Refusé').length
  };

  const filteredStages = stages.filter(s => {
    if (selectedStatus !== 'tous' && s.statut !== selectedStatus) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      return s.etudiant.toLowerCase().includes(term) ||
             s.titre.toLowerCase().includes(term) ||
             s.entreprise.toLowerCase().includes(term);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredStages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStages = filteredStages.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (statut) => {
    const badges = {
      'En cours': { className: 'status-badge status-en-cours', label: 'En cours' },
      'En attente': { className: 'status-badge status-en-attente', label: 'En attente' },
      'Terminé': { className: 'status-badge status-termine', label: 'Terminé' },
      'Validé': { className: 'status-badge status-valide', label: 'Validé' },
      'Refusé': { className: 'status-badge status-refuse', label: 'Refusé' }
    };
    const badge = badges[statut] || badges['En attente'];
    return <span className={badge.className}>{badge.label}</span>;
  };

  // ===== ACTIONS =====
  const openViewModal = (stage) => {
    setSelectedStage(stage);
    setShowViewModal(true);
  };

  return (
    <div className="encadreur-stages">
      <div className="page-header">
        <div>
          <h1>Stages suivis</h1>
          <p className="text-muted">{stages.length} stages que vous encadrez</p>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon total"><FaClipboardList /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active"><FaClock /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.enCours}</span>
            <span className="stat-label">En cours</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending"><FaClock /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.enAttente}</span>
            <span className="stat-label">En attente</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon done"><FaCheckCircle /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.termines}</span>
            <span className="stat-label">Terminés</span>
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
                    { value: 'En cours', label: 'En cours' },
                    { value: 'En attente', label: 'En attente' },
                    { value: 'Terminé', label: 'Terminé' },
                    { value: 'Validé', label: 'Validé' },
                    { value: 'Refusé', label: 'Refusé' }
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

        {filteredStages.length === 0 ? (
          <div className="empty-state">
            <FaClipboardList className="empty-icon" />
            <h3>Aucun stage trouvé</h3>
          </div>
        ) : (
          <>
            <table className="stages-table">
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>tage</th>
                  <th>Entreprise</th>
                  <th>Période</th>
                  <th>Statut</th>
                  <th className="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStages.map((stage) => (
                  <tr key={stage.id}>
                    <td><strong>{stage.etudiant}</strong></td>
                    <td>{stage.titre}</td>
                    <td>{stage.entreprise}</td>
                    <td>{formatDate(stage.dateDebut)} → {formatDate(stage.dateFin)}</td>
                    <td>{getStatusBadge(stage.statut)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view" 
                          onClick={() => openViewModal(stage)}
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
                  {filteredStages.length} stage{filteredStages.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== MODAL VIEW ===== */}
      <ViewModal
        stage={selectedStage}
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
      />
    </div>
  );
}

export default EncadreurStages;