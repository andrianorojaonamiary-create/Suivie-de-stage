import { 
  FaTimes, FaUserGraduate, FaBuilding, FaCalendarAlt, 
  FaMapMarkerAlt, FaUserTie, FaInfoCircle, FaComment,
  FaCheckCircle, FaTimesCircle, FaClock
} from 'react-icons/fa';

function ViewModal({ stage, isOpen, onClose }) {
  if (!isOpen || !stage) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (statut) => {
    const badges = {
      'valide': { className: 'badge-view badge-valide', icon: <FaCheckCircle />, label: 'Validé' },
      'refuse': { className: 'badge-view badge-refuse', icon: <FaTimesCircle />, label: 'Refusé' },
      'en_attente': { className: 'badge-view badge-en-attente', icon: <FaClock />, label: 'En attente' }
    };
    const badge = badges[statut] || badges['en_attente'];
    return <span className={`badge-view ${badge.className}`}>{badge.icon} {badge.label}</span>;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-view" onClick={(e) => e.stopPropagation()}>
        {/* ===== HEADER BLANC (pas de dégradé) ===== */}
        <div className="modal-header">
          <h2><FaInfoCircle className="modal-icon-view" /> Détails du stage</h2>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>
        
        <div className="modal-body modal-view-body">
          <div className="view-row">
            <span className="view-label"><FaUserGraduate /> Étudiant</span>
            <span className="view-value"><strong>{stage.etudiant}</strong></span>
          </div>

          <div className="view-row">
            <span className="view-label"><FaInfoCircle /> Titre du stage</span>
            <span className="view-value">{stage.titre}</span>
          </div>

          <div className="view-row">
            <span className="view-label"><FaBuilding /> Entreprise</span>
            <span className="view-value">{stage.entreprise}</span>
          </div>

          <div className="view-row">
            <span className="view-label"><FaMapMarkerAlt /> Ville</span>
            <span className="view-value">{stage.ville}</span>
          </div>

          <div className="view-row">
            <span className="view-label"><FaCalendarAlt /> Période</span>
            <span className="view-value">{formatDate(stage.dateDebut)} → {formatDate(stage.dateFin)}</span>
          </div>

          <div className="view-row">
            <span className="view-label"><FaUserTie /> Tuteur pédagogique</span>
            <span className="view-value">{stage.tuteur || 'Non renseigné'}</span>
          </div>

          <div className="view-row">
            <span className="view-label"><FaUserTie /> Maître de stage</span>
            <span className="view-value">{stage.encadreur || 'Non renseigné'}</span>
          </div>

          <div className="view-row">
            <span className="view-label">Progression</span>
            <span className="view-value">
              <div className="progress-bar-view">
                <div className="progress-fill-view" style={{ width: `${stage.progression || 0}%` }} />
              </div>
              <span className="progress-text-view">{stage.progression || 0}%</span>
            </span>
          </div>

          <div className="view-row view-description">
            <span className="view-label"><FaInfoCircle /> Description</span>
            <span className="view-value view-description-text">{stage.description || 'Non renseignée'}</span>
          </div>

          {stage.commentaireValidation && (
            <div className="view-row view-comment">
              <span className="view-label"><FaComment /> Commentaire</span>
              <span className="view-value view-comment-text">{stage.commentaireValidation}</span>
            </div>
          )}

          <div className="view-row view-status">
            <span className="view-label">Statut</span>
            <span className="view-value">{getStatusBadge(stage.statutValidation)}</span>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewModal;