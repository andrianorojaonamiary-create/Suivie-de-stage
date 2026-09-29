import { useState, useEffect } from 'react';
import { 
  FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaPlus, FaTimes,
  FaBuilding, FaUsers,FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

import EntrepriseForm from './components/EntrepriseForm';
import EntrepriseDetail from './components/EntrepriseDetail';
import EntrepriseDelete from './components/EntrepriseDelete';
import companiesApi from '../../api/companiesApi';
import usersApi from '../../api/usersApi';
import { extractList } from '../../api/listResult';
import { getApiErrorMessage } from '../../api/apiClient';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';
import { toast } from 'react-toastify';

function AdminEntreprises() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomaine, setFilterDomaine] = useState('Tous');
  const [filterVille, setFilterVille] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEntreprise, setSelectedEntreprise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entreprises, setEntreprises] = useState([]);
  // Création : un compte ENTREPRISE d'abord, puis sa fiche companies.
  // companies.user_id est unique, d'où l'ordre impératif.
  const [userOptions, setUserOptions] = useState([]);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const EMPTY_FORM = {
    nom: '',
    domaine: '',
    adresse: '',
    ville: '',
    region: '',
    telephone: '',
    email: '',
    latitude: '',
    longitude: '',
    userId: ''
  };
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const itemsPerPage = 5;

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const res = await companiesApi.getAll();
      const list = extractList(res);

      // Noms de colonnes réels : secteurActivite (et non secteur/domaine),
      // et la colonne userId. Les valeurs de repli inventées
      // ('Technologies', '+261 34 00 000 00'…) masquaient les données vides.
      const mapped = list.map(item => ({
        id: item.id,
        userId: item.userId,
        nom: item.nom || '—',
        domaine: item.secteurActivite || '—',
        adresse: item.adresse || '—',
        ville: item.ville || '—',
        region: item.region || '—',
        telephone: item.telephone || '—',
        email: item.email || '—',
        stagiaires: item.stagiaires ?? 0,
        latitude: item.latitude ?? '',
        longitude: item.longitude ?? ''
      }));
      setEntreprises(mapped);
    } catch (err) {
      console.error('Erreur chargement entreprises:', err);
      setEntreprises([]);
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
    { value: 'Tous', label: 'Tous' },
    { value: 'Technologies', label: 'Technologies' },
    { value: 'Banque', label: 'Banque' },
    { value: 'Télécom', label: 'Télécom' },
    { value: 'Énergie', label: 'Énergie' },
    { value: 'Services', label: 'Services' }
  ];
  const villeOptions = [
    { value: 'Tous', label: 'Tous' },
    { value: 'Antananarivo', label: 'Antananarivo' }
  ];

  const resetForm = () => {
    setFormData({ ...EMPTY_FORM });
  };

  const handleEdit = async () => {
    try {
      if (selectedEntreprise?.id) {
        // Le DTO companies attend secteurActivite, pas secteur : l'ancien nom
        // était rejeté en 400 et la modification n'était jamais enregistrée.
        await companiesApi.update(selectedEntreprise.id, {
          nom: formData.nom,
          secteurActivite: formData.domaine,
          adresse: formData.adresse,
          ville: formData.ville,
          email: formData.email,
          telephone: formData.telephone
        });
        toast.success('Entreprise mise à jour');
        await loadCompanies();
      }
    } catch (err) {
      // Le catch précédent applique une modification locale : l'écran
      // affichait la nouvelle valeur alors que le serveur l'avait rejetée.
      toast.error(getApiErrorMessage(err, 'Erreur de mise à jour de l\'entreprise'));
    }
    setShowEditModal(false);
    resetForm();
  };

  const handleDelete = async () => {
    try {
      if (selectedEntreprise?.id) {
        await companiesApi.delete(selectedEntreprise.id);
        toast.success('Entreprise supprimée');
        await loadCompanies();
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur de suppression de l\'entreprise'));
    }
    setShowDeleteModal(false);
    setSelectedEntreprise(null);
  };

  /**
   * Comptes ENTREPRISE existants, sans fiche companies : ce sont les seuls
   * candidats à la création, puisque companies.user_id est unique.
   */
  const loadUserOptions = async () => {
    try {
      // limit est plafonné à 100 par @Max(100) dans FindUsersDto.
      const res = await usersApi.getAll({ role: 'ENTREPRISE', limit: 100 });
      setUserOptions(
        extractList(res).map(u => ({
          value: u.id,
          label: `${u.nom} ${u.prenom} — ${u.email}`
        }))
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur de chargement des comptes'));
    }
  };

  const openCreateModal = async () => {
    setCreateError('');
    setFormData({ ...EMPTY_FORM });
    setShowCreateModal(true);
    await loadUserOptions();
  };

  /**
   * Création d'une entreprise : compte + fiche.
   *
   * Si le compte n'existe pas encore, il est d'abord créé avec le rôle
   * ENTREPRISE. Sinon, companies.user_id est déjà pris et la création échouerait
   * sur la contrainte d'unicité.
   */
  const handleCreate = async () => {
    if (!formData.userId) {
      setCreateError('Sélectionnez le compte à rattacher à cette entreprise.');
      return;
    }
    const required = ['nom', 'domaine', 'adresse', 'ville', 'region', 'email'];
    if (required.some((key) => !formData[key])) {
      setCreateError('Tous les champs obligatoires doivent être remplis.');
      return;
    }

    try {
      setCreating(true);
      setCreateError('');
      await companiesApi.create({
        userId: formData.userId,
        nom: formData.nom,
        secteurActivite: formData.domaine,
        adresse: formData.adresse,
        ville: formData.ville,
        region: formData.region,
        email: formData.email,
        ...(formData.telephone && { telephone: formData.telephone }),
        ...(formData.latitude && { latitude: Number(formData.latitude) }),
        ...(formData.longitude && { longitude: Number(formData.longitude) })
      });
      toast.success('Entreprise créée');
      setShowCreateModal(false);
      await loadCompanies();
    } catch (err) {
      setCreateError(getApiErrorMessage(err, 'Erreur de création de l\'entreprise'));
    } finally {
      setCreating(false);
    }
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
      {loading ? (
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement…</span>
          </div>
        </div>
      ) : (
        <>
      <div className="admin-entreprises-header">
        <div>
          <h1>Gestion des entreprises</h1>
          <p className="admin-entreprises-subtitle">Gérez les entreprises partenaires</p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreateModal}>
          <FaPlus /> Nouvelle entreprise
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

      {/* ===== CRÉATION =====
          companiesApi.create n'était appelé nulle part : aucune entreprise ne
          pouvait être créée depuis l'interface. */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => !creating && setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nouvelle entreprise</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              {createError && <div className="alert alert-danger">{createError}</div>}
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Compte à rattacher *</label>
                  <SelectPersonnalise
                    value={formData.userId || ''}
                    onChange={(v) => setFormData({ ...formData, userId: v })}
                    placeholder={
                      userOptions.length
                        ? 'Sélectionner un compte entreprise'
                        : 'Aucun compte ENTREPRISE disponible'
                    }
                    className="form-control"
                    options={userOptions}
                  />
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input type="text" value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="TechMada SARL" />
                </div>
                <div className="form-group">
                  <label>Secteur d'activité *</label>
                  <input type="text" value={formData.domaine}
                    onChange={(e) => setFormData({ ...formData, domaine: e.target.value })}
                    placeholder="Informatique" />
                </div>
                <div className="form-group">
                  <label>Adresse *</label>
                  <input type="text" value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    placeholder="Lot II M 77, Antananarivo" />
                </div>
                <div className="form-group">
                  <label>Ville *</label>
                  <input type="text" value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    placeholder="Antananarivo" />
                </div>
                <div className="form-group">
                  <label>Région *</label>
                  <input type="text" value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="Analamanga" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@entreprise.mg" />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input type="text" value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="+261 34 00 000 00" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)} disabled={creating}>
                Annuler
              </button>
              <button className="btn-primary" onClick={handleCreate} disabled={creating}>
                {creating ? 'Création...' : 'Créer l\'entreprise'}
              </button>
            </div>
          </div>
        </div>
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
        </>
      )}
    </div>
  );
}

export default AdminEntreprises;