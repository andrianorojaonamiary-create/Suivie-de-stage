// src/pages/admin/Encadreurs.jsx
import { useState } from 'react';
import { 
  FaSearch, FaFilter, FaPlus, FaEye, FaEdit, FaTrash,
  FaUserTie, FaUsers, FaChalkboardTeacher, FaBriefcase,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

import EncadreurForm from './components/EncadreurForm';
import EncadreurDetail from './components/EncadreurDetail';
import EncadreurDelete from './components/EncadreurDelete';

function AdminEncadreurs() {
  // ===== ÉTATS =====
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');
  const [filterFonction, setFilterFonction] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEncadreur, setSelectedEncadreur] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    type: 'professionnel',
    fonction: '',
    entreprise: ''
  });
  const itemsPerPage = 5;

  // ===== DONNÉES ENCADREURS =====
  const [encadreurs, setEncadreurs] = useState([
    {
      id: 1,
      nom: 'RABEMANANTSOA',
      prenom: 'Nivo',
      email: 'n.rabemanantsoa@emit.mg',
      telephone: '+261 34 11 111 11',
      type: 'professionnel',
      fonction: 'Responsable technique',
      entreprise: 'ABC Informatique',
      etudiants: ['Miora Rakoto', 'Tojo Ramanantsoa']
    },
    {
      id: 2,
      nom: 'RALAVA',
      prenom: 'Marie',
      email: 'm.ralava@emit.mg',
      telephone: '+261 34 22 222 22',
      type: 'professionnel',
      fonction: 'Responsable projet',
      entreprise: 'XYZ Tech',
      etudiants: ['Hery Rakotondrabe']
    },
    {
      id: 3,
      nom: 'RAKOTONDRASOA',
      prenom: 'Mamy',
      email: 'm.rakotondrasoa@emit.mg',
      telephone: '+261 34 33 333 33',
      type: 'pedagogique',
      fonction: 'Enseignant à l\'EMIT',
      entreprise: 'EMIT',
      etudiants: ['Fanja Andriantsoa']
    },
    {
      id: 4,
      nom: 'RANAIVO',
      prenom: 'Jean',
      email: 'j.ranaivo@emit.mg',
      telephone: '+261 34 44 444 44',
      type: 'professionnel',
      fonction: 'Responsable technique',
      entreprise: 'Orange Madagascar',
      etudiants: ['Lalao Rasamimanana']
    },
    {
      id: 5,
      nom: 'ANDRIANIVO',
      prenom: 'Hery',
      email: 'h.andrianivo@emit.mg',
      telephone: '+261 34 55 555 55',
      type: 'pedagogique',
      fonction: 'Professeur à l\'EMIT',
      entreprise: 'EMIT',
      etudiants: ['Noro Raharison']
    }
  ]);

  // ===== STATISTIQUES =====
  const stats = {
    total: encadreurs.length,
    professionnels: encadreurs.filter(e => e.type === 'professionnel').length,
    pedagogiques: encadreurs.filter(e => e.type === 'pedagogique').length,
    totalEtudiants: encadreurs.reduce((acc, e) => acc + e.etudiants.length, 0)
  };

  // ===== FILTRES =====
  const filteredEncadreurs = encadreurs.filter(e => {
    const matchSearch = e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.entreprise.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'Tous' || e.type === filterType;
    const matchFonction = filterFonction === 'Tous' || e.fonction === filterFonction;
    return matchSearch && matchType && matchFonction;
  });

  // ===== PAGINATION =====
  const totalPages = Math.ceil(filteredEncadreurs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEncadreurs = filteredEncadreurs.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // ===== OPTIONS =====
  const typeOptions = ['Tous', 'professionnel', 'pedagogique'];
  const fonctionOptions = ['Tous', 'Responsable technique', 'Responsable projet', 'Responsable RH', 'Enseignant à l\'EMIT', 'Professeur à l\'EMIT'];

  // ===== BADGES =====
  const getTypeBadge = (type) => {
    return type === 'professionnel' ? 'badge-professionnel' : 'badge-pedagogique';
  };

  const getTypeLabel = (type) => {
    return type === 'professionnel' ? 'Encadreur pro.' : 'Tuteur pédago.';
  };

  // ===== ACTIONS CRUD =====
  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      type: 'professionnel',
      fonction: '',
      entreprise: ''
    });
  };

  const handleAdd = () => {
    const newEncadreur = {
      id: encadreurs.length + 1,
      ...formData,
      etudiants: []
    };
    setEncadreurs([...encadreurs, newEncadreur]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = () => {
    setEncadreurs(encadreurs.map(e => 
      e.id === selectedEncadreur.id ? { ...e, ...formData } : e
    ));
    setShowEditModal(false);
    resetForm();
  };

  const handleDelete = () => {
    setEncadreurs(encadreurs.filter(e => e.id !== selectedEncadreur.id));
    setShowDeleteModal(false);
    setSelectedEncadreur(null);
  };

  const openEditModal = (encadreur) => {
    setSelectedEncadreur(encadreur);
    setFormData(encadreur);
    setShowEditModal(true);
  };

  const openDeleteModal = (encadreur) => {
    setSelectedEncadreur(encadreur);
    setShowDeleteModal(true);
  };

  const openDetailModal = (encadreur) => {
    setSelectedEncadreur(encadreur);
    setShowDetailModal(true);
  };

  return (
    <div className="admin-encadreurs-page">
      <div className="admin-encadreurs-header">
        <div>
          <h1><FaUserTie /> Gestion des encadreurs</h1>
          <p className="admin-encadreurs-subtitle">Gérez les encadreurs professionnels et les tuteurs pédagogiques</p>
        </div>
        <button className="admin-encadreurs-btn-primary" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Ajouter un encadreur
        </button>
      </div>

      {/* ===== STATISTIQUES ===== */}
      <div className="admin-encadreurs-stats">
        <div className="admin-encadreurs-stat-card">
          <div className="admin-encadreurs-stat-icon-wrapper" style={{ background: '#E1ECFE', color: '#6BA9E6' }}>
            <FaUserTie />
          </div>
          <div className="admin-encadreurs-stat-content">
            <span className="admin-encadreurs-stat-value">{stats.total}</span>
            <span className="admin-encadreurs-stat-label">Total encadreurs</span>
          </div>
        </div>
        <div className="admin-encadreurs-stat-card">
          <div className="admin-encadreurs-stat-icon-wrapper" style={{ background: '#D1FAE5', color: '#22C55E' }}>
            <FaBriefcase />
          </div>
          <div className="admin-encadreurs-stat-content">
            <span className="admin-encadreurs-stat-value" style={{ color: '#22C55E' }}>{stats.professionnels}</span>
            <span className="admin-encadreurs-stat-label">Encadreurs pro.</span>
          </div>
        </div>
        <div className="admin-encadreurs-stat-card">
          <div className="admin-encadreurs-stat-icon-wrapper" style={{ background: '#DBEAFE', color: '#6BA9E6' }}>
            <FaChalkboardTeacher />
          </div>
          <div className="admin-encadreurs-stat-content">
            <span className="admin-encadreurs-stat-value" style={{ color: '#6BA9E6' }}>{stats.pedagogiques}</span>
            <span className="admin-encadreurs-stat-label">Tuteurs pédago.</span>
          </div>
        </div>
        <div className="admin-encadreurs-stat-card">
          <div className="admin-encadreurs-stat-icon-wrapper" style={{ background: '#FEF3C7', color: '#F59E0B' }}>
            <FaUsers />
          </div>
          <div className="admin-encadreurs-stat-content">
            <span className="admin-encadreurs-stat-value" style={{ color: '#F59E0B' }}>{stats.totalEtudiants}</span>
            <span className="admin-encadreurs-stat-label">Étudiants encadrés</span>
          </div>
        </div>
      </div>

      {/* ===== FILTRES ===== */}
      <div className="admin-encadreurs-filters">
        <div className="admin-encadreurs-filter-group">
          <label><FaFilter /> Filtres</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="admin-encadreurs-filter-select">
            <option value="Tous">Tous les types</option>
            <option value="professionnel">Encadreur professionnel</option>
            <option value="pedagogique">Tuteur pédagogique</option>
          </select>
          <select value={filterFonction} onChange={(e) => setFilterFonction(e.target.value)} className="admin-encadreurs-filter-select">
            {fonctionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="admin-encadreurs-filter-group admin-encadreurs-search-group">
          <FaSearch className="admin-encadreurs-search-icon" />
          <input
            type="text"
            placeholder="Rechercher un encadreur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-encadreurs-search-input"
          />
        </div>
      </div>

      {/* ===== TABLEAU RÉDUIT ===== */}
      <div className="admin-encadreurs-table-container">
        <table className="admin-encadreurs-table">
          <thead>
            <tr>
              <th>Encadreur</th>
              <th>Type</th>
              <th>Contact</th>
              <th>Fonction</th>
              <th>Entreprise</th>
              <th>Étudiants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEncadreurs.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-encadreurs-empty">Aucun encadreur trouvé</td>
              </tr>
            ) : (
              paginatedEncadreurs.map((encadreur) => (
                <tr key={encadreur.id}>
                  <td>
                    <div className="admin-encadreurs-user">
                      <span className="admin-encadreurs-avatar">{encadreur.prenom[0]}{encadreur.nom[0]}</span>
                      <div>
                        <div className="admin-encadreurs-name">{encadreur.prenom} {encadreur.nom}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={getTypeBadge(encadreur.type)}>
                      {getTypeLabel(encadreur.type)}
                    </span>
                  </td>
                  <td>
                    <div className="admin-encadreurs-contact">
                      <div className="admin-encadreurs-email">{encadreur.email}</div>
                      <div className="admin-encadreurs-phone">{encadreur.telephone}</div>
                    </div>
                  </td>
                  <td><span className="admin-encadreurs-fonction-badge">{encadreur.fonction}</span></td>
                  <td>{encadreur.entreprise}</td>
                  <td>
                    <span className="admin-encadreurs-etudiants-badge">
                      <FaUsers /> {encadreur.etudiants.length}
                    </span>
                  </td>
                  <td>
                    <div className="admin-encadreurs-actions">
                      <button className="admin-encadreurs-btn-icon" onClick={() => openDetailModal(encadreur)} title="Voir"><FaEye /></button>
                      <button className="admin-encadreurs-btn-icon" onClick={() => openEditModal(encadreur)} title="Modifier"><FaEdit /></button>
                      <button className="admin-encadreurs-btn-icon danger" onClick={() => openDeleteModal(encadreur)} title="Supprimer"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="admin-encadreurs-pagination">
            <button className="admin-encadreurs-pagination-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
              <FaChevronLeft />
            </button>
            <span className="admin-encadreurs-pagination-info">Page {currentPage} sur {totalPages}</span>
            <button className="admin-encadreurs-pagination-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* ===== MODALES ===== */}
      {showAddModal && (
        <EncadreurForm
          title="Ajouter un encadreur"
          submitLabel="Ajouter"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAdd}
          onCancel={() => { setShowAddModal(false); resetForm(); }}
          typeOptions={typeOptions}
          fonctionOptions={fonctionOptions}
        />
      )}

      {showEditModal && (
        <EncadreurForm
          title="Modifier l'encadreur"
          submitLabel="Modifier"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onCancel={() => { setShowEditModal(false); resetForm(); }}
          typeOptions={typeOptions}
          fonctionOptions={fonctionOptions}
        />
      )}

      {showDeleteModal && (
        <EncadreurDelete
          encadreur={selectedEncadreur}
          onConfirm={handleDelete}
          onCancel={() => { setShowDeleteModal(false); setSelectedEncadreur(null); }}
        />
      )}

      {showDetailModal && (
        <EncadreurDetail
          encadreur={selectedEncadreur}
          onClose={() => { setShowDetailModal(false); setSelectedEncadreur(null); }}
        />
      )}
    </div>
  );
}

export default AdminEncadreurs;