import { useState, useEffect } from 'react';
import { 
  FaSearch, FaFilter, FaEye,
  FaList,
  FaChevronLeft, FaChevronRight, FaCheck, FaTimes, FaClock
} from 'react-icons/fa';

import StageDetail from './components/StageDetail';
import internshipsApi from '../../api/internshipsApi';
import evaluationsApi from '../../api/evaluationsApi';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';
import StatsCards from '../../components/Common/StatsCards';
import { mapInternshipList, computeChecklistProgress } from '../../utils/internshipMapping';

function AdminStages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('Tous');
  const [filterDomaine, setFilterDomaine] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [stages, setStages] = useState([]);
  const itemsPerPage = 5;

  const loadStages = async () => {
    try {
      const res = await internshipsApi.getAll({ limit: 100 });
      // internshipsApi renvoie { data, meta } : lire `items` ici vidait
      // silencieusement le tableau des stages.
      const list = Array.isArray(res)
        ? res
        : res?.data || res?.items || [];

      let evaluatedIds = new Set();
      try {
        const first = await evaluationsApi.getAllAdmin({ limit: 100, page: 1 });
        const firstList = Array.isArray(first) ? first : first?.data || [];
        const totalPages = first?.meta?.totalPages || 1;
        let evalsList = [...firstList];
        for (let page = 2; page <= totalPages; page += 1) {
          const res = await evaluationsApi.getAllAdmin({ limit: 100, page });
          const pageList = Array.isArray(res) ? res : res?.data || [];
          evalsList = evalsList.concat(pageList);
        }
        evaluatedIds = new Set(evalsList.map(e => e.stageId).filter(Boolean));
      } catch {
        evaluatedIds = new Set();
      }

      const mapped = mapInternshipList(list).map(item => ({
        ...item,
        progression: computeChecklistProgress(item, evaluatedIds.has(item.id)),
        dateDebut: item.dateDebut ? new Date(item.dateDebut).toLocaleDateString('fr-FR') : '',
        dateFin: item.dateFin ? new Date(item.dateFin).toLocaleDateString('fr-FR') : '',
      }));
      setStages(mapped);
    } catch (err) {
      console.error('Erreur récurrente stages:', err);
    }
  };

  useEffect(() => {
    const run = async () => {
      await loadStages();
    };
    run();
  }, []);

  const stats = {
    total: stages.length,
    enCours: stages.filter(s => s.statut === 'En cours').length,
    termine: stages.filter(s => s.statut === 'Terminé').length,
    enAttente: stages.filter(s => s.statut === 'En attente de validation').length
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
    { value: 'Tous', label: 'Tous les statuts' },
    { value: 'En attente de validation', label: 'En attente' },
    { value: 'En cours', label: 'En cours' },
    { value: 'Terminé', label: 'Terminé' }
  ];
  const domaineOptions = [
    { value: 'Tous', label: 'Tous les domaines' },
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
      'Terminé': 'badge-termine',
      'En attente de validation': 'badge-en-attente'
    };
    return classes[statut] || 'badge-en-cours';
  };

  const openDetailModal = (stage) => {
    setSelectedStage(stage);
    setShowDetailModal(true);
  };

  return (
    <div className="admin-stages-page">
      <div className="admin-stages-header">
        <div>
          <h1>Liste des stages</h1>
          <p className="admin-stages-subtitle">Gérez les stages des étudiants</p>
        </div>
      </div>

      <StatsCards
        items={[
          {
            icon: <FaList />,
            value: stats.total,
            label: 'Total stages',
            iconStyle: { background: '#E1ECFE', color: '#6BA9E6' },
          },
          {
            icon: <FaClock />,
            value: stats.enCours,
            label: 'En cours',
            iconStyle: { background: '#D1FAE5', color: '#22C55E' },
            valueStyle: { color: '#22C55E' },
          },
          {
            icon: <FaCheck />,
            value: stats.termine,
            label: 'Terminés',
            iconStyle: { background: '#DBEAFE', color: '#6BA9E6' },
            valueStyle: { color: '#6BA9E6' },
          },
          {
            icon: <FaTimes />,
            value: stats.enAttente,
            label: 'En attente',
            iconStyle: { background: '#FEF3C7', color: '#F59E0B' },
            valueStyle: { color: '#F59E0B' },
          },
        ]}
      />

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
                      <button className="admin-stages-btn-view" onClick={() => openDetailModal(stage)} title="Voir"><FaEye /> Voir</button>
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