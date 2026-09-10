import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaFileAlt,
  FaCheck, FaTimes, FaEye, FaClock, FaFilter, 
  FaSearch, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { internshipsApi } from '../../api';

// Composants Modals
import ViewModal from './components/ViewModal';
import ValidateModal from './components/ValidateModal';
import RejectModal from './components/RejectModal';

function StagesEnseignant() {
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('en_attente');
  const [searchTerm, setSearchTerm] = useState('');
  
  // ===== MODALS =====
  const [modalValidateOpen, setModalValidateOpen] = useState(false);
  const [modalRejectOpen, setModalRejectOpen] = useState(false);
  const [modalViewOpen, setModalViewOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [commentaire, setCommentaire] = useState('');
  
  // ===== PAGINATION =====
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ===== DONNÉES API =====
  const [stages, setStages] = useState([
    {
      id: 1,
      titre: "Développement d'une plateforme web de gestion RH",
      etudiant: 'Miora Rakoto',
      entreprise: 'TechMada SARL',
      ville: 'Antananarivo',
      dateDebut: '2024-03-01',
      dateFin: '2024-09-15',
      statutValidation: 'en_attente',
      description: "Développement d'une plateforme web de gestion des ressources humaines avec React et Node.js.",
      commentaireValidation: null,
      encadreur: 'M. Rakotomalala',
      tuteur: 'Prof. Andrianivo',
      progression: 65
    },
    {
      id: 2,
      titre: "Application mobile de gestion des comptes",
      etudiant: 'Hery Rakotondrabe',
      entreprise: 'Airtel Madagascar',
      ville: 'Antananarivo',
      dateDebut: '2024-04-01',
      dateFin: '2024-10-01',
      statutValidation: 'en_attente',
      description: "Développement d'une application mobile de gestion des comptes clients sous Android.",
      commentaireValidation: null,
      encadreur: 'Mme. Ralava',
      tuteur: 'Dr. Ranaivo',
      progression: 30
    },
    {
      id: 3,
      titre: "Migration et sécurisation du système d'information",
      etudiant: 'Ramanantsoa Tojo',
      entreprise: 'BNI Madagascar',
      ville: 'Antananarivo',
      dateDebut: '2024-05-01',
      dateFin: '2024-11-01',
      statutValidation: 'en_attente',
      description: "Migration du système d'information vers une architecture sécurisée avec chiffrement des données.",
      commentaireValidation: null,
      encadreur: 'M. Randrianarison',
      tuteur: 'Prof. Andrianivo',
      progression: 15
    },
    {
      id: 4,
      titre: "Analyse de données pour la relation client",
      etudiant: 'Andriantsoa Fanja',
      entreprise: 'Airtel Madagascar',
      ville: 'Antananarivo',
      dateDebut: '2024-06-01',
      dateFin: '2024-12-01',
      statutValidation: 'en_attente',
      description: "Analyse des données clients pour améliorer la relation client avec Python et Power BI.",
      commentaireValidation: null,
      encadreur: 'Mme. Ralava',
      tuteur: 'Dr. Ranaivo',
      progression: 10
    },
    {
      id: 5,
      titre: "Développement d'une plateforme de e-learning",
      etudiant: 'Rakotondrabe Hery',
      entreprise: 'TechMada SARL',
      ville: 'Antananarivo',
      dateDebut: '2024-02-01',
      dateFin: '2024-08-01',
      statutValidation: 'valide',
      description: "Développement d'une plateforme de e-learning pour les employés avec Moodle.",
      commentaireValidation: 'Stage conforme aux attentes, bon travail',
      encadreur: 'M. Rakotomalala',
      tuteur: 'Prof. Andrianivo',
      progression: 100
    },
    {
      id: 6,
      titre: "Système de gestion de stock",
      etudiant: 'Rajaonarivelo Ando',
      entreprise: 'DistriTech',
      ville: 'Antananarivo',
      dateDebut: '2024-07-01',
      dateFin: '2024-12-31',
      statutValidation: 'refuse',
      description: "Développement d'un système de gestion de stock pour entreprise de distribution.",
      commentaireValidation: 'Sujet déjà traité par un autre stagiaire',
      encadreur: 'M. Randrianarison',
      tuteur: 'Dr. Ranaivo',
      progression: 20
    },
    {
      id: 7,
      titre: "Application de gestion des rendez-vous",
      etudiant: 'Razafindramary Fy',
      entreprise: 'Santé Plus',
      ville: 'Antananarivo',
      dateDebut: '2024-08-01',
      dateFin: '2025-01-15',
      statutValidation: 'en_attente',
      description: "Application mobile de gestion des rendez-vous médicaux avec React Native.",
      commentaireValidation: null,
      encadreur: 'Mme. Ralava',
      tuteur: 'Prof. Andrianivo',
      progression: 5
    }
  ]);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const res = await internshipsApi.getAll();
        const list = Array.isArray(res) ? res : res?.items || [];
        if (list.length > 0) {
          const mapped = list.map(item => ({
            id: item.id,
            titre: item.title || item.subject || 'Stage',
            etudiant: item.student ? `${item.student.lastName || ''} ${item.student.firstName || ''}`.trim() : 'Étudiant',
            entreprise: item.company?.name || item.companyName || 'Entreprise',
            ville: item.city || item.location || 'Antananarivo',
            dateDebut: item.startDate || null,
            dateFin: item.endDate || null,
            statutValidation: item.validationStatus || item.status || 'en_attente',
            description: item.description || '',
            commentaireValidation: item.validationComment || null,
            encadreur: item.supervisor ? `${item.supervisor.lastName || ''} ${item.supervisor.firstName || ''}`.trim() : '—',
            tuteur: item.teacher ? `${item.teacher.lastName || ''} ${item.teacher.firstName || ''}`.trim() : '—',
            progression: item.progressPercentage || 0
          }));
          setStages(mapped);
        }
      } catch (err) {
        console.error('Erreur chargement stages enseignant:', err);
      }
    };
    fetchStages();
  }, []);

  // ===== STATISTIQUES =====
  const stats = {
    enAttente: stages.filter(s => s.statutValidation === 'en_attente').length,
    valides: stages.filter(s => s.statutValidation === 'valide').length,
    refuses: stages.filter(s => s.statutValidation === 'refuse').length,
    total: stages.length
  };

  // ===== FILTRAGE ET RECHERCHE =====
  const filteredStages = stages.filter(s => {
    if (selectedStatus !== 'tous' && s.statutValidation !== selectedStatus) return false;
    
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      return s.etudiant.toLowerCase().includes(term) ||
             s.titre.toLowerCase().includes(term) ||
             s.entreprise.toLowerCase().includes(term);
    }
    return true;
  });

  // ===== PAGINATION =====
  const totalPages = Math.ceil(filteredStages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStages = filteredStages.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (value) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // ===== FORMAT DATE =====
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // ===== BADGE STATUT =====
  const getStatusBadge = (statut) => {
    const badges = {
      'valide': { className: 'status-badge status-valide', label: 'Validé' },
      'refuse': { className: 'status-badge status-refuse', label: 'Refusé' },
      'en_attente': { className: 'status-badge status-en-attente', label: 'En attente' }
    };
    const badge = badges[statut] || badges.en_attente;
    return <span className={badge.className}>{badge.label}</span>;
  };

  // ===== ACTIONS =====
  const openValidateModal = (stage) => {
    setSelectedStage(stage);
    setCommentaire('');
    setModalValidateOpen(true);
  };

  const openRejectModal = (stage) => {
    setSelectedStage(stage);
    setCommentaire('');
    setModalRejectOpen(true);
  };

  const openViewModal = (stage) => {
    setSelectedStage(stage);
    setModalViewOpen(true);
  };

  const closeValidateModal = () => {
    if (!loading) {
      setModalValidateOpen(false);
      setSelectedStage(null);
      setCommentaire('');
    }
  };

  const closeRejectModal = () => {
    if (!loading) {
      setModalRejectOpen(false);
      setSelectedStage(null);
      setCommentaire('');
    }
  };

  const closeViewModal = () => {
    setModalViewOpen(false);
    setSelectedStage(null);
  };

  const confirmValidate = async () => {
    setLoading(true);
    try {
      await internshipsApi.update(selectedStage.id, {
        validationStatus: 'valide',
        validationComment: commentaire
      });
      setStages(prev => prev.map(s =>
        s.id === selectedStage.id ? { ...s, statutValidation: 'valide', commentaireValidation: commentaire } : s
      ));
      toast.success(`✅ Stage "${selectedStage?.titre}" validé avec succès !`);
      setModalValidateOpen(false);
      setSelectedStage(null);
      setCommentaire('');
    } catch (err) {
      toast.error('Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!commentaire || commentaire.trim() === '') {
      toast.warning('⚠️ Veuillez ajouter un commentaire pour justifier le refus');
      return;
    }
    setLoading(true);
    try {
      await internshipsApi.update(selectedStage.id, {
        validationStatus: 'refuse',
        validationComment: commentaire
      });
      setStages(prev => prev.map(s =>
        s.id === selectedStage.id ? { ...s, statutValidation: 'refuse', commentaireValidation: commentaire } : s
      ));
      toast.success(`Stage "${selectedStage?.titre}" refusé.`);
      setModalRejectOpen(false);
      setSelectedStage(null);
      setCommentaire('');
    } catch (err) {
      toast.error('Erreur lors du refus');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'en_attente', label: 'En attente' },
    { value: 'valide', label: 'Validé' },
    { value: 'refuse', label: 'Refusé' },
    { value: 'tous', label: 'Tous' }
  ];

  return (
    <div className="enseignant-stages">
      {/* ===== EN-TÊTE ===== */}
      <div className="page-header">
        <div>
          <h1><FaFileAlt /> Stages à valider</h1>
          <p className="text-muted">Gérez les stages en attente de validation</p>
        </div>
      </div>

      {/* ===== STATISTIQUES ===== */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon pending"><FaClock /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.enAttente}</span>
            <span className="stat-label">En attente</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon validated"><FaCheck /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.valides}</span>
            <span className="stat-label">Validés</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon rejected"><FaTimes /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.refuses}</span>
            <span className="stat-label">Refusés</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon total"><FaFileAlt /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
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
                <select 
                  value={selectedStatus} 
                  onChange={(e) => handleFilterChange(e.target.value)}
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
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
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ===== TABLEAU ===== */}
        {filteredStages.length === 0 ? (
          <div className="empty-state">
            <FaFileAlt className="empty-icon" />
            <h3>Aucun stage trouvé</h3>
          </div>
        ) : (
          <>
            <table className="stages-table">
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>Stage</th>
                  <th>Entreprise</th>
                  <th>Période</th>
                  <th>Statut</th>
                  <th className="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStages.map((stage) => (
                  <tr key={stage.id}>
                    <td>
                      <div className="stage-student">
                        <span className="student-name">{stage.etudiant}</span>
                      </div>
                    </td>
                    <td>
                      <div className="stage-title-cell">
                        <span className="stage-title">{stage.titre}</span>
                      </div>
                    </td>
                    <td>
                      <div className="stage-company-cell">
                        <span className="company-name">{stage.entreprise}</span>
                      </div>
                    </td>
                    <td>
                      <span className="date-text">
                        {formatDate(stage.dateDebut)} → {formatDate(stage.dateFin)}
                      </span>
                    </td>
                    <td>{getStatusBadge(stage.statutValidation)}</td>
                    <td>
                      <div className="action-buttons">
                        {stage.statutValidation === 'en_attente' && (
                          <>
                            <button 
                              className="action-btn validate" 
                              onClick={() => openValidateModal(stage)}
                              title="Valider le stage"
                            >
                              <FaCheck />
                            </button>
                            <button 
                              className="action-btn reject" 
                              onClick={() => openRejectModal(stage)}
                              title="Refuser le stage"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        <button 
                          className="action-btn view" 
                          onClick={() => openViewModal(stage)}
                          title="Voir les détails du stage"
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
                  {filteredStages.length} stage{filteredStages.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== MODALS ===== */}
      <ValidateModal
        stage={selectedStage}
        isOpen={modalValidateOpen}
        onClose={closeValidateModal}
        onConfirm={confirmValidate}
        loading={loading}
        commentaire={commentaire}
        setCommentaire={setCommentaire}
      />

      <RejectModal
        stage={selectedStage}
        isOpen={modalRejectOpen}
        onClose={closeRejectModal}
        onConfirm={confirmReject}
        loading={loading}
        commentaire={commentaire}
        setCommentaire={setCommentaire}
      />

      <ViewModal
        stage={selectedStage}
        isOpen={modalViewOpen}
        onClose={closeViewModal}
      />
    </div>
  );
}

export default StagesEnseignant;