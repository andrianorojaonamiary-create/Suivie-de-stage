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
import studentsApi from '../../api/studentsApi';
import companiesApi from '../../api/companiesApi';
import { extractList } from '../../api/listResult';
import { getApiErrorMessage } from '../../api/apiClient';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';
import { toast } from 'react-toastify';

function AdminStages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('Tous');
  const [filterDomaine, setFilterDomaine] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState([]);
  const [supervisorOptions, setSupervisorOptions] = useState([]);
  const [supervisorLoading, setSupervisorLoading] = useState(false);
  // Options des sélecteurs de création : l'API attend des identifiants
  // (studentId, companyId, supervisorId), pas des noms. Les listes viennent
  // de /students et /companies, déjà alimentées par P0-b.
  const [studentOptions, setStudentOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const EMPTY_FORM = {
    titre: '',
    etudiant: '',
    entreprise: '',
    encadreur: '',
    domaine: '',
    dateDebut: '',
    dateFin: '',
    statut: 'À venir',
    progression: 0
  };
  const [formData, setFormData] = useState({ ...EMPTY_FORM, studentId: '', companyId: '', supervisorId: '' });
  const itemsPerPage = 5;

  // L'API expose les statuts en majuscules (internships_status_enum), la vue
  // les affiche en libellés français. La conversion se fait au seul endroit où
  // l'on parle à l'API, dans les deux sens.
  const STATUT_LABELS = {
    A_VENIR: 'À venir',
    EN_COURS: 'En cours',
    TERMINE: 'Terminé',
    SUSPENDU: 'Suspendu',
    ANNULE: 'Annulé'
  };
  const STATUT_API = {
    'À venir': 'A_VENIR',
    'En cours': 'EN_COURS',
    'Terminé': 'TERMINE',
    'Suspendu': 'SUSPENDU',
    'Annulé': 'ANNULE'
  };

  /**
   * Étudiants et entreprises pour le formulaire de création.
   * L'API de création exige des UUID : on ne peut pas soumettre un nom.
   * limit est plafonné à 100 par @Max(100) dans tous les FindXxxDto : demander
   * 200 ferait échouer la requête en 400 et laisserait les sélecteurs vides.
   */
  const loadCreateOptions = async () => {
    try {
      const [studentsRes, companiesRes] = await Promise.all([
        studentsApi.getAll({ limit: 100 }),
        companiesApi.getAll({ limit: 100 })
      ]);
      setStudentOptions(
        extractList(studentsRes).map(s => ({
          value: s.id,
          label: `${s.user?.prenom ?? ''} ${s.user?.nom ?? ''}`.trim() || s.matricule || '—'
        }))
      );
      setCompanyOptions(
        extractList(companiesRes).map(c => ({
          value: c.id,
          label: c.nom || '—'
        }))
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur de chargement des listes'));
    }
  };

  const openCreateModal = async () => {
    setCreateError('');
    setFormData({ ...EMPTY_FORM, studentId: '', companyId: '', supervisorId: '' });
    setShowCreateModal(true);
    await loadCreateOptions();
    await loadSupervisors();
  };

  /**
   * Création d'un stage. Tous les champs exigés par CreateInternshipDto sont
   * validés côté client pour éviter un aller-retour 400.
   */
  const handleCreate = async () => {
    const required = {
      studentId: formData.studentId,
      companyId: formData.companyId,
      supervisorId: formData.supervisorId,
      intitule: formData.titre,
      description: formData.description || formData.titre,
      domaine: formData.domaine,
      lieu: formData.lieu || formData.ville || 'Antananarivo',
      ville: formData.ville || 'Antananarivo',
      dateDebut: formData.dateDebut,
      dateFin: formData.dateFin
    };
    const missing = Object.keys(required).filter((key) => !required[key]);
    if (missing.length > 0) {
      setCreateError('Tous les champs obligatoires doivent être remplis.');
      return;
    }
    if (required.dateFin < required.dateDebut) {
      setCreateError('La date de fin doit être postérieure à la date de début.');
      return;
    }

    try {
      setCreating(true);
      setCreateError('');
      await internshipsApi.create({
        ...required,
        statut: STATUT_API[formData.statut] || 'A_VENIR'
      });
      toast.success('Stage créé');
      setShowCreateModal(false);
      await loadStages();
    } catch (err) {
      setCreateError(getApiErrorMessage(err, 'Erreur de création du stage'));
    } finally {
      setCreating(false);
    }
  };

  /**
   * Encadreurs avec leur charge, pour le sélecteur d'affectation.
   * excludeInternshipId évite que le stage en cours de modification compte dans
   * la charge de son propre encadreur, qui l'afficherait alors au-dessus de 10.
   */
  const loadSupervisors = async (excludeInternshipId) => {
    try {
      setSupervisorLoading(true);
      const res = await internshipsApi.getAvailableSupervisors(
        excludeInternshipId ? { excludeInternshipId } : undefined
      );
      const list = Array.isArray(res) ? res : res?.data || [];
      setSupervisorOptions(
        list.map(s => ({
          value: s.id,
          label: `${s.prenom} ${s.nom} — ${s.stagesActifs}/${s.maxStages}`,
          disabled: !s.disponible
        }))
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur de chargement des encadreurs'));
      setSupervisorOptions([]);
    } finally {
      setSupervisorLoading(false);
    }
  };

  const loadStages = async () => {
    try {
      setLoading(true);
      const res = await internshipsApi.getAll();
      const list = extractList(res);

      const mapped = list.map(item => ({
        id: item.id,
        // L'API renvoie intitule, pas titre : la lecture de item.titre
        // renvoyait undefined et affichait « Stage sans titre » partout.
        titre: item.intitule || 'Sans intitulé',
        etudiant: item.student?.user
          ? `${item.student.user.prenom} ${item.student.user.nom}`.trim()
          : (item.student?.matricule || '—'),
        entreprise: item.company?.nom || '—',
        encadreur: item.supervisor?.user
          ? `${item.supervisor.user.prenom} ${item.supervisor.user.nom}`.trim()
          : '—',
        supervisorId: item.supervisorId,
        domaine: item.domaine || '—',
        dateDebut: item.dateDebut ? new Date(item.dateDebut).toLocaleDateString('fr-FR') : '—',
        dateFin: item.dateFin ? new Date(item.dateFin).toLocaleDateString('fr-FR') : '—',
        statut: STATUT_LABELS[item.statut] || item.statut,
        // La progression n'existe pas en base : elle est dérivée du statut.
        progression: item.statut === 'TERMINE' ? 100 : item.statut === 'EN_COURS' ? 50 : 0
      }));
      setStages(mapped);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur de chargement des stages'));
      setStages([]);
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
    setFormData({ ...EMPTY_FORM, studentId: '', companyId: '', supervisorId: '' });
  };

  const handleEdit = async () => {
    try {
      if (selectedStage?.id) {
        // Un changement d'encadreur passe par la route dédiée : c'est elle qui
        // écrit l'historique et vérifie la limite de 10. PATCH /internships/:id
        // accepte aussi supervisorId, mais autant passer par le chemin explicite.
        if (formData.supervisorId && formData.supervisorId !== selectedStage.supervisorId) {
          await internshipsApi.changeSupervisor(selectedStage.id, formData.supervisorId);
          toast.success('Encadreur du stage modifié');
        }
        await internshipsApi.update(selectedStage.id, {
          // L'API attend intitule et un statut de l'enum en majuscules.
          // L'ancien payload envoyait titre + 'en_cours' : les deux étaient
          // rejetés en 400, et le catch masquait l'erreur en appliquant une
          // modification locale que le serveur n'avait jamais vue.
          intitule: formData.titre,
          statut: STATUT_API[formData.statut] || 'EN_COURS'
        });
        toast.success('Stage mis à jour');
        await loadStages();
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur de mise à jour du stage'));
    }
    setShowEditModal(false);
    resetForm();
  };

  const handleDelete = async () => {
    try {
      if (selectedStage?.id) {
        await internshipsApi.delete(selectedStage.id);
        toast.success('Stage supprimé');
        await loadStages();
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur de suppression du stage'));
    }
    setShowDeleteModal(false);
    setSelectedStage(null);
  };

  const openEditModal = (stage) => {
    setSelectedStage(stage);
    setFormData(stage);
    setShowEditModal(true);
    loadSupervisors(stage.id);
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
      {loading ? (
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement…</span>
          </div>
        </div>
      ) : (
        <>
      <div className="admin-stages-header">
        <div>
          <h1>Gestion des stages</h1>
          <p className="admin-stages-subtitle">Gérez les stages des étudiants</p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreateModal}>
          <FaList /> Nouveau stage
        </button>
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

      {/* ===== CRÉATION =====
          Sans ce formulaire, aucun stage ne pouvait être créé depuis
          l'interface : internshipsApi.create n'était appelé nulle part, et la
          base restait vide. */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => !creating && setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nouveau stage</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              {createError && <div className="alert alert-danger">{createError}</div>}
              <div className="form-grid">
                <div className="form-group">
                  <label>Étudiant *</label>
                  <SelectPersonnalise
                    value={formData.studentId || ''}
                    onChange={(v) => setFormData({ ...formData, studentId: v })}
                    placeholder={studentOptions.length ? 'Sélectionner un étudiant' : 'Aucun étudiant disponible'}
                    className="form-control"
                    options={studentOptions}
                  />
                </div>
                <div className="form-group">
                  <label>Entreprise *</label>
                  <SelectPersonnalise
                    value={formData.companyId || ''}
                    onChange={(v) => setFormData({ ...formData, companyId: v })}
                    placeholder={companyOptions.length ? 'Sélectionner une entreprise' : 'Aucune entreprise disponible'}
                    className="form-control"
                    options={companyOptions}
                  />
                </div>
                <div className="form-group">
                  <label>Encadreur *</label>
                  <SelectPersonnalise
                    value={formData.supervisorId || ''}
                    onChange={(v) => setFormData({ ...formData, supervisorId: v })}
                    placeholder={supervisorLoading ? 'Chargement des encadreurs...' : 'Sélectionner un encadreur'}
                    className="form-control"
                    options={supervisorOptions}
                  />
                </div>
                <div className="form-group">
                  <label>Titre du stage *</label>
                  <input
                    type="text"
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    placeholder="Développement d'une application web"
                  />
                </div>
                <div className="form-group">
                  <label>Domaine *</label>
                  <SelectPersonnalise
                    value={formData.domaine || ''}
                    onChange={(v) => setFormData({ ...formData, domaine: v })}
                    placeholder="Sélectionner"
                    className="form-control"
                    options={domaineOptions.filter(d => d.value !== 'Tous')}
                  />
                </div>
                <div className="form-group">
                  <label>Ville *</label>
                  <input
                    type="text"
                    value={formData.ville || ''}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    placeholder="Antananarivo"
                  />
                </div>
                <div className="form-group">
                  <label>Statut</label>
                  <SelectPersonnalise
                    value={formData.statut}
                    onChange={(v) => setFormData({ ...formData, statut: v })}
                    className="form-control"
                    options={statutOptions.filter(s => s.value !== 'Tous')}
                  />
                </div>
                <div className="form-group">
                  <label>Date de début *</label>
                  <input
                    type="date"
                    value={formData.dateDebut || ''}
                    onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Date de fin *</label>
                  <input
                    type="date"
                    value={formData.dateFin || ''}
                    onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)} disabled={creating}>
                Annuler
              </button>
              <button className="btn-primary" onClick={handleCreate} disabled={creating}>
                {creating ? 'Création...' : 'Créer le stage'}
              </button>
            </div>
          </div>
        </div>
      )}

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
          supervisorOptions={supervisorOptions}
          supervisorLoading={supervisorLoading}
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
          onClose={() => {
            setShowDetailModal(false);
            setSelectedStage(null);
            // L'encadreur vient peut-être d'être changé : sans rechargement,
            // la ligne afficherait encore l'ancien nom.
            loadStages();
          }}
        />
      )}
        </>
      )}
    </div>
  );
}

export default AdminStages;