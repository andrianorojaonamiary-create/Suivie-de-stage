import { useState, useEffect } from 'react';
import { 
  FaSearch, FaFilter, FaEye, FaEdit, FaTrash,
  FaUserTie, FaUsers, FaChalkboardTeacher, FaBriefcase,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

import EncadreurForm from './components/EncadreurForm';
import EncadreurDetail from './components/EncadreurDetail';
import EncadreurDelete from './components/EncadreurDelete';
import supervisorsApi from '../../api/supervisorsApi';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';

function AdminEncadreurs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');
  const [filterFonction, setFilterFonction] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEncadreur, setSelectedEncadreur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [encadreurs, setEncadreurs] = useState([]);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    type: 'professionnel',
    fonction: '',
    entreprise: ''
  });
  const itemsPerPage = 5;

  const loadSupervisors = async () => {
    try {
      setLoading(true);
      const res = await supervisorsApi.getAll();
      const list = Array.isArray(res) ? res : res?.data || res?.items || [];

      const mapped = list.map(item => {
        const u = item.user || {};
        const isPedago = u.role === 'ENSEIGNANT' || u.role === 'ROLE_ENSEIGNANT';
        return {
          id: item.id,
          nom: u.nom || item.nom || 'Nom',
          prenom: u.prenom || item.prenom || 'Prénom',
          email: u.email || item.email || '—',
          telephone: item.telephone || u.telephone || '—',
          type: isPedago ? 'pedagogique' : 'professionnel',
          fonction: item.fonction || item.specialite || item.grade || (isPedago ? 'Tuteur pédagogique' : 'Encadreur pro'),
          entreprise: item.entreprise?.nom || (isPedago ? 'EMIT' : 'Entreprise'),
          etudiants: item.internships ? item.internships.map(i => i.student?.user ? `${i.student.user.prenom} ${i.student.user.nom}` : 'Étudiant') : []
        };
      });
      setEncadreurs(mapped);
    } catch (err) {
      console.error('Erreur chargement encadreurs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupervisors();
  }, []);

  const stats = {
    total: encadreurs.length,
    professionnels: encadreurs.filter(e => e.type === 'professionnel').length,
    pedagogiques: encadreurs.filter(e => e.type === 'pedagogique').length,
    totalEtudiants: encadreurs.reduce((acc, e) => acc + (e.etudiants?.length || 0), 0)
  };

  const filteredEncadreurs = encadreurs.filter(e => {
    const matchSearch = (e.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (e.prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (e.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (e.entreprise || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'Tous' || e.type === filterType;
    const matchFonction = filterFonction === 'Tous' || e.fonction === filterFonction;
    return matchSearch && matchType && matchFonction;
  });

  const totalPages = Math.ceil(filteredEncadreurs.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEncadreurs = filteredEncadreurs.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const typeOptions = [
    { value: 'Tous', label: 'Tous les types' },
    { value: 'professionnel', label: 'Encadreur professionnel' },
    { value: 'pedagogique', label: 'Tuteur pédagogique' }
  ];
  const fonctionOptions = [
    { value: 'Tous', label: 'Tous' },
    { value: 'Responsable technique', label: 'Responsable technique' },
    { value: 'Responsable projet', label: 'Responsable projet' },
    { value: 'Responsable RH', label: 'Responsable RH' },
    { value: "Enseignant à l'EMIT", label: "Enseignant à l'EMIT" },
    { value: "Professeur à l'EMIT", label: "Professeur à l'EMIT" }
  ];

  const getTypeBadge = (type) => {
    return type === 'professionnel' ? 'badge-professionnel' : 'badge-pedagogique';
  };

  const getTypeLabel = (type) => {
    return type === 'professionnel' ? 'Encadreur pro.' : 'Tuteur pédago.';
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      type: 'professionnel',
      fonction: '',
      entreprise: ''
    });
  };

  const handleEdit = async () => {
    try {
      if (selectedEncadreur?.id) {
        await supervisorsApi.update(selectedEncadreur.id, {
          type: formData.type,
          grade: formData.fonction
        });
        await loadSupervisors();
      }
    } catch {
      setEncadreurs(encadreurs.map(e => e.id === selectedEncadreur?.id ? { ...e, ...formData } : e));
    }
    setShowEditModal(false);
    resetForm();
  };

  const handleDelete = async () => {
    try {
      if (selectedEncadreur?.id) {
        await supervisorsApi.delete(selectedEncadreur.id);
        await loadSupervisors();
      }
    } catch {
      setEncadreurs(encadreurs.filter(e => e.id !== selectedEncadreur?.id));
    }
    setShowDeleteModal(false);
    setSelectedEncadreur(null);
  };

  const openEditModal = (encadreur) => {
    setSelectedEncadreur(encadreur);
    setFormData(encadreur);
    setShowEditModal(true);
  };

  const openDeleteModal = (encadreur) => {
    setSelectedEncadreur(encadreur);
    setShowDeleteModal(true);
  };

  const openDetailModal = (encadreur) => {
    setSelectedEncadreur(encadreur);
    setShowDetailModal(true);
  };

  return (
    <div className="admin-encadreurs-page">
      <div className="admin-encadreurs-header">
        <div>
          <h1>Gestion des encadreurs</h1>
          <p className="admin-encadreurs-subtitle">Gérez les encadreurs professionnels et les tuteurs pédagogiques</p>
        </div>
      </div>

      {/* ===== STATISTIQUES ===== */}
      <div className="admin-encadreurs-stats">
        <div className="admin-encadreurs-stat-card">
          <div className="admin-encadreurs-stat-icon-wrapper" style={{ background: '#E1ECFE', color: '#6BA9E6' }}>
            <FaUserTie />
          </div>
          <div className="admin-encadreurs-stat-content">
            <span className="admin-encadreurs-stat-value">{stats.total}</span>
            <span className="admin-encadreurs-stat-label">Total encadreurs</span>
          </div>
        </div>
        <div className="admin-encadreurs-stat-card">
          <div className="admin-encadreurs-stat-icon-wrapper" style={{ background: '#D1FAE5', color: '#22C55E' }}>
            <FaBriefcase />
          </div>
          <div className="admin-encadreurs-stat-content">
            <span className="admin-encadreurs-stat-value" style={{ color: '#22C55E' }}>{stats.professionnels}</span>
            <span className="admin-encadreurs-stat-label">Encadreurs pro.</span>
          </div>
        </div>
        <div className="admin-encadreurs-stat-card">
          <div className="admin-encadreurs-stat-icon-wrapper" style={{ background: '#DBEAFE', color: '#6BA9E6' }}>
            <FaChalkboardTeacher />
          </div>
          <div className="admin-encadreurs-stat-content">
            <span className="admin-encadreurs-stat-value" style={{ color: '#6BA9E6' }}>{stats.pedagogiques}</span>
            <span className="admin-encadreurs-stat-label">Tuteurs pédago.</span>
          </div>
        </div>
        <div className="admin-encadreurs-stat-card">
          <div className="admin-encadreurs-stat-icon-wrapper" style={{ background: '#FEF3C7', color: '#F59E0B' }}>
            <FaUsers />
          </div>
          <div className="admin-encadreurs-stat-content">
            <span className="admin-encadreurs-stat-value" style={{ color: '#F59E0B' }}>{stats.totalEtudiants}</span>
            <span className="admin-encadreurs-stat-label">Étudiants encadrés</span>
          </div>
        </div>
      </div>

      {/* ===== FILTRES ===== */}
      <div className="admin-encadreurs-filters">
        <div className="admin-encadreurs-filter-group">
          <label><FaFilter /> Filtres</label>
          <SelectPersonnalise
            value={filterType}
            onChange={setFilterType}
            options={typeOptions}
            className="admin-encadreurs-filter-select"
          />
          <SelectPersonnalise
            value={filterFonction}
            onChange={setFilterFonction}
            options={fonctionOptions}
            className="admin-encadreurs-filter-select"
          />
        </div>
        <div className="admin-encadreurs-filter-group admin-encadreurs-search-group">
          <FaSearch className="admin-encadreurs-search-icon" />
          <input
            type="text"
            placeholder="Rechercher un encadreur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-encadreurs-search-input"
          />
        </div>
      </div>

      {/* ===== TABLEAU RÉDUIT ===== */}
      <div className="admin-encadreurs-table-container">
        <table className="admin-encadreurs-table">
          <thead>
            <tr>
              <th>Encadreur</th>
              <th>Type</th>
              <th>Contact</th>
              <th>Fonction</th>
              <th>Entreprise</th>
              <th>Étudiants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEncadreurs.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-encadreurs-empty">Aucun encadreur trouvé</td>
              </tr>
            ) : (
              paginatedEncadreurs.map((encadreur) => (
                <tr key={encadreur.id}>
                  <td>
                    <div className="admin-encadreurs-user">
                      <span className="admin-encadreurs-avatar">{encadreur.prenom[0]}{encadreur.nom[0]}</span>
                      <div>
                        <div className="admin-encadreurs-name">{encadreur.prenom} {encadreur.nom}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={getTypeBadge(encadreur.type)}>
                      {getTypeLabel(encadreur.type)}
                    </span>
                  </td>
                  <td>
                    <div className="admin-encadreurs-contact">
                      <div className="admin-encadreurs-email">{encadreur.email}</div>
                      <div className="admin-encadreurs-phone">{encadreur.telephone}</div>
                    </div>
                  </td>
                  <td><span className="admin-encadreurs-fonction-badge">{encadreur.fonction}</span></td>
                  <td>{encadreur.entreprise}</td>
                  <td>
                    <span className="admin-encadreurs-etudiants-badge">
                      <FaUsers /> {encadreur.etudiants.length}
                    </span>
                  </td>
                  <td>
                    <div className="admin-encadreurs-actions">
                      <button className="admin-encadreurs-btn-icon" onClick={() => openDetailModal(encadreur)} title="Voir"><FaEye /></button>
                      <button className="admin-encadreurs-btn-icon" onClick={() => openEditModal(encadreur)} title="Modifier"><FaEdit /></button>
                      <button className="admin-encadreurs-btn-icon danger" onClick={() => openDeleteModal(encadreur)} title="Supprimer"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="admin-encadreurs-pagination">
            <button className="admin-encadreurs-pagination-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
              <FaChevronLeft />
            </button>
            <span className="admin-encadreurs-pagination-info">Page {currentPage} sur {totalPages}</span>
            <button className="admin-encadreurs-pagination-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* ===== MODALES ===== */}
      {showEditModal && (
        <EncadreurForm
          title="Modifier l'encadreur"
          submitLabel="Modifier"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onCancel={() => { setShowEditModal(false); resetForm(); }}
          typeOptions={typeOptions}
          fonctionOptions={fonctionOptions}
        />
      )}

      {showDeleteModal && (
        <EncadreurDelete
          encadreur={selectedEncadreur}
          onConfirm={handleDelete}
          onCancel={() => { setShowDeleteModal(false); setSelectedEncadreur(null); }}
        />
      )}

      {showDetailModal && (
        <EncadreurDetail
          encadreur={selectedEncadreur}
          onClose={() => { setShowDetailModal(false); setSelectedEncadreur(null); }}
        />
      )}
    </div>
  );
}

export default AdminEncadreurs;