import { useState, useEffect } from 'react';
import {
  FaSearch, FaFilter, FaEye, FaPlus, FaEdit,
  FaList,
  FaChevronLeft, FaChevronRight, FaCheck, FaTimes, FaClock
} from 'react-icons/fa';
import { toast } from 'react-toastify';

import StageDetail from './components/StageDetail';
import StageForm from './components/StageForm';
import internshipsApi from '../../api/internshipsApi';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';
import { getApiErrorMessage } from '../../api/apiClient';

const EMPTY_FORM = {
  intitule: '',
  description: '',
  studentId: '',
  companyId: '',
  supervisorId: '',
  tuteurId: '',
  encadreurProfessionnelNom: '',
  domaine: '',
  lieu: '',
  ville: '',
  dateDebut: '',
  dateFin: '',
  statut: 'EN_ATTENTE',
  observations: '',
};

function mapInternship(item) {
  const studentUser = item.student?.user || {};
  const studentName =
    studentUser.prenom && studentUser.nom
      ? `${studentUser.prenom} ${studentUser.nom}`
      : 'Étudiant';

  const companyName = item.company?.nom || 'Entreprise';

  const supervisorUser = item.supervisor?.user || {};
  const supervisorName =
    supervisorUser.prenom && supervisorUser.nom
      ? `${supervisorUser.prenom} ${supervisorUser.nom}`
      : item.encadreurProfessionnelNom || 'Encadreur';

  const statutRaw = item.statut || '';
  let statutLabel = 'En cours';
  if (statutRaw === 'A_VENIR') statutLabel = 'À venir';
  else if (statutRaw === 'TERMINE') statutLabel = 'Terminé';
  else if (statutRaw === 'EN_COURS') statutLabel = 'En cours';
  else if (statutRaw === 'EN_ATTENTE') statutLabel = 'En attente';
  else if (statutRaw === 'REFUSE') statutLabel = 'Refusé';

  return {
    id: item.id,
    titre: item.intitule || 'Stage',
    etudiant: studentName,
    entreprise: companyName,
    encadreur: supervisorName,
    domaine: item.domaine || '—',
    dateDebut: item.dateDebut ? new Date(item.dateDebut).toLocaleDateString('fr-FR') : '—',
    dateFin: item.dateFin ? new Date(item.dateFin).toLocaleDateString('fr-FR') : '—',
    statut: statutLabel,
    statutRaw,
    progression:
      statutRaw === 'TERMINE' ? 100 :
      statutRaw === 'EN_COURS' ? 50 :
      0,
    // IDs pour pré-remplir le formulaire d'édition
    _raw: item,
  };
}

function AdminStages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('Tous');
  const [filterDomaine, setFilterDomaine] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;

  const loadStages = async () => {
    setLoading(true);
    try {
      const res = await internshipsApi.getAll({ limit: 200 });
      const list = Array.isArray(res) ? res : res?.data || res?.items || [];
      setStages(list.map(mapInternship));
    } catch (err) {
      console.error('Erreur chargement stages:', err);
      toast.error('Impossible de charger les stages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStages(); }, []);

  /* ===== STATS ===== */
  const stats = {
    total: stages.length,
    enCours: stages.filter(s => s.statut === 'En cours').length,
    termine: stages.filter(s => s.statut === 'Terminé').length,
    aVenir: stages.filter(s => s.statut === 'À venir' || s.statut === 'En attente').length,
  };

  /* ===== FILTRES ===== */
  const filteredStages = stages.filter(s => {
    const matchSearch =
      (s.titre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.etudiant || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.entreprise || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = filterStatut === 'Tous' || s.statut === filterStatut;
    const matchDomaine = filterDomaine === 'Tous' || s.domaine === filterDomaine;
    return matchSearch && matchStatut && matchDomaine;
  });

  const totalPages = Math.ceil(filteredStages.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStages = filteredStages.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  const statutOptions = [
    { value: 'Tous', label: 'Tous les statuts' },
    { value: 'En attente', label: 'En attente' },
    { value: 'À venir', label: 'À venir' },
    { value: 'En cours', label: 'En cours' },
    { value: 'Terminé', label: 'Terminé' },
    { value: 'Refusé', label: 'Refusé' },
  ];

  const domaineOptions = [
    { value: 'Tous', label: 'Tous les domaines' },
    ...[...new Set(stages.map(s => s.domaine).filter(d => d && d !== '—'))].map(v => ({
      value: v,
      label: v,
    })),
  ];

  const getStatusBadge = (statut) => {
    const classes = {
      'À venir': 'badge-a-venir',
      'En cours': 'badge-en-cours',
      'Terminé': 'badge-termine',
      'En attente': 'badge-en-attente',
      'Refusé': 'badge-refuse',
    };
    return classes[statut] || 'badge-en-cours';
  };

  /* ===== CRÉER ===== */
  const openCreateModal = () => {
    setFormData(EMPTY_FORM);
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    if (!formData.studentId) return toast.error('Veuillez sélectionner un étudiant.');
    if (!formData.companyId) return toast.error('Veuillez sélectionner une entreprise.');
    if (!formData.intitule?.trim()) return toast.error("L'intitulé est obligatoire.");
    if (!formData.description?.trim()) return toast.error('La description est obligatoire.');
    if (!formData.domaine?.trim()) return toast.error('Le domaine est obligatoire.');
    if (!formData.lieu?.trim()) return toast.error('Le lieu est obligatoire.');
    if (!formData.ville?.trim()) return toast.error('La ville est obligatoire.');
    if (!formData.dateDebut) return toast.error('La date de début est obligatoire.');
    if (!formData.dateFin) return toast.error('La date de fin est obligatoire.');
    if (!formData.supervisorId && !formData.encadreurProfessionnelNom?.trim()) {
      return toast.error('Renseignez un encadreur professionnel (compte ou nom).');
    }

    const payload = {
      studentId: formData.studentId,
      companyId: formData.companyId,
      intitule: formData.intitule,
      description: formData.description,
      domaine: formData.domaine,
      lieu: formData.lieu,
      ville: formData.ville,
      dateDebut: formData.dateDebut,
      dateFin: formData.dateFin,
      statut: formData.statut,
    };
    if (formData.supervisorId) payload.supervisorId = formData.supervisorId;
    if (formData.tuteurId) payload.tuteurId = formData.tuteurId;
    if (!formData.supervisorId && formData.encadreurProfessionnelNom?.trim()) {
      payload.encadreurProfessionnelNom = formData.encadreurProfessionnelNom;
    }
    if (formData.observations?.trim()) payload.observations = formData.observations;

    setFormLoading(true);
    try {
      await internshipsApi.create(payload);
      toast.success('Stage créé avec succès !');
      setShowCreateModal(false);
      await loadStages();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur lors de la création.'));
    } finally {
      setFormLoading(false);
    }
  };

  /* ===== MODIFIER ===== */
  const openEditModal = (stage) => {
    const raw = stage._raw;
    setEditingId(stage.id);
    setFormData({
      intitule: raw.intitule || '',
      description: raw.description || '',
      studentId: raw.student?.id || '',
      companyId: raw.company?.id || '',
      supervisorId: raw.supervisor?.id || '',
      tuteurId: raw.tuteur?.id || '',
      encadreurProfessionnelNom: raw.encadreurProfessionnelNom || '',
      domaine: raw.domaine || '',
      lieu: raw.lieu || '',
      ville: raw.ville || '',
      dateDebut: raw.dateDebut ? raw.dateDebut.slice(0, 10) : '',
      dateFin: raw.dateFin ? raw.dateFin.slice(0, 10) : '',
      statut: raw.statut || 'EN_ATTENTE',
      observations: raw.observations || '',
    });
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!formData.intitule?.trim()) return toast.error("L'intitulé est obligatoire.");
    if (!formData.companyId) return toast.error('Veuillez sélectionner une entreprise.');

    const payload = {};
    if (formData.intitule) payload.intitule = formData.intitule;
    if (formData.description) payload.description = formData.description;
    if (formData.companyId) payload.companyId = formData.companyId;
    if (formData.supervisorId) payload.supervisorId = formData.supervisorId;
    if (formData.tuteurId) payload.tuteurId = formData.tuteurId;
    if (formData.encadreurProfessionnelNom) payload.encadreurProfessionnelNom = formData.encadreurProfessionnelNom;
    if (formData.domaine) payload.domaine = formData.domaine;
    if (formData.lieu) payload.lieu = formData.lieu;
    if (formData.ville) payload.ville = formData.ville;
    if (formData.dateDebut) payload.dateDebut = formData.dateDebut;
    if (formData.dateFin) payload.dateFin = formData.dateFin;
    if (formData.statut) payload.statut = formData.statut;
    if (formData.observations !== undefined) payload.observations = formData.observations;

    setFormLoading(true);
    try {
      await internshipsApi.update(editingId, payload);
      toast.success('Stage mis à jour avec succès !');
      setShowEditModal(false);
      await loadStages();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur lors de la mise à jour.'));
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="admin-stages-page">
      {/* ===== HEADER ===== */}
      <div className="admin-stages-header">
        <div>
          <h1>Gestion des stages</h1>
          <p className="admin-stages-subtitle">Gérez et affectez les stages des étudiants</p>
        </div>
        <button className="admin-stages-btn-add" onClick={openCreateModal}>
          <FaPlus /> Nouveau stage
        </button>
      </div>

      {/* ===== STATISTIQUES ===== */}
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
            <span className="admin-stages-stat-label">En attente</span>
          </div>
        </div>
      </div>

      {/* ===== FILTRES ===== */}
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

      {/* ===== TABLEAU ===== */}
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
            {loading ? (
              <tr>
                <td colSpan="8" className="admin-stages-empty">Chargement des stages...</td>
              </tr>
            ) : paginatedStages.length === 0 ? (
              <tr>
                <td colSpan="8" className="admin-stages-empty">Aucun stage trouvé</td>
              </tr>
            ) : (
              paginatedStages.map((stage) => (
                <tr key={stage.id}>
                  <td><span className="admin-stages-titre">{stage.titre}</span></td>
                  <td>
                    <div className="admin-stages-etudiant">{stage.etudiant}</div>
                  </td>
                  <td>
                    <div className="admin-stages-entreprise">{stage.entreprise}</div>
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
                      <button
                        className="admin-stages-btn-view"
                        onClick={() => { setSelectedStage(stage); setShowDetailModal(true); }}
                        title="Voir"
                      >
                        <FaEye /> Voir
                      </button>
                      <button
                        className="admin-stages-btn-edit"
                        onClick={() => openEditModal(stage)}
                        title="Modifier"
                      >
                        <FaEdit /> Modifier
                      </button>
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

      {/* ===== MODALES ===== */}
      {showDetailModal && (
        <StageDetail
          stage={selectedStage}
          onClose={() => { setShowDetailModal(false); setSelectedStage(null); }}
        />
      )}

      {showCreateModal && (
        <StageForm
          title="Créer un stage / Affecter"
          submitLabel="Créer le stage"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          loading={formLoading}
        />
      )}

      {showEditModal && (
        <StageForm
          title="Modifier le stage"
          submitLabel="Enregistrer les modifications"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onCancel={() => setShowEditModal(false)}
          loading={formLoading}
        />
      )}
    </div>
  );
}

export default AdminStages;