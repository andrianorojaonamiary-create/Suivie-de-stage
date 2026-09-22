import { useState, useEffect } from 'react';
import { 
  FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaPlus,
  FaUserGraduate, FaGraduationCap, FaBuilding, FaCheck,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

import EtudiantDetail from './components/EtudiantDetail';
import EtudiantForm from './components/EtudiantForm';
import EtudiantDelete from './components/EtudiantDelete';
import studentsApi from '../../api/studentsApi';
import usersApi from '../../api/usersApi';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';

function AdminEtudiants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFiliere, setFilterFiliere] = useState('Tous');
  const [filterPromotion, setFilterPromotion] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);
  const [editEtudiant, setEditEtudiant] = useState(null);
  const [deleteEtudiant, setDeleteEtudiant] = useState(null);
  const [formData, setFormData] = useState({
    matricule: '', nom: '', prenom: '', email: '',
    telephone: '', formation: '', promotion: '', niveau: '', statutAcademique: 'ACTIF'
  });
  const [etudiants, setEtudiants] = useState([]);
  const itemsPerPage = 5;

  const loadStudents = async () => {
    try {
      const res = await studentsApi.getAll();
      const list = res?.items || [];

      const mapped = list.map(item => ({
        id: item.id,
        matricule: item.matricule || 'ETU-00',
        nom: item.user?.nom || 'Nom',
        prenom: item.user?.prenom || 'Prénom',
        email: item.user?.email || 'email@emit.mg',
        telephone: item.telephone || '—',
        formation: item.formation || 'Non renseigné',
        promotion: item.promotion || '2026',
        niveau: item.niveau || 'L3',
        statut: item.statutAcademique || 'ACTIF',
      }));
      setEtudiants(mapped);
    } catch (err) {
      console.error('Erreur chargement étudiants:', err);
    }
  };

  useEffect(() => {
    const run = async () => {
      await loadStudents();
    };
    run();
  }, []);

  const stats = {
    total: etudiants.length,
    actifs: etudiants.filter(e => e.statut === 'ACTIF').length,
    diplomes: etudiants.filter(e => e.statut === 'DIPLOME').length,
    enStage: 0
  };

  const filteredEtudiants = etudiants.filter(e => {
    const matchSearch = (e.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (e.prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (e.matricule || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (e.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchFiliere = filterFiliere === 'Tous' || e.formation === filterFiliere;
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
    { value: 'Tous', label: 'Toutes les formations' },
    ...new Set(etudiants.map(e => e.formation).filter(Boolean)).map(v => ({ value: v, label: v }))
  ];
  const promotionOptions = [
    { value: 'Tous', label: 'Toutes les promotions' },
    ...new Set(etudiants.map(e => e.promotion).filter(Boolean)).map(v => ({ value: v, label: v }))
  ];
  const niveauOptions = [
    { value: 'L1', label: 'Licence 1' },
    { value: 'L2', label: 'Licence 2' },
    { value: 'L3', label: 'Licence 3' },
    { value: 'M1', label: 'Master 1' },
    { value: 'M2', label: 'Master 2' }
  ];
  const statutOptions = [
    { value: 'ACTIF', label: 'Actif' },
    { value: 'DIPLOME', label: 'Diplômé' },
    { value: 'SUSPENDU', label: 'Suspendu' },
    { value: 'ABANDONNE', label: 'Abandonné' }
  ];

  const getStatusBadge = (statut) => {
    if (statut === 'DIPLOME') return 'badge-diplome';
    return 'badge-actif';
  };

  const openDetailModal = (etudiant) => {
    setSelectedEtudiant(etudiant);
    setShowDetailModal(true);
  };

  const openCreateModal = () => {
    setFormData({
      matricule: '', nom: '', prenom: '', email: '',
      telephone: '', formation: '', promotion: '', niveau: '', statutAcademique: 'ACTIF'
    });
    setShowCreateModal(true);
  };

  const openEditModal = (etudiant) => {
    setEditEtudiant(etudiant);
    setFormData({
      matricule: etudiant.matricule,
      nom: etudiant.nom,
      prenom: etudiant.prenom,
      email: etudiant.email,
      telephone: etudiant.telephone === '—' ? '' : etudiant.telephone,
      formation: etudiant.formation,
      promotion: etudiant.promotion,
      niveau: etudiant.niveau,
      statutAcademique: etudiant.statut
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (etudiant) => {
    setDeleteEtudiant(etudiant);
    setShowDeleteModal(true);
  };

  const handleCreate = async () => {
    try {
      const defaultPassword = `EMIT@${formData.promotion || new Date().getFullYear()}`;
      const user = await usersApi.create({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        motDePasse: defaultPassword,
        role: 'ETUDIANT',
      });
      await studentsApi.create({
        userId: user.id,
        matricule: formData.matricule,
        formation: formData.formation,
        niveau: formData.niveau,
        promotion: formData.promotion,
        telephone: formData.telephone || undefined,
      });
      setShowCreateModal(false);
      loadStudents();
    } catch (err) {
      console.error('Erreur création étudiant:', err);
    }
  };

  const handleEdit = async () => {
    if (!editEtudiant) return;
    try {
      await studentsApi.update(editEtudiant.id, {
        matricule: formData.matricule,
        formation: formData.formation,
        niveau: formData.niveau,
        promotion: formData.promotion,
        telephone: formData.telephone || undefined,
        statutAcademique: formData.statutAcademique,
      });
      setShowEditModal(false);
      setEditEtudiant(null);
      loadStudents();
    } catch (err) {
      console.error('Erreur modification étudiant:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteEtudiant) return;
    try {
      await studentsApi.delete(deleteEtudiant.id);
      setShowDeleteModal(false);
      setDeleteEtudiant(null);
      loadStudents();
    } catch (err) {
      console.error('Erreur suppression étudiant:', err);
    }
  };

  return (
    <div className="admin-etudiants-page">
      {/* ===== HEADER ===== */}
      <div className="admin-etudiants-header">
        <div>
          <h1>Gestion des étudiants</h1>
          <p className="admin-etudiants-subtitle">Gérez les étudiants et leurs informations</p>
        </div>
        <button className="admin-etudiants-btn-add" onClick={openCreateModal}>
          <FaPlus /> Ajouter
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
              <th>Formation</th>
              <th>Promotion</th>
              <th>Niveau</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEtudiants.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-etudiants-empty">Aucun étudiant trouvé</td>
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
                  <td>{etudiant.formation}</td>
                  <td><span className="admin-etudiants-promotion-badge">{etudiant.promotion}</span></td>
                  <td>{etudiant.niveau}</td>
                  <td><span className={getStatusBadge(etudiant.statut)}>{etudiant.statut}</span></td>
                  <td>
                    <div className="admin-etudiants-actions">
                      <button className="admin-etudiants-btn-view" onClick={() => openDetailModal(etudiant)} title="Voir">
                        <FaEye /> Voir
                      </button>
                      <button className="admin-etudiants-btn-edit" onClick={() => openEditModal(etudiant)} title="Modifier">
                        <FaEdit />
                      </button>
                      <button className="admin-etudiants-btn-delete" onClick={() => openDeleteModal(etudiant)} title="Supprimer">
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
      {showDetailModal && (
        <EtudiantDetail
          etudiant={selectedEtudiant}
          onClose={() => { setShowDetailModal(false); setSelectedEtudiant(null); }}
        />
      )}

      {showCreateModal && (
        <EtudiantForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          title="Ajouter un étudiant"
          submitLabel="Créer"
          filiereOptions={filiereOptions}
          promotionOptions={promotionOptions}
          niveauOptions={niveauOptions}
          statutOptions={statutOptions}
        />
      )}

      {showEditModal && (
        <EtudiantForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onCancel={() => { setShowEditModal(false); setEditEtudiant(null); }}
          title="Modifier l'étudiant"
          submitLabel="Enregistrer"
          filiereOptions={filiereOptions}
          promotionOptions={promotionOptions}
          niveauOptions={niveauOptions}
          statutOptions={statutOptions}
        />
      )}

      {showDeleteModal && (
        <EtudiantDelete
          etudiant={deleteEtudiant}
          onConfirm={handleDelete}
          onCancel={() => { setShowDeleteModal(false); setDeleteEtudiant(null); }}
        />
      )}
    </div>
  );
}

export default AdminEtudiants;