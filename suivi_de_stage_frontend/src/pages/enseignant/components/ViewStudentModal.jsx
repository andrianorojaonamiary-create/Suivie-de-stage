import { useEffect, useState } from 'react';
import { 
  FaTimes, FaUserGraduate, FaEnvelope, FaPhone, 
  FaMapMarkerAlt, FaGraduationCap, FaBuilding, 
  FaCalendarAlt, FaClock, FaFileAlt, FaStar, FaInfoCircle,
  FaFilePdf, FaFileWord, FaDownload, FaEye, FaComment
} from 'react-icons/fa';
import { reportsApi } from '../../../api';
import {
  mapReportStatus,
  mapReportType,
  formatReportSize,
  formatReportDate,
} from '../../../utils/reportMapping';

function ViewStudentModal({ student, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('info');
  const [rapports, setRapports] = useState([]);
  const [rapportsLoading, setRapportsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !student) return;
    const stageId = student.stage?.id;
    if (!stageId) return;
    reportsApi
      .byStage(stageId)
      .then((res) => {
        const items = Array.isArray(res) ? res : res?.data || res?.items || [];
        setRapports(items.map(r => ({
          id: r.id,
          titre: mapReportType(r.type),
          fileName: r.fileName,
          date: formatReportDate(r.dateCreation),
          statut: mapReportStatus(r.statut),
          size: formatReportSize(r.size)
        })));
      })
      .catch((err) => {
        console.error('Erreur chargement rapports:', err);
        setRapports([]);
      })
      .finally(() => setRapportsLoading(false));
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (statut) => {
    const badges = {
      'En cours': { className: 'badge-view status-en-cours', label: 'En cours' },
      'En attente': { className: 'badge-view status-en-attente', label: 'En attente' },
      'Terminé': { className: 'badge-view status-termine', label: 'Terminé' },
      'Validé': { className: 'badge-view status-valide', label: 'Validé' },
      'Refusé': { className: 'badge-view status-refuse', label: 'Refusé' }
    };
    const badge = badges[statut] || badges['En attente'];
    return <span className={badge.className}>{badge.label}</span>;
  };

  const getEvalBadge = (evalStatus) => {
    const badges = {
      'Validé': { className: 'badge-view eval-valide', label: 'Validé' },
      'À faire': { className: 'badge-view eval-a-faire', label: 'À faire' },
      'À corriger': { className: 'badge-view eval-corriger', label: 'À corriger' }
    };
    const badge = badges[evalStatus] || badges['À faire'];
    return <span className={badge.className}>{badge.label}</span>;
  };

  const getRapportBadge = (statut) => {
    const badges = {
      'Validé': 'badge-view rapp-valide',
      'En révision': 'badge-view rapp-revision',
      'À déposer': 'badge-view rapp-deposer'
    };
    return <span className={badges[statut] || 'badge-view rapp-deposer'}>{statut}</span>;
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileAlt />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FaFilePdf style={{ color: '#E74C3C' }} />;
    if (ext === 'docx' || ext === 'doc') return <FaFileWord style={{ color: '#6BA9E6' }} />;
    return <FaFileAlt />;
  };

  const getStars = (note) => {
    if (!note) return null;
    const stars = Math.round(note / 4);
    return '★'.repeat(Math.min(stars, 5)) + '☆'.repeat(Math.max(0, 5 - Math.min(stars, 5)));
  };

  // ===== DONNÉES SIMULÉES =====
  const evaluations = [
    { id: 1, type: 'Tuteur pédagogique', date: '15 Mai 2024', statut: 'Validé', note: '16.5', commentaire: 'Bon travail, étudiant sérieux' },
    { id: 2, type: 'Maître de stage', date: '20 Mai 2024', statut: 'Validé', note: '17.0', commentaire: 'Très impliqué dans les projets' },
    { id: 3, type: 'Entreprise', date: '25 Mai 2024', statut: 'À faire', note: null, commentaire: null }
  ];

  const tabs = [
    { id: 'info', label: 'Informations', icon: <FaInfoCircle /> },
    { id: 'evaluations', label: 'Évaluations', icon: <FaStar /> },
    { id: 'rapports', label: 'Rapports', icon: <FaFileAlt /> }
  ];

  const handleViewFile = async (rapport) => {
    if (!rapport?.id) return;
    try {
      const blob = await reportsApi.download(rapport.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur:', error);
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
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-view" onClick={(e) => e.stopPropagation()}>
        {/* ===== HEADER ===== */}
        <div className="modal-header modal-view-header">
          <h2><FaUserGraduate className="modal-icon-view" /> {student.nom}</h2>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>
        
        {/* ===== TABS ===== */}
        <div className="modal-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`modal-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ===== CONTENU ===== */}
        <div className="modal-body modal-view-body">
          {/* ===== TAB INFORMATIONS ===== */}
          {activeTab === 'info' && (
            <>
              <div className="view-row">
                <span className="view-label"><FaUserGraduate /> Matricule</span>
                <span className="view-value">{student.matricule}</span>
              </div>

              <div className="view-row">
                <span className="view-label"><FaGraduationCap /> Filière</span>
                <span className="view-value">{student.filiere}</span>
              </div>

              <div className="view-row">
                <span className="view-label"><FaGraduationCap /> Niveau</span>
                <span className="view-value">{student.niveau}</span>
              </div>

              <div className="view-row">
                <span className="view-label"><FaEnvelope /> Email</span>
                <span className="view-value">{student.email || 'Non renseigné'}</span>
              </div>

              <div className="view-row">
                <span className="view-label"><FaPhone /> Téléphone</span>
                <span className="view-value">{student.telephone || 'Non renseigné'}</span>
              </div>

              <div className="view-row">
                <span className="view-label"><FaMapMarkerAlt /> Ville</span>
                <span className="view-value">{student.ville || 'Non renseignée'}</span>
              </div>

              <div className="view-section-divider"></div>

              <div className="view-row">
                <span className="view-label"><FaBuilding /> Stage</span>
                <span className="view-value"><strong>{student.stage.titre}</strong></span>
              </div>

              <div className="view-row">
                <span className="view-label"><FaBuilding /> Entreprise</span>
                <span className="view-value">{student.stage.entreprise}</span>
              </div>

              <div className="view-row">
                <span className="view-label"><FaCalendarAlt /> Période</span>
                <span className="view-value">{formatDate(student.stage.dateDebut)} → {formatDate(student.stage.dateFin)}</span>
              </div>

              <div className="view-row">
                <span className="view-label"><FaClock /> Progression</span>
                <span className="view-value">
                  <div className="progress-bar-view">
                    <div className="progress-fill-view" style={{ width: `${student.stage.progression}%` }} />
                  </div>
                  <span className="progress-text-view">{student.stage.progression}%</span>
                </span>
              </div>

              <div className="view-row">
                <span className="view-label">Statut</span>
                <span className="view-value">{getStatusBadge(student.stage.statut)}</span>
              </div>

              <div className="view-row">
                <span className="view-label"><FaStar /> Évaluation</span>
                <span className="view-value">{getEvalBadge(student.evaluation)}</span>
              </div>
            </>
          )}

          {/* ===== TAB ÉVALUATIONS ===== */}
          {activeTab === 'evaluations' && (
            <div className="view-evaluations">
              {evaluations.length === 0 ? (
                <div className="view-empty">
                  <FaStar className="view-empty-icon" />
                  <p>Aucune évaluation disponible</p>
                </div>
              ) : (
                evaluations.map((evalItem) => (
                  <div key={evalItem.id} className="view-eval-item">
                    <div className="view-eval-header">
                      <span className="view-eval-type">{evalItem.type}</span>
                      <span className="view-eval-date">{evalItem.date}</span>
                      {getEvalBadge(evalItem.statut)}
                    </div>
                    <div className="view-eval-body">
                      <div className="view-eval-note">
                        <span className="view-eval-note-label">Note</span>
                        <span className="view-eval-note-value">{evalItem.note || '—'}</span>
                        {evalItem.note && (
                          <span className="view-eval-stars">{getStars(evalItem.note)}</span>
                        )}
                      </div>
                      {evalItem.commentaire && (
                        <div className="view-eval-comment">
                          <span className="view-eval-comment-label"><FaComment /> Commentaire</span>
                          <p>{evalItem.commentaire}</p>
                        </div>
                      )}
                    </div>
                    {evalItem.statut === 'À faire' && (
                      <div className="view-eval-footer">
                        <button className="btn-view-eval-start">
                          <FaStar /> Commencer l'évaluation
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ===== TAB RAPPORTS ===== */}
          {activeTab === 'rapports' && (
            <div className="view-rapports">
              {rapportsLoading ? (
                <div className="view-empty">
                  <FaFileAlt className="view-empty-icon" />
                  <p>Chargement des rapports...</p>
                </div>
              ) : rapports.length === 0 ? (
                <div className="view-empty">
                  <FaFileAlt className="view-empty-icon" />
                  <p>Aucun rapport disponible</p>
                </div>
              ) : (
                rapports.map((rapport) => (
                  <div key={rapport.id} className="view-rapport-item">
                    <div className="view-rapport-left">
                      <div className="view-rapport-icon">
                        {getFileIcon(rapport.fileName)}
                      </div>
                      <div className="view-rapport-info">
                        <span className="view-rapport-title">{rapport.titre}</span>
                        <span className="view-rapport-meta">
                          {rapport.fileName || 'Fichier non déposé'} · {rapport.size}
                        </span>
                      </div>
                    </div>
                    <div className="view-rapport-right">
                      <span className="view-rapport-date">{rapport.date}</span>
                      {getRapportBadge(rapport.statut)}
                      {rapport.fileName && (
                        <div className="view-rapport-actions">
                          <button className="btn-view-action" onClick={() => handleViewFile(rapport)} title="Voir">
                            <FaEye />
                          </button>
                          <button className="btn-view-action" onClick={() => handleDownloadFile(rapport)} title="Télécharger">
                            <FaDownload />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        <div className="modal-footer modal-view-footer">
          <button className="btn-modal-cancel" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewStudentModal;