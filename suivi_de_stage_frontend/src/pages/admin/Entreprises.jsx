// src/pages/admin/Entreprises.jsx
import { useState } from 'react';
import { 
  FaSearch, FaFilter, FaPlus, FaEye, FaEdit, FaTrash,
  FaBuilding, FaUsers,FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

import EntrepriseForm from './components/EntrepriseForm';
import EntrepriseDetail from './components/EntrepriseDetail';
import EntrepriseDelete from './components/EntrepriseDelete';

function AdminEntreprises() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomaine, setFilterDomaine] = useState('Tous');
  const [filterVille, setFilterVille] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEntreprise, setSelectedEntreprise] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    domaine: '',
    adresse: '',
    ville: '',
    telephone: '',
    email: '',
    latitude: '',
    longitude: ''
  });
  const itemsPerPage = 5;

  const [entreprises, setEntreprises] = useState([
    {
      id: 1,
      nom: 'ABC Informatique',
      domaine: 'Technologies',
      adresse: 'Lot III A 15 bis, Andrainjato',
      ville: 'Antananarivo',
      telephone: '+261 34 11 111 11',
      email: 'contact@abc-informatique.mg',
      stagiaires: 3,
      latitude: '-18.8792',
      longitude: '47.5079'
    },
    {
      id: 2,
      nom: 'XYZ Tech',
      domaine: 'Technologies',
      adresse: 'Immeuble Tana Waterfront',
      ville: 'Antananarivo',
      telephone: '+261 34 22 222 22',
      email: 'contact@xyztech.mg',
      stagiaires: 2,
      latitude: '-18.9050',
      longitude: '47.5350'
    },
    {
      id: 3,
      nom: 'BNI Madagascar',
      domaine: 'Banque',
      adresse: 'Avenue de l\'Indépendance',
      ville: 'Antananarivo',
      telephone: '+261 34 33 333 33',
      email: 'contact@bni.mg',
      stagiaires: 1,
      latitude: '-18.9000',
      longitude: '47.5200'
    },
    {
      id: 4,
      nom: 'Orange Madagascar',
      domaine: 'Télécom',
      adresse: 'Lot 66 A Andranomena',
      ville: 'Antananarivo',
      telephone: '+261 34 44 444 44',
      email: 'contact@orange.mg',
      stagiaires: 2,
      latitude: '-18.8850',
      longitude: '47.5400'
    },
    {
      id: 5,
      nom: 'JIRAMA',
      domaine: 'Énergie',
      adresse: 'Rue Ravoninahitriniarivo',
      ville: 'Antananarivo',
      telephone: '+261 34 55 555 55',
      email: 'contact@jirama.mg',
      stagiaires: 1,
      latitude: '-18.9100',
      longitude: '47.5300'
    },
    {
      id: 6,
      nom: 'CNAPS',
      domaine: 'Services',
      adresse: 'Ambohijatovo',
      ville: 'Antananarivo',
      telephone: '+261 34 66 666 66',
      email: 'contact@cnaps.mg',
      stagiaires: 1,
      latitude: '-18.8950',
      longitude: '47.5250'
    }
  ]);

  const stats = {
    total: entreprises.length,
    totalStagiaires: entreprises.reduce((acc, e) => acc + e.stagiaires, 0)
  };

  const filteredEntreprises = entreprises.filter(e => {
    const matchSearch = e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.ville.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDomaine = filterDomaine === 'Tous' || e.domaine === filterDomaine;
    const matchVille = filterVille === 'Tous' || e.ville === filterVille;
    return matchSearch && matchDomaine && matchVille;
  });

  const totalPages = Math.ceil(filteredEntreprises.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntreprises = filteredEntreprises.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const domaineOptions = ['Tous', 'Technologies', 'Banque', 'Télécom', 'Énergie', 'Services'];
  const villeOptions = ['Tous', 'Antananarivo'];

  const resetForm = () => {
    setFormData({
      nom: '',
      domaine: '',
      adresse: '',
      ville: '',
      telephone: '',
      email: '',
      latitude: '',
      longitude: ''
    });
  };

  const handleAdd = () => {
    const newEntreprise = {
      id: entreprises.length + 1,
      ...formData,
      stagiaires: 0
    };
    setEntreprises([...entreprises, newEntreprise]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = () => {
    setEntreprises(entreprises.map(e => 
      e.id === selectedEntreprise.id ? { ...e, ...formData } : e
    ));
    setShowEditModal(false);
    resetForm();
  };

  const handleDelete = () => {
    setEntreprises(entreprises.filter(e => e.id !== selectedEntreprise.id));
    setShowDeleteModal(false);
    setSelectedEntreprise(null);
  };

  const openEditModal = (entreprise) => {
    setSelectedEntreprise(entreprise);
    setFormData(entreprise);
    setShowEditModal(true);
  };

  const openDeleteModal = (entreprise) => {
    setSelectedEntreprise(entreprise);
    setShowDeleteModal(true);
  };

  const openDetailModal = (entreprise) => {
    setSelectedEntreprise(entreprise);
    setShowDetailModal(true);
  };

  return (
    <div className="admin-entreprises-page">
      <div className="admin-entreprises-header">
        <div>
          <h1><FaBuilding /> Gestion des entreprises</h1>
          <p className="admin-entreprises-subtitle">Gérez les entreprises partenaires</p>
        </div>
        <button className="admin-entreprises-btn-primary" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Ajouter une entreprise
        </button>
      </div>

      <div className="admin-entreprises-stats">
        <div className="admin-entreprises-stat-card">
          <div className="admin-entreprises-stat-icon-wrapper" style={{ background: '#E1ECFE', color: '#6BA9E6' }}>
            <FaBuilding />
          </div>
          <div className="admin-entreprises-stat-content">
            <span className="admin-entreprises-stat-value">{stats.total}</span>
            <span className="admin-entreprises-stat-label">Total entreprises</span>
          </div>
        </div>
        <div className="admin-entreprises-stat-card">
          <div className="admin-entreprises-stat-icon-wrapper" style={{ background: '#D1FAE5', color: '#22C55E' }}>
            <FaUsers />
          </div>
          <div className="admin-entreprises-stat-content">
            <span className="admin-entreprises-stat-value" style={{ color: '#22C55E' }}>{stats.totalStagiaires}</span>
            <span className="admin-entreprises-stat-label">Stagiaires accueillis</span>
          </div>
        </div>
      </div>

      <div className="admin-entreprises-filters">
        <div className="admin-entreprises-filter-group">
          <label><FaFilter /> Filtres</label>
          <select value={filterDomaine} onChange={(e) => setFilterDomaine(e.target.value)} className="admin-entreprises-filter-select">
            {domaineOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <select value={filterVille} onChange={(e) => setFilterVille(e.target.value)} className="admin-entreprises-filter-select">
            {villeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="admin-entreprises-filter-group admin-entreprises-search-group">
          <FaSearch className="admin-entreprises-search-icon" />
          <input
            type="text"
            placeholder="Rechercher une entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-entreprises-search-input"
          />
        </div>
      </div>

      <div className="admin-entreprises-table-container">
        <table className="admin-entreprises-table">
          <thead>
            <tr>
              <th>Entreprise</th>
              <th>Domaine</th>
              <th>Ville</th>
              <th>Téléphone</th>
              <th>Email</th>
              <th>Stagiaires</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEntreprises.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-entreprises-empty">Aucune entreprise trouvée</td>
              </tr>
            ) : (
              paginatedEntreprises.map((entreprise) => (
                <tr key={entreprise.id}>
                  <td>
                    <div className="admin-entreprises-nom">
                      <span className="admin-entreprises-nom-text">{entreprise.nom}</span>
                    </div>
                  </td>
                  <td><span className="admin-entreprises-domaine-badge">{entreprise.domaine}</span></td>
                  <td> {entreprise.ville}</td>
                  <td> {entreprise.telephone}</td>
                  <td> {entreprise.email}</td>
                  <td>
                    <span className="admin-entreprises-stagiaires-badge">
                      <FaUsers /> {entreprise.stagiaires}
                    </span>
                  </td>
                  <td>
                    <div className="admin-entreprises-actions">
                      <button className="admin-entreprises-btn-icon" onClick={() => openDetailModal(entreprise)} title="Voir"><FaEye /></button>
                      <button className="admin-entreprises-btn-icon" onClick={() => openEditModal(entreprise)} title="Modifier"><FaEdit /></button>
                      <button className="admin-entreprises-btn-icon danger" onClick={() => openDeleteModal(entreprise)} title="Supprimer"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="admin-entreprises-pagination">
            <button className="admin-entreprises-pagination-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
              <FaChevronLeft />
            </button>
            <span className="admin-entreprises-pagination-info">Page {currentPage} sur {totalPages}</span>
            <button className="admin-entreprises-pagination-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <EntrepriseForm
          title="Ajouter une entreprise"
          submitLabel="Ajouter"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAdd}
          onCancel={() => { setShowAddModal(false); resetForm(); }}
          domaineOptions={domaineOptions}
          villeOptions={villeOptions}
        />
      )}

      {showEditModal && (
        <EntrepriseForm
          title="Modifier l'entreprise"
          submitLabel="Modifier"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onCancel={() => { setShowEditModal(false); resetForm(); }}
          domaineOptions={domaineOptions}
          villeOptions={villeOptions}
        />
      )}

      {showDeleteModal && (
        <EntrepriseDelete
          entreprise={selectedEntreprise}
          onConfirm={handleDelete}
          onCancel={() => { setShowDeleteModal(false); setSelectedEntreprise(null); }}
        />
      )}

      {showDetailModal && (
        <EntrepriseDetail
          entreprise={selectedEntreprise}
          onClose={() => { setShowDetailModal(false); setSelectedEntreprise(null); }}
        />
      )}
    </div>
  );
}

export default AdminEntreprises;