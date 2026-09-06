// src/pages/admin/Etudiants.jsx
import { useState } from 'react';
import { 
  FaSearch, FaFilter, FaPlus, FaEye, FaEdit, FaTrash,
  FaUserGraduate, FaGraduationCap, FaBuilding, FaCheck,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

import EtudiantForm from './components/EtudiantForm';
import EtudiantDetail from './components/EtudiantDetail';
import EtudiantDelete from './components/EtudiantDelete';

function AdminEtudiants() {
  // ===== ÉTATS =====
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFiliere, setFilterFiliere] = useState('Tous');
  const [filterPromotion, setFilterPromotion] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    filiere: '',
    promotion: '',
    niveau: '',
    statut: 'Actif'
  });
  const itemsPerPage = 5;

  // ===== DONNÉES ÉTUDIANTS =====
  const [etudiants, setEtudiants] = useState([
    {
      id: 1,
      matricule: 'ETU001',
      nom: 'Rakoto',
      prenom: 'Miora',
      email: 'miora.rakoto@email.mg',
      telephone: '+261 34 12 345 67',
      filiere: 'Génie Informatique',
      promotion: '2026',
      niveau: 'L3',
      statut: 'Actif',
      stage: 'Développement Web',
      entreprise: 'ABC Informatique'
    },
    {
      id: 2,
      matricule: 'ETU002',
      nom: 'Rakotondrabe',
      prenom: 'Hery',
      email: 'hery.rakotondrabe@email.mg',
      telephone: '+261 34 23 456 78',
      filiere: 'Management',
      promotion: '2026',
      niveau: 'L3',
      statut: 'Actif',
      stage: 'Gestion RH',
      entreprise: 'BNI Madagascar'
    },
    {
      id: 3,
      matricule: 'ETU003',
      nom: 'Andriantsoa',
      prenom: 'Fanja',
      email: 'fanja.andriantsoa@email.mg',
      telephone: '+261 34 34 567 89',
      filiere: 'Relations publiques & Multimédia',
      promotion: '2025',
      niveau: 'M1',
      statut: 'Diplômé',
      stage: 'Communication',
      entreprise: 'Orange Madagascar'
    },
    {
      id: 4,
      matricule: 'ETU004',
      nom: 'Ramanantsoa',
      prenom: 'Tojo',
      email: 'tojo.ramanantsoa@email.mg',
      telephone: '+261 34 45 678 90',
      filiere: 'Génie Informatique',
      promotion: '2026',
      niveau: 'L3',
      statut: 'Actif',
      stage: 'Supervision réseau',
      entreprise: 'JIRAMA'
    },
    {
      id: 5,
      matricule: 'ETU005',
      nom: 'Rasamimanana',
      prenom: 'Lalao',
      email: 'lalao.rasamimanana@email.mg',
      telephone: '+261 34 56 789 01',
      filiere: 'Management',
      promotion: '2025',
      niveau: 'M1',
      statut: 'Diplômé',
      stage: 'Marketing',
      entreprise: 'Orange Madagascar'
    },
    {
      id: 6,
      matricule: 'ETU006',
      nom: 'Raharison',
      prenom: 'Noro',
      email: 'noro.raharison@email.mg',
      telephone: '+261 34 67 890 12',
      filiere: 'Génie Informatique',
      promotion: '2025',
      niveau: 'M1',
      statut: 'Diplômé',
      stage: 'Système d\'information',
      entreprise: 'CNAPS'
    }
  ]);

  // ===== STATISTIQUES =====
  const stats = {
    total: etudiants.length,
    actifs: etudiants.filter(e => e.statut === 'Actif').length,
    diplomes: etudiants.filter(e => e.statut === 'Diplômé').length,
    enStage: etudiants.filter(e => e.stage && e.statut === 'Actif').length
  };

  // ===== FILTRES =====
  const filteredEtudiants = etudiants.filter(e => {
    const matchSearch = e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFiliere = filterFiliere === 'Tous' || e.filiere === filterFiliere;
    const matchPromotion = filterPromotion === 'Tous' || e.promotion === filterPromotion;
    return matchSearch && matchFiliere && matchPromotion;
  });

  // ===== PAGINATION =====
  const totalPages = Math.ceil(filteredEtudiants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEtudiants = filteredEtudiants.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // ===== OPTIONS =====
  const filiereOptions = ['Tous', 'Génie Informatique', 'Management', 'Relations publiques & Multimédia'];
  const promotionOptions = ['Tous', '2024', '2025', '2026'];
  const niveauOptions = ['L1', 'L2', 'L3', 'M1', 'M2'];
  const statutOptions = ['Actif', 'Diplômé'];

  // ===== BADGES =====
  const getStatusBadge = (statut) => {
    return statut === 'Actif' ? 'badge-actif' : 'badge-diplome';
  };

  // ===== ACTIONS CRUD =====
  const resetForm = () => {
    setFormData({
      matricule: '',
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      filiere: '',
      promotion: '',
      niveau: '',
      statut: 'Actif'
    });
  };

  const handleAdd = () => {
    const newEtudiant = {
      id: etudiants.length + 1,
      ...formData,
      stage: '—',
      entreprise: '—'
    };
    setEtudiants([...etudiants, newEtudiant]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = () => {
    setEtudiants(etudiants.map(e => 
      e.id === selectedEtudiant.id ? { ...e, ...formData } : e
    ));
    setShowEditModal(false);
    resetForm();
  };

  const handleDelete = () => {
    setEtudiants(etudiants.filter(e => e.id !== selectedEtudiant.id));
    setShowDeleteModal(false);
    setSelectedEtudiant(null);
  };

  const openEditModal = (etudiant) => {
    setSelectedEtudiant(etudiant);
    setFormData(etudiant);
    setShowEditModal(true);
  };

  const openDeleteModal = (etudiant) => {
    setSelectedEtudiant(etudiant);
    setShowDeleteModal(true);
  };

  const openDetailModal = (etudiant) => {
    setSelectedEtudiant(etudiant);
    setShowDetailModal(true);
  };

  return (
    <div className="admin-etudiants-page">
      {/* ===== HEADER ===== */}
      <div className="admin-etudiants-header">
        <div>
          <h1><FaUserGraduate /> Gestion des étudiants</h1>
          <p className="admin-etudiants-subtitle">Gérez les étudiants et leurs informations</p>
        </div>
        <button className="admin-etudiants-btn-primary" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Ajouter un étudiant
        </button>
      </div>

      {/* ===== STATISTIQUES ===== */}
      <div className="admin-etudiants-stats">
        <div className="admin-etudiants-stat-card">
          <div className="admin-etudiants-stat-icon-wrapper" style={{ background: '#E1ECFE', color: '#6BA9E6' }}>
            <FaUserGraduate />
          </div>
          <div className="admin-etudiants-stat-content">
            <span className="admin-etudiants-stat-value">{stats.total}</span>
            <span className="admin-etudiants-stat-label">Total étudiants</span>
          </div>
        </div>
        <div className="admin-etudiants-stat-card">
          <div className="admin-etudiants-stat-icon-wrapper" style={{ background: '#D1FAE5', color: '#22C55E' }}>
            <FaCheck />
          </div>
          <div className="admin-etudiants-stat-content">
            <span className="admin-etudiants-stat-value" style={{ color: '#22C55E' }}>{stats.actifs}</span>
            <span className="admin-etudiants-stat-label">Actifs</span>
          </div>
        </div>
        <div className="admin-etudiants-stat-card">
          <div className="admin-etudiants-stat-icon-wrapper" style={{ background: '#DBEAFE', color: '#6BA9E6' }}>
            <FaGraduationCap />
          </div>
          <div className="admin-etudiants-stat-content">
            <span className="admin-etudiants-stat-value" style={{ color: '#6BA9E6' }}>{stats.diplomes}</span>
            <span className="admin-etudiants-stat-label">Diplômés</span>
          </div>
        </div>
        <div className="admin-etudiants-stat-card">
          <div className="admin-etudiants-stat-icon-wrapper" style={{ background: '#FEF3C7', color: '#F59E0B' }}>
            <FaBuilding />
          </div>
          <div className="admin-etudiants-stat-content">
            <span className="admin-etudiants-stat-value" style={{ color: '#F59E0B' }}>{stats.enStage}</span>
            <span className="admin-etudiants-stat-label">En stage</span>
          </div>
        </div>
      </div>

      {/* ===== FILTRES ===== */}
      <div className="admin-etudiants-filters">
        <div className="admin-etudiants-filter-group">
          <label><FaFilter /> Filtres</label>
          <select value={filterFiliere} onChange={(e) => setFilterFiliere(e.target.value)} className="admin-etudiants-filter-select">
            {filiereOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <select value={filterPromotion} onChange={(e) => setFilterPromotion(e.target.value)} className="admin-etudiants-filter-select">
            {promotionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="admin-etudiants-filter-group admin-etudiants-search-group">
          <FaSearch className="admin-etudiants-search-icon" />
          <input
            type="text"
            placeholder="Rechercher un étudiant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-etudiants-search-input"
          />
        </div>
      </div>

      {/* ===== TABLEAU ===== */}
      <div className="admin-etudiants-table-container">
        <table className="admin-etudiants-table">
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Étudiant</th>
              <th>Filière</th>
              <th>Promotion</th>
              <th>Niveau</th>
              <th>Statut</th>
              <th>Stage / Entreprise</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEtudiants.length === 0 ? (
              <tr>
                <td colSpan="8" className="admin-etudiants-empty">Aucun étudiant trouvé</td>
              </tr>
            ) : (
              paginatedEtudiants.map((etudiant) => (
                <tr key={etudiant.id}>
                  <td><span className="admin-etudiants-matricule">{etudiant.matricule}</span></td>
                  <td>
                    <div className="admin-etudiants-user">
                      <span className="admin-etudiants-avatar">{etudiant.prenom[0]}{etudiant.nom[0]}</span>
                      <div>
                        <div className="admin-etudiants-name">{etudiant.prenom} {etudiant.nom}</div>
                        <div className="admin-etudiants-email">{etudiant.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{etudiant.filiere}</td>
                  <td><span className="admin-etudiants-promotion-badge">{etudiant.promotion}</span></td>
                  <td>{etudiant.niveau}</td>
                  <td><span className={getStatusBadge(etudiant.statut)}>{etudiant.statut}</span></td>
                  <td>
                    <div className="admin-etudiants-stage-info">
                      <span className="admin-etudiants-stage-name">{etudiant.stage || '—'}</span>
                      <span className="admin-etudiants-entreprise-name">{etudiant.entreprise || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="admin-etudiants-actions">
                      <button className="admin-etudiants-btn-icon" onClick={() => openDetailModal(etudiant)} title="Voir">
                        <FaEye />
                      </button>
                      <button className="admin-etudiants-btn-icon" onClick={() => openEditModal(etudiant)} title="Modifier">
                        <FaEdit />
                      </button>
                      <button className="admin-etudiants-btn-icon danger" onClick={() => openDeleteModal(etudiant)} title="Supprimer">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ===== PAGINATION ===== */}
        {totalPages > 1 && (
          <div className="admin-etudiants-pagination">
            <button className="admin-etudiants-pagination-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
              <FaChevronLeft />
            </button>
            <span className="admin-etudiants-pagination-info">Page {currentPage} sur {totalPages}</span>
            <button className="admin-etudiants-pagination-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* ===== MODALES (COMPOSANTS EXTERNES) ===== */}
      {showAddModal && (
        <EtudiantForm
          title="Ajouter un étudiant"
          submitLabel="Ajouter"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAdd}
          onCancel={() => { setShowAddModal(false); resetForm(); }}
          filiereOptions={filiereOptions}
          promotionOptions={promotionOptions}
          niveauOptions={niveauOptions}
          statutOptions={statutOptions}
        />
      )}

      {showEditModal && (
        <EtudiantForm
          title="Modifier l'étudiant"
          submitLabel="Modifier"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onCancel={() => { setShowEditModal(false); resetForm(); }}
          filiereOptions={filiereOptions}
          promotionOptions={promotionOptions}
          niveauOptions={niveauOptions}
          statutOptions={statutOptions}
        />
      )}

      {showDeleteModal && (
        <EtudiantDelete
          etudiant={selectedEtudiant}
          onConfirm={handleDelete}
          onCancel={() => { setShowDeleteModal(false); setSelectedEtudiant(null); }}
        />
      )}

      {showDetailModal && (
        <EtudiantDetail
          etudiant={selectedEtudiant}
          onClose={() => { setShowDetailModal(false); setSelectedEtudiant(null); }}
        />
      )}
    </div>
  );
}

export default AdminEtudiants;