import { useState, useEffect } from 'react';
import { 
  FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaPlus,
  FaUserGraduate, FaGraduationCap, FaBuilding, FaCheck,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

import EtudiantForm from './components/EtudiantForm';
import EtudiantDetail from './components/EtudiantDetail';
import EtudiantDelete from './components/EtudiantDelete';
import studentsApi from '../../api/studentsApi';
import usersApi from '../../api/usersApi';
import { extractList } from '../../api/listResult';
import { getApiErrorMessage } from '../../api/apiClient';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';
import { toast } from 'react-toastify';

const EMPTY_FORM = {
  matricule: '',
  nom: '',
  prenom: '',
  email: '',
  motDePasse: '',
  telephone: '',
  filiere: '',
  promotion: '',
  niveau: '',
  statut: 'Actif'
};

function AdminEtudiants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFiliere, setFilterFiliere] = useState('Tous');
  const [filterPromotion, setFilterPromotion] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [etudiants, setEtudiants] = useState([]);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const itemsPerPage = 5;

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await studentsApi.getAll();
      const list = extractList(res);

      // Noms de colonnes réels de la table students : la filière s'appelle
      // `formation` (et non parcours/filiere), le statut est `statutAcademique`,
      // et le payload ne contient aucun tableau `internships` — le stage ne peut
      // donc pas être déduit ici sans un appel par étudiant.
      const STATUT_LABELS = {
        ACTIF: 'Actif',
        DIPLOME: 'Diplômé',
        SUSPENDU: 'Suspendu',
        ABANDONNE: 'Abandonné'
      };

      const mapped = list.map(item => ({
        id: item.id,
        matricule: item.matricule || '—',
        nom: item.user?.nom || '—',
        prenom: item.user?.prenom || '—',
        email: item.user?.email || '—',
        telephone: item.telephone || '—',
        filiere: item.formation || '—',
        promotion: item.promotion || '—',
        // Conservé en code brut : les filtres de la page comparent sur 'L3',
        // 'M1'… et un libellé « Licence 3 » ne serait plus jamais trouvé.
        niveau: item.niveau || '—',
        statut: STATUT_LABELS[item.statutAcademique] || item.statutAcademique || '—',
        // Le stage d'un étudiant n'est pas inclus dans la réponse de
        // GET /students : afficher '—' est honnête, une valeur inventée ne
        // l'est pas.
        stage: '—',
        entreprise: '—'
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
    setFormData({ ...EMPTY_FORM });
  };

  const openCreateModal = () => {
    setCreateError('');
    setFormData({ ...EMPTY_FORM });
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    if (!formData.nom || !formData.prenom) {
      setCreateError('Le nom et le prénom sont obligatoires.');
      return;
    }
    if (!formData.email) {
      setCreateError('L\'adresse email est obligatoire.');
      return;
    }
    if (!formData.motDePasse || formData.motDePasse.length < 8) {
      setCreateError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!formData.matricule || !formData.filiere || !formData.niveau || !formData.promotion) {
      setCreateError('Matricule, filière, niveau et promotion sont obligatoires.');
      return;
    }

    let createdUserId = null;
    try {
      setCreating(true);
      setCreateError('');

      const user = await usersApi.create({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        motDePasse: formData.motDePasse,
        role: 'ETUDIANT'
      });
      createdUserId = user?.id;

      await studentsApi.create({
        userId: createdUserId,
        matricule: formData.matricule,
        formation: formData.filiere,
        niveau: formData.niveau,
        promotion: formData.promotion,
        ...(formData.telephone && { telephone: formData.telephone })
      });

      toast.success('Étudiant créé');
      setShowCreateModal(false);
      await loadStudents();
    } catch (err) {
      if (createdUserId) {
        try {
          await usersApi.delete(createdUserId);
        } catch {
          toast.error('Compte créé mais fiche impossible : à supprimer manuellement.');
        }
      }
      setCreateError(getApiErrorMessage(err, 'Erreur de création de l\'étudiant'));
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async () => {
    try {
      if (selectedEtudiant?.id) {
        await studentsApi.update(selectedEtudiant.id, {
          matricule: formData.matricule,
          niveau: formData.niveau
        });
        toast.success('Étudiant mis à jour');
        await loadStudents();
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur de mise à jour de l\'étudiant'));
    }
    setShowEditModal(false);
    resetForm();
  };

  const handleDelete = async () => {
    try {
      if (selectedEtudiant?.id) {
        await studentsApi.delete(selectedEtudiant.id);
        toast.success('Étudiant supprimé');
        await loadStudents();
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur de suppression de l\'étudiant'));
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
      {loading ? (
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement…</span>
          </div>
        </div>
      ) : (
        <>
      {/* ===== HEADER ===== */}
      <div className="admin-etudiants-header">
        <div>
          <h1>Gestion des étudiants</h1>
          <p className="admin-etudiants-subtitle">Gérez les étudiants et leurs informations</p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreateModal}>
          <FaPlus /> Nouvel étudiant
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
      {showCreateModal && (
        <EtudiantForm
          title="Nouvel étudiant"
          submitLabel="Créer l'étudiant"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          onCancel={() => !creating && setShowCreateModal(false)}
          filiereOptions={filiereOptions}
          promotionOptions={promotionOptions}
          niveauOptions={niveauOptions}
          statutOptions={statutOptions}
          showPassword
          error={createError}
          submitting={creating}
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
        </>
      )}
    </div>
  );
}

export default AdminEtudiants;