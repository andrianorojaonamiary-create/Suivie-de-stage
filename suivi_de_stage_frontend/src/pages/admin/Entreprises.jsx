import { useState, useEffect } from 'react';
import { 
  FaSearch, FaFilter, FaEye,
  FaBuilding, FaUsers,FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

import EntrepriseDetail from './components/EntrepriseDetail';
import companiesApi from '../../api/companiesApi';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';

function AdminEntreprises() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomaine, setFilterDomaine] = useState('Tous');
  const [filterVille, setFilterVille] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEntreprise, setSelectedEntreprise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entreprises, setEntreprises] = useState([]);
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

  const domaineOptions = [
    { value: 'Tous', label: 'Tous les domaines' },
    { value: 'Technologies', label: 'Technologies' },
    { value: 'Banque', label: 'Banque' },
    { value: 'Télécom', label: 'Télécom' },
    { value: 'Énergie', label: 'Énergie' },
    { value: 'Services', label: 'Services' }
  ];
  const villeOptions = [
    { value: 'Tous', label: 'Toutes les villes' },
    { value: 'Antananarivo', label: 'Antananarivo' }
  ];

  const openDetailModal = (entreprise) => {
    setSelectedEntreprise(entreprise);
    setShowDetailModal(true);
  };

  return (
    <div className="admin-entreprises-page">
      <div className="admin-entreprises-header">
        <div>
          <h1>Gestion des entreprises</h1>
          <p className="admin-entreprises-subtitle">Gérez les entreprises partenaires</p>
        </div>
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
          <SelectPersonnalise
            value={filterDomaine}
            onChange={setFilterDomaine}
            options={domaineOptions}
            className="admin-entreprises-filter-select"
          />
          <SelectPersonnalise
            value={filterVille}
            onChange={setFilterVille}
            options={villeOptions}
            className="admin-entreprises-filter-select"
          />
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
                      <button className="admin-entreprises-btn-view" onClick={() => openDetailModal(entreprise)} title="Voir"><FaEye /> Voir</button>
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