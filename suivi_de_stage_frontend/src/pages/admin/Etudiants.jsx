import { useState, useEffect } from 'react';
import { 
  FaSearch, FaFilter, FaEye, FaEdit, FaTrash,
  FaUserGraduate, FaGraduationCap, FaBuilding, FaCheck,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

import EtudiantForm from './components/EtudiantForm';
import EtudiantDetail from './components/EtudiantDetail';
import EtudiantDelete from './components/EtudiantDelete';
import studentsApi from '../../api/studentsApi';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';

function AdminEtudiants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFiliere, setFilterFiliere] = useState('Tous');
  const [filterPromotion, setFilterPromotion] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [etudiants, setEtudiants] = useState([]);
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

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await studentsApi.getAll();
      const list = Array.isArray(res) ? res : res?.items || [];

      const mapped = list.map(item => ({
        id: item.id,
        matricule: item.matricule || 'ETU-00',
        nom: item.user?.nom || item.nom || 'Nom',
        prenom: item.user?.prenom || item.prenom || 'Prénom',
        email: item.user?.email || item.email || 'email@emit.mg',
        telephone: item.user?.telephone || item.telephone || '+261 34 00 000 00',
        filiere: item.parcours || item.filiere || 'Génie Informatique',
        promotion: item.promotion || '2026',
        niveau: item.niveau || 'L3',
        statut: item.statutEmploi === 'en_emploi' ? 'Diplômé' : 'Actif',
        stage: item.internships?.[0]?.titre || '—',
        entreprise: item.internships?.[0]?.entreprise?.nom || '—'
      }));
      setEtudiants(mapped);
    } catch (err) {
      console.error('Erreur chargement étudiants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const stats = {
    total: etudiants.length,
    actifs: etudiants.filter(e => e.statut === 'Actif').length,
    diplomes: etudiants.filter(e => e.statut === 'Diplômé').length,
    enStage: etudiants.filter(e => e.stage && e.stage !== '—').length
  };

  const filteredEtudiants = etudiants.filter(e => {
    const matchSearch = (e.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (e.prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (e.matricule || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (e.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchFiliere = filterFiliere === 'Tous' || e.filiere === filterFiliere;
    const matchPromotion = filterPromotion === 'Tous' || e.promotion === filterPromotion;
    return matchSearch && matchFiliere && matchPromotion;
  });

  const totalPages = Math.ceil(filteredEtudiants.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEtudiants = filteredEtudiants.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const filiereOptions = [
    { value: 'Tous', label: 'Tous' },
    { value: 'Génie Informatique', label: 'Génie Informatique' },
    { value: 'Management', label: 'Management' },
    { value: 'Relations publiques & Multimédia', label: 'Relations publiques & Multimédia' }
  ];
  const promotionOptions = [
    { value: 'Tous', label: 'Tous' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' }
  ];
  const niveauOptions = [{ value: 'L1', label: 'L1' }, { value: 'L2', label: 'L2' }, { value: 'L3', label: 'L3' }, { value: 'M1', label: 'M1' }, { value: 'M2', label: 'M2' }];
  const statutOptions = [{ value: 'Actif', label: 'Actif' }, { value: 'Diplômé', label: 'Diplômé' }];

  const getStatusBadge = (statut) => {
    return statut === 'Actif' ? 'badge-actif' : 'badge-diplome';
  };

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

  const handleEdit = async () => {
    try {
      if (selectedEtudiant?.id) {
        await studentsApi.update(selectedEtudiant.id, {
          matricule: formData.matricule,
          niveau: formData.niveau
        });
        await loadStudents();
      }
    } catch {
      setEtudiants(etudiants.map(e => e.id === selectedEtudiant?.id ? { ...e, ...formData } : e));
    }
    setShowEditModal(false);
    resetForm();
  };

  const handleDelete = async () => {
    try {
      if (selectedEtudiant?.id) {
        await studentsApi.delete(selectedEtudiant.id);
        await loadStudents();
      }
    } catch {
      setEtudiants(etudiants.filter(e => e.id !== selectedEtudiant?.id));
    }
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
          <h1>Gestion des étudiants</h1>
          <p className="admin-etudiants-subtitle">Gérez les étudiants et leurs informations</p>
        </div>
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
          <SelectPersonnalise
            value={filterFiliere}
            onChange={setFilterFiliere}
            options={filiereOptions}
            className="admin-etudiants-filter-select"
          />
          <SelectPersonnalise
            value={filterPromotion}
            onChange={setFilterPromotion}
            options={promotionOptions}
            className="admin-etudiants-filter-select"
          />
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