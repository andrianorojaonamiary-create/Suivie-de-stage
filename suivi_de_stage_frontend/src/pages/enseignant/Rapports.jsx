import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaFileAlt, FaSearch, FaFilter, FaChevronLeft, FaChevronRight,
  FaCheckCircle, FaClock, FaEye, FaDownload, FaCheck, FaTimes,
   FaFilePdf, FaFileWord, FaArrowLeft, FaTimesCircle, FaComment,
  FaBuilding, FaCalendarAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';

function EnseignantRapports() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRapport, setSelectedRapport] = useState(null);
  const [commentaire, setCommentaire] = useState('');

  // ===== DONNÉES =====
  const [allRapports, setAllRapports] = useState([]);

  // ===== FILTRER PAR ÉTUDIANT =====
  const rapports = studentId 
    ? allRapports.filter(r => r.etudiantId === parseInt(studentId))
    : allRapports;

  // Récupérer le nom de l'étudiant
  const getStudentName = () => {
    if (studentId) {
      const student = allRapports.find(r => r.etudiantId === parseInt(studentId));
      return student ? student.etudiant : '';
    }
    return '';
  };

  const studentName = getStudentName();

  const stats = {
    total: rapports.length,
    valides: rapports.filter(r => r.statut === 'Validé').length,
    revision: rapports.filter(r => r.statut === 'En révision').length,
    deposer: rapports.filter(r => r.statut === 'À déposer').length
  };

  const filteredRapports = rapports.filter(r => {
    if (selectedStatus !== 'tous' && r.statut !== selectedStatus) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      return r.etudiant.toLowerCase().includes(term) ||
             r.stage.toLowerCase().includes(term) ||
             r.entreprise.toLowerCase().includes(term) ||
             r.titre.toLowerCase().includes(term);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredRapports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRapports = filteredRapports.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewFile = (fileName) => {
    if (fileName) {
      window.open(`/documents/${fileName}`, '_blank');
    }
  };

  const handleDownloadFile = (fileName) => {
    if (fileName) {
      const link = document.createElement('a');
      link.href = `/documents/${fileName}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openValidateModal = (rapport) => {
    setSelectedRapport(rapport);
    setCommentaire('');
    setShowValidateModal(true);
  };

  const openRejectModal = (rapport) => {
    setSelectedRapport(rapport);
    setCommentaire('');
    setShowRejectModal(true);
  };

  const closeModal = (type) => {
    if (type === 'validate') setShowValidateModal(false);
    else setShowRejectModal(false);
    setSelectedRapport(null);
    setCommentaire('');
  };

  const confirmValidate = () => {
    setAllRapports(prev => prev.map(r =>
      r.id === selectedRapport.id ? { ...r, statut: 'Validé' } : r
    ));
    toast.success(`Rapport "${selectedRapport.titre}" validé avec succès !`);
    setShowValidateModal(false);
    setSelectedRapport(null);
    setCommentaire('');
  };

  const confirmReject = () => {
    if (!commentaire.trim()) return;
    setAllRapports(prev => prev.map(r =>
      r.id === selectedRapport.id ? { ...r, statut: 'Refusé', raison: commentaire } : r
    ));
    toast.success(`Rapport "${selectedRapport.titre}" refusé`);
    setShowRejectModal(false);
    setSelectedRapport(null);
    setCommentaire('');
  };

  const getStatusBadge = (statut) => {
    const badges = {
      'Validé': 'badge-valide',
      'En révision': 'badge-en-cours',
      'À déposer': 'badge-en-attente',
      'Refusé': 'badge-refuse'
    };
    return <span className={`badge ${badges[statut] || 'badge-en-attente'}`}>{statut}</span>;
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileAlt style={{ color: '#A0B8D0' }} />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FaFilePdf style={{ color: '#E74C3C' }} />;
    if (ext === 'docx' || ext === 'doc') return <FaFileWord style={{ color: '#6BA9E6' }} />;
    return <FaFileAlt style={{ color: '#A0B8D0' }} />;
  };

  return (
    <div className="rapports-page">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div>
          {/* Bouton retour */}
          {studentId && (
            <button className="btn-back-header" onClick={() => navigate('/enseignant/etudiants')}>
              <FaArrowLeft /> Retour
            </button>
          )}
          
          {/* Titre */}
          <h1>Rapports</h1>
          
          {/* Sous-titre */}
          <p className="text-muted">
            {studentId 
              ? `Rapports de ${studentName}`
              : 'Gérez les rapports des étudiants'}
          </p>
        </div>
      </div>

      {/* ===== STATISTIQUES ===== */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon total"><FaFileAlt /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon done"><FaCheckCircle /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.valides}</span>
            <span className="stat-label">Validés</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active"><FaClock /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.revision}</span>
            <span className="stat-label">En révision</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending"><FaClock /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.deposer}</span>
            <span className="stat-label">À déposer</span>
          </div>
        </div>
      </div>

      {/* ===== TABLEAU ===== */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="toolbar-filters">
            <div className="filter-wrapper">
              <div className="filter-group">
                <FaFilter className="filter-icon" />
                <SelectPersonnalise
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={[
                    { value: 'tous', label: 'Tous les statuts' },
                    { value: 'Validé', label: 'Validé' },
                    { value: 'En révision', label: 'En révision' },
                    { value: 'À déposer', label: 'À déposer' },
                    { value: 'Refusé', label: 'Refusé' }
                  ]}
                />
              </div>
            </div>
          </div>
          
          <div className="search-wrapper">
            <div className="search-group">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm('')}>
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredRapports.length === 0 ? (
          <div className="empty-state">
            <FaFileAlt className="empty-icon" />
            <h3>Aucun rapport</h3>
            <p>Aucun rapport ne correspond à vos critères</p>
          </div>
        ) : (
          <>
            <table className="rapports-table">
              <thead>
                <tr>
                  {!studentId && <th>Étudiant</th>}
                  <th>Rapport</th>
                  <th>Stage</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th className="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRapports.map((rapport) => (
                  <tr key={rapport.id}>
                    {!studentId && (
                      <td>
                        <div className="student-cell">
                          <span className="student-name">{rapport.etudiant}</span>
                        </div>
                      </td>
                    )}
                    <td>
                      <div className="rapport-cell">
                        <div className="rapport-icon">
                          {getFileIcon(rapport.fileName)}
                        </div>
                        <div className="rapport-info">
                          <span className="rapport-title">{rapport.titre}</span>
                          <span className="rapport-meta">
                            {rapport.fileName || 'Fichier non déposé'} · {rapport.size}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="stage-cell">
                        <span className="stage-title">{rapport.stage}</span>
                        <span className="stage-company">{rapport.entreprise}</span>
                      </div>
                    </td>
                    <td>{rapport.date}</td>
                    <td>{getStatusBadge(rapport.statut)}</td>
                    <td>
                      <div className="action-buttons">
                        {rapport.fileName && (
                          <>
                            <button 
                              className="action-btn view" 
                              onClick={() => handleViewFile(rapport.fileName)}
                              title="Voir le fichier"
                            >
                              <FaEye />
                            </button>
                            <button 
                              className="action-btn download" 
                              onClick={() => handleDownloadFile(rapport.fileName)}
                              title="Télécharger"
                            >
                              <FaDownload />
                            </button>
                          </>
                        )}
                        {rapport.statut === 'En révision' && (
                          <>
                            <button 
                              className="action-btn validate" 
                              onClick={() => openValidateModal(rapport)}
                              title="Valider"
                            >
                              <FaCheck />
                            </button>
                            <button 
                              className="action-btn reject" 
                              onClick={() => openRejectModal(rapport)}
                              title="Refuser"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="page-btn"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft />
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                    onClick={() => goToPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button 
                  className="page-btn"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <FaChevronRight />
                </button>
                
                <span className="page-info">
                  {filteredRapports.length} rapport{filteredRapports.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== MODAL VALIDATION ===== */}
      {showValidateModal && selectedRapport && (
        <div className="modal-overlay" onClick={() => closeModal('validate')}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaCheckCircle className="modal-icon-validate" /> Valider le rapport</h2>
              <button className="modal-close" onClick={() => closeModal('validate')}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <p className="modal-question">
                Voulez-vous <strong>valider</strong> le rapport <strong>{selectedRapport.titre}</strong> de <strong>{selectedRapport.etudiant}</strong> ?
              </p>
              <div className="stage-summary">
                <div className="summary-item"><FaFileAlt /> {selectedRapport.titre}</div>
                <div className="summary-item"><FaBuilding /> {selectedRapport.entreprise}</div>
                <div className="summary-item"><FaCalendarAlt /> {selectedRapport.date}</div>
              </div>
              <div className="comment-section">
                <label><FaComment /> Commentaire (optionnel)</label>
                <textarea
                  className="comment-textarea"
                  placeholder="Ajouter un commentaire (optionnel)..."
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => closeModal('validate')}>Annuler</button>
              <button className="btn-modal-confirm btn-validate" onClick={confirmValidate}>
                <FaCheckCircle /> Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL REFUS ===== */}
      {showRejectModal && selectedRapport && (
        <div className="modal-overlay" onClick={() => closeModal('reject')}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaTimesCircle className="modal-icon-reject" /> Refuser le rapport</h2>
              <button className="modal-close" onClick={() => closeModal('reject')}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <p className="modal-question">
                Voulez-vous <strong className="text-danger">refuser</strong> le rapport <strong>{selectedRapport.titre}</strong> de <strong>{selectedRapport.etudiant}</strong> ?
              </p>
              <div className="stage-summary">
                <div className="summary-item"><FaFileAlt /> {selectedRapport.titre}</div>
                <div className="summary-item"><FaBuilding /> {selectedRapport.entreprise}</div>
                <div className="summary-item"><FaCalendarAlt /> {selectedRapport.date}</div>
              </div>
              <div className="comment-section">
                <label><FaComment /> Commentaire (obligatoire)</label>
                <textarea
                  className={`comment-textarea ${!commentaire.trim() ? 'error' : ''}`}
                  placeholder="Justifiez votre refus..."
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                />
                {!commentaire.trim() && <span className="error-message">Un commentaire est obligatoire pour refuser</span>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => closeModal('reject')}>Annuler</button>
              <button className="btn-modal-confirm btn-reject" onClick={confirmReject} disabled={!commentaire.trim()}>
                <FaTimesCircle /> Refuser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnseignantRapports;