import { useState, useEffect } from 'react';
import { 
  FaSearch, FaFilter, FaPlus, FaEye, FaEdit, FaTrash,
  FaBuilding, FaUsers,FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

import EntrepriseForm from './components/EntrepriseForm';
import EntrepriseDetail from './components/EntrepriseDetail';
import EntrepriseDelete from './components/EntrepriseDelete';
import companiesApi from '../../api/companiesApi';

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
  const [loading, setLoading] = useState(true);
  const [entreprises, setEntreprises] = useState([]);
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

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const res = await companiesApi.getAll();
      const list = Array.isArray(res) ? res : res?.items || [];

      const mapped = list.map(item => ({
        id: item.id,
        nom: item.nom || 'Entreprise',
        domaine: item.secteur || item.domaine || 'Technologies',
        adresse: item.adresse || 'Madagascar',
        ville: item.ville || 'Antananarivo',
        telephone: item.telephone || '+261 34 00 000 00',
        email: item.email || 'contact@entreprise.mg',
        stagiaires: item.internships?.length || item.stagiaires || 0,
        latitude: item.latitude || '-18.8792',
        longitude: item.longitude || '47.5079'
      }));
      setEntreprises(mapped);
    } catch (err) {
      console.error('Erreur chargement entreprises:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const stats = {
    total: entreprises.length,
    totalStagiaires: entreprises.reduce((acc, e) => acc + (e.stagiaires || 0), 0)
  };

  const filteredEntreprises = entreprises.filter(e => {
    const matchSearch = (e.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (e.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (e.ville || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchDomaine = filterDomaine === 'Tous' || e.domaine === filterDomaine;
    const matchVille = filterVille === 'Tous' || e.ville === filterVille;
    return matchSearch && matchDomaine && matchVille;
  });

  const totalPages = Math.ceil(filteredEntreprises.length / itemsPerPage) || 1;
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

  const handleAdd = async () => {
    try {
      await companiesApi.create({
        nom: formData.nom,
        secteur: formData.domaine,
        adresse: formData.adresse,
        ville: formData.ville || 'Antananarivo',
        email: formData.email,
        telephone: formData.telephone
      });
      await loadCompanies();
    } catch {
      const newEntreprise = { id: entreprises.length + 1, ...formData, stagiaires: 0 };
      setEntreprises([...entreprises, newEntreprise]);
    }
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = async () => {
    try {
      if (selectedEntreprise?.id) {
        await companiesApi.update(selectedEntreprise.id, {
          nom: formData.nom,
          secteur: formData.domaine,
          adresse: formData.adresse,
          ville: formData.ville,
          email: formData.email,
          telephone: formData.telephone
        });
        await loadCompanies();
      }
    } catch {
      setEntreprises(entreprises.map(e => e.id === selectedEntreprise?.id ? { ...e, ...formData } : e));
    }
    setShowEditModal(false);
    resetForm();
  };

  const handleDelete = async () => {
    try {
      if (selectedEntreprise?.id) {
        await companiesApi.delete(selectedEntreprise.id);
        await loadCompanies();
      }
    } catch {
      setEntreprises(entreprises.filter(e => e.id !== selectedEntreprise?.id));
    }
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