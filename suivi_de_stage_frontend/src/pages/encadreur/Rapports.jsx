import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaFileAlt, FaSearch, FaFilter, FaChevronLeft, FaChevronRight,
  FaCheckCircle, FaClock, FaEye, FaDownload, 
  FaFilePdf, FaFileWord, FaArrowLeft, FaCheck, FaTimes,
  FaTimesCircle, FaComment, FaBuilding, FaCalendarAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { internshipsApi, reportsApi } from '../../api';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';
import {
  mapReportStatus,
  mapReportType,
  formatReportSize,
  formatReportDate,
} from '../../utils/reportMapping';

function EncadreurRapports() {
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

  const [allRapports, setAllRapports] = useState([]);
  const [allStages, setAllStages] = useState([]);
  const [loadingRapports, setLoadingRapports] = useState(false);

  useEffect(() => {
    const fetchRapports = async () => {
      setLoadingRapports(true);
      try {
        const [reportsRes, stagesRes] = await Promise.allSettled([
          reportsApi.getAll({ limit: 100 }),
          internshipsApi.getAll({ limit: 100 }),
        ]);
        const stages = stagesRes.status === 'fulfilled'
          ? (stagesRes.value?.data || (Array.isArray(stagesRes.value) ? stagesRes.value : []))
          : [];
        setAllStages(stages);

        const stageById = new Map(stages.map((s) => [s.id, s]));
        const stageByEtudiant = new Map();
        stages.forEach((s) => {
          if (s.student?.id && !stageByEtudiant.has(s.student.id)) {
            stageByEtudiant.set(s.student.id, s);
          }
        });

        const items = reportsRes.status === 'fulfilled'
          ? (reportsRes.value?.items || reportsRes.value?.data || (Array.isArray(reportsRes.value) ? reportsRes.value : []))
          : [];
        setAllRapports(items.map(r => {
          const stage = stageById.get(r.stage?.id) || stageByEtudiant.get(r.stage?.etudiantId) || null;
          const etudiant = stage?.student?.user
            ? `${stage.student.user.prenom ?? ''} ${stage.student.user.nom ?? ''}`.trim()
            : 'Étudiant';
          return {
            id: r.id,
            etudiantId: r.stage?.etudiantId,
            etudiant,
            stage: r.stage?.intitule || 'Stage',
            entreprise: stage?.company?.nom || 'Entreprise',
            titre: mapReportType(r.type),
            fileName: r.originalName || r.fileName,
            date: formatReportDate(r.dateCreation),
            statut: mapReportStatus(r.statut),
            size: formatReportSize(r.size),
            commentaire: r.commentaire || '',
            raison: r.commentaire || ''
          };
        }));
      } catch (err) {
        console.error('Erreur chargement rapports:', err);
        toast.error('Erreur lors du chargement des rapports');
      } finally {
        setLoadingRapports(false);
      }
    };
    fetchRapports();
  }, []);

  const rapports = studentId
    ? allRapports.filter(r => String(r.etudiantId) === String(studentId))
    : allRapports;

  const getStudentName = () => {
    if (studentId) {
      const student = rapports[0]?.etudiant || allRapports.find(r => String(r.etudiantId) === String(studentId))?.etudiant;
      return student || '';
    }
    return '';
  };

  const studentName = getStudentName();

  const stagesAttendus = studentId
    ? allStages.filter(s => String(s.student?.id) === String(studentId)).length
    : allStages.length;

  const stats = {
    total: rapports.length,
    valides: rapports.filter(r => r.statut === 'Validé').length,
    revision: rapports.filter(r => r.statut === 'En révision').length,
    deposer: Math.max(0, stagesAttendus * 2 - rapports.length)
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

  const handleViewFile = async (rapport) => {
    if (!rapport?.id) return;
    const ext = (rapport.fileName || '').split('.').pop()?.toLowerCase();
    if (ext !== 'pdf') {
      handleDownloadFile(rapport);
      toast.info("Ce type de fichier (DOC/DOCX) ne peut pas s'afficher dans le navigateur. Téléchargement lancé.");
      return;
    }
    const win = window.open('', '_blank');
    try {
      const blob = await reportsApi.download(rapport.id);
      const url = URL.createObjectURL(blob);
      if (win) {
        win.location.href = url;
      } else {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Erreur:', error);
      if (win) win.close();
      toast.error('Erreur lors de l\'ouverture du fichier');
    }
  };

  const handleDownloadFile = async (rapport) => {
    if (!rapport?.id) return;
    try {
      const blob = await reportsApi.download(rapport.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = rapport.fileName || rapport.titre || 'rapport';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du téléchargement');
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

  const confirmValidate = async () => {
    if (!selectedRapport) return;
    try {
      await reportsApi.updateStatus(selectedRapport.id, {
        statut: 'APPROUVE',
        commentaire: commentaire.trim() || null,
      });
      setAllRapports(prev => prev.map(r =>
        r.id === selectedRapport.id
          ? { ...r, statut: 'Validé', commentaire: commentaire.trim() || '' }
          : r
      ));
      toast.success(`Rapport "${selectedRapport.titre}" validé avec succès !`);
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message ||
        'Erreur lors de la validation';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
    setShowValidateModal(false);
    setSelectedRapport(null);
    setCommentaire('');
  };

  const confirmReject = async () => {
    if (!commentaire.trim()) return;
    if (!selectedRapport) return;
    try {
      await reportsApi.updateStatus(selectedRapport.id, {
        statut: 'REJETE',
        commentaire: commentaire.trim(),
      });
      setAllRapports(prev => prev.map(r =>
        r.id === selectedRapport.id
          ? { ...r, statut: 'Refusé', raison: commentaire }
          : r
      ));
      toast.success(`Rapport "${selectedRapport.titre}" refusé`);
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message ||
        'Erreur lors du refus';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
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
      <div className="page-header">
        <div>
          {studentId && (
            <button className="btn-back-header" onClick={() => navigate('/encadreur/etudiants')}>
              <FaArrowLeft /> Retour
            </button>
          )}
          <h1>Rapports</h1>
          <p className="text-muted">
            {studentId ? `Rapports de ${studentName}` : 'Gérer les rapports des étudiants'}
          </p>
        </div>
      </div>

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

        {loadingRapports ? (
          <div className="empty-state">
            <div className="empty-icon"><FaFileAlt /></div>
            <h3>Chargement...</h3>
          </div>
        ) : filteredRapports.length === 0 ? (
          <div className="empty-state">
            <FaFileAlt className="empty-icon" />
            <h3>Aucun rapport</h3>
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
                      <td><strong>{rapport.etudiant}</strong></td>
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
                              onClick={() => handleViewFile(rapport)}
                              title="Voir le fichier"
                            >
                              <FaEye />
                            </button>
                            <button 
                              className="action-btn download" 
                              onClick={() => handleDownloadFile(rapport)}
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

export default EncadreurRapports;