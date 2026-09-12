import { useState, useEffect } from 'react';
import { 
  FaSearch, FaFilter, FaEye, FaEdit, FaTrash,
  FaList,
  FaChevronLeft, FaChevronRight, FaCheck, FaTimes, FaClock
} from 'react-icons/fa';

import StageForm from './components/StageForm';
import StageDetail from './components/StageDetail';
import StageDelete from './components/StageDelete';
import internshipsApi from '../../api/internshipsApi';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';

function AdminStages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('Tous');
  const [filterDomaine, setFilterDomaine] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState([]);
  const [formData, setFormData] = useState({
    titre: '',
    etudiant: '',
    entreprise: '',
    encadreur: '',
    domaine: '',
    dateDebut: '',
    dateFin: '',
    statut: 'En cours',
    progression: 0
  });
  const itemsPerPage = 5;

  const loadStages = async () => {
    try {
      setLoading(true);
      const res = await internshipsApi.getAll();
      const list = Array.isArray(res) ? res : res?.items || [];

      const mapped = list.map(item => ({
        id: item.id,
        titre: item.titre || 'Stage sans titre',
        etudiant: item.etudiant ? `${item.etudiant.prenom} ${item.etudiant.nom}` : (item.etudiantName || 'Étudiant'),
        entreprise: item.entreprise ? item.entreprise.nom : (item.companyName || 'Entreprise'),
        encadreur: item.encadreur ? `${item.encadreur.prenom} ${item.encadreur.nom}` : (item.supervisorName || 'Encadreur'),
        domaine: item.domaine || item.entreprise?.secteur || 'Développement Web',
        dateDebut: item.dateDebut ? new Date(item.dateDebut).toLocaleDateString('fr-FR') : '03/08/2026',
        dateFin: item.dateFin ? new Date(item.dateFin).toLocaleDateString('fr-FR') : '03/10/2026',
        statut: item.statut === 'en_cours' ? 'En cours' : item.statut === 'a_venir' ? 'À venir' : 'Terminé',
        progression: item.progression ?? (item.statut === 'termine' ? 100 : item.statut === 'en_cours' ? 45 : 0)
      }));
      setStages(mapped);
    } catch (err) {
      console.error('Erreur récurrente stages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStages();
  }, []);

  const stats = {
    total: stages.length,
    enCours: stages.filter(s => s.statut === 'En cours').length,
    termine: stages.filter(s => s.statut === 'Terminé').length,
    aVenir: stages.filter(s => s.statut === 'À venir').length
  };

  const filteredStages = stages.filter(s => {
    const matchSearch = (s.titre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (s.etudiant || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (s.entreprise || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = filterStatut === 'Tous' || s.statut === filterStatut;
    const matchDomaine = filterDomaine === 'Tous' || s.domaine === filterDomaine;
    return matchSearch && matchStatut && matchDomaine;
  });

  const totalPages = Math.ceil(filteredStages.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStages = filteredStages.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const statutOptions = [
    { value: 'Tous', label: 'Tous' },
    { value: 'À venir', label: 'À venir' },
    { value: 'En cours', label: 'En cours' },
    { value: 'Terminé', label: 'Terminé' }
  ];
  const domaineOptions = [
    { value: 'Tous', label: 'Tous' },
    { value: 'Développement Web', label: 'Développement Web' },
    { value: 'Développement Mobile', label: 'Développement Mobile' },
    { value: 'Analyse de Données', label: 'Analyse de Données' },
    { value: 'Réseaux', label: 'Réseaux' },
    { value: "Systèmes d'Information", label: "Systèmes d'Information" }
  ];

  const getStatusBadge = (statut) => {
    const classes = {
      'À venir': 'badge-a-venir',
      'En cours': 'badge-en-cours',
      'Terminé': 'badge-termine'
    };
    return classes[statut] || 'badge-en-cours';
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      etudiant: '',
      entreprise: '',
      encadreur: '',
      domaine: '',
      dateDebut: '',
      dateFin: '',
      statut: 'En cours',
      progression: 0
    });
  };

  const handleEdit = async () => {
    try {
      if (selectedStage?.id) {
        await internshipsApi.update(selectedStage.id, {
          titre: formData.titre,
          statut: formData.statut === 'En cours' ? 'en_cours' : formData.statut === 'À venir' ? 'a_venir' : 'termine'
        });
        await loadStages();
      }
    } catch {
      setStages(stages.map(s => s.id === selectedStage?.id ? { ...s, ...formData } : s));
    }
    setShowEditModal(false);
    resetForm();
  };

  const handleDelete = async () => {
    try {
      if (selectedStage?.id) {
        await internshipsApi.delete(selectedStage.id);
        await loadStages();
      }
    } catch {
      setStages(stages.filter(s => s.id !== selectedStage?.id));
    }
    setShowDeleteModal(false);
    setSelectedStage(null);
  };

  const openEditModal = (stage) => {
    setSelectedStage(stage);
    setFormData(stage);
    setShowEditModal(true);
  };

  const openDeleteModal = (stage) => {
    setSelectedStage(stage);
    setShowDeleteModal(true);
  };

  const openDetailModal = (stage) => {
    setSelectedStage(stage);
    setShowDetailModal(true);
  };

  return (
    <div className="admin-stages-page">
      <div className="admin-stages-header">
        <div>
          <h1>Gestion des stages</h1>
          <p className="admin-stages-subtitle">Gérez les stages des étudiants</p>
        </div>
      </div>

      <div className="admin-stages-stats">
        <div className="admin-stages-stat-card">
          <div className="admin-stages-stat-icon-wrapper" style={{ background: '#E1ECFE', color: '#6BA9E6' }}>
            <FaList />
          </div>
          <div className="admin-stages-stat-content">
            <span className="admin-stages-stat-value">{stats.total}</span>
            <span className="admin-stages-stat-label">Total stages</span>
          </div>
        </div>
        <div className="admin-stages-stat-card">
          <div className="admin-stages-stat-icon-wrapper" style={{ background: '#D1FAE5', color: '#22C55E' }}>
            <FaClock />
          </div>
          <div className="admin-stages-stat-content">
            <span className="admin-stages-stat-value" style={{ color: '#22C55E' }}>{stats.enCours}</span>
            <span className="admin-stages-stat-label">En cours</span>
          </div>
        </div>
        <div className="admin-stages-stat-card">
          <div className="admin-stages-stat-icon-wrapper" style={{ background: '#DBEAFE', color: '#6BA9E6' }}>
            <FaCheck />
          </div>
          <div className="admin-stages-stat-content">
            <span className="admin-stages-stat-value" style={{ color: '#6BA9E6' }}>{stats.termine}</span>
            <span className="admin-stages-stat-label">Terminés</span>
          </div>
        </div>
        <div className="admin-stages-stat-card">
          <div className="admin-stages-stat-icon-wrapper" style={{ background: '#FEF3C7', color: '#F59E0B' }}>
            <FaTimes />
          </div>
          <div className="admin-stages-stat-content">
            <span className="admin-stages-stat-value" style={{ color: '#F59E0B' }}>{stats.aVenir}</span>
            <span className="admin-stages-stat-label">À venir</span>
          </div>
        </div>
      </div>

      <div className="admin-stages-filters">
        <div className="admin-stages-filter-group">
          <label><FaFilter /> Filtres</label>
          <SelectPersonnalise
            value={filterStatut}
            onChange={setFilterStatut}
            options={statutOptions}
            className="admin-stages-filter-select"
          />
          <SelectPersonnalise
            value={filterDomaine}
            onChange={setFilterDomaine}
            options={domaineOptions}
            className="admin-stages-filter-select"
          />
        </div>
        <div className="admin-stages-filter-group admin-stages-search-group">
          <FaSearch className="admin-stages-search-icon" />
          <input
            type="text"
            placeholder="Rechercher un stage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-stages-search-input"
          />
        </div>
      </div>

      <div className="admin-stages-table-container">
        <table className="admin-stages-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Étudiant</th>
              <th>Entreprise</th>
              <th>Domaine</th>
              <th>Période</th>
              <th>Progression</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStages.length === 0 ? (
              <tr>
                <td colSpan="8" className="admin-stages-empty">Aucun stage trouvé</td>
              </tr>
            ) : (
              paginatedStages.map((stage) => (
                <tr key={stage.id}>
                  <td><span className="admin-stages-titre">{stage.titre}</span></td>
                  <td>
                    <div className="admin-stages-etudiant">
                      {stage.etudiant}
                    </div>
                  </td>
                  <td>
                    <div className="admin-stages-entreprise">
                      {stage.entreprise}
                    </div>
                  </td>
                  <td><span className="admin-stages-domaine-badge">{stage.domaine}</span></td>
                  <td>
                    <div className="admin-stages-period">
                      {stage.dateDebut} → {stage.dateFin}
                    </div>
                  </td>
                  <td>
                    <div className="admin-stages-progression">
                      <div className="admin-stages-progress-track">
                        <div className="admin-stages-progress-fill" style={{ width: `${stage.progression}%` }}></div>
                      </div>
                      <span className="admin-stages-progress-value">{stage.progression}%</span>
                    </div>
                  </td>
                  <td><span className={getStatusBadge(stage.statut)}>{stage.statut}</span></td>
                  <td>
                    <div className="admin-stages-actions">
                      <button className="admin-stages-btn-icon" onClick={() => openDetailModal(stage)} title="Voir"><FaEye /></button>
                      <button className="admin-stages-btn-icon" onClick={() => openEditModal(stage)} title="Modifier"><FaEdit /></button>
                      <button className="admin-stages-btn-icon danger" onClick={() => openDeleteModal(stage)} title="Supprimer"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="admin-stages-pagination">
            <button className="admin-stages-pagination-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
              <FaChevronLeft />
            </button>
            <span className="admin-stages-pagination-info">Page {currentPage} sur {totalPages}</span>
            <button className="admin-stages-pagination-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>

      {showEditModal && (
        <StageForm
          title="Modifier le stage"
          submitLabel="Modifier"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onCancel={() => { setShowEditModal(false); resetForm(); }}
          statutOptions={statutOptions}
          domaineOptions={domaineOptions}
        />
      )}

      {showDeleteModal && (
        <StageDelete
          stage={selectedStage}
          onConfirm={handleDelete}
          onCancel={() => { setShowDeleteModal(false); setSelectedStage(null); }}
        />
      )}

      {showDetailModal && (
        <StageDetail
          stage={selectedStage}
          onClose={() => { setShowDetailModal(false); setSelectedStage(null); }}
        />
      )}
    </div>
  );
}

export default AdminStages;