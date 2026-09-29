import { 
  FaCheckCircle, FaTimes, FaSpinner, FaFileAlt, 
  FaBuilding, FaCalendarAlt, FaComment
} from 'react-icons/fa';

function ValidateModal({ stage, isOpen, onClose, onConfirm, loading, commentaire, setCommentaire }) {
  if (!isOpen || !stage) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FaCheckCircle className="modal-icon-validate" /> Valider le stage</h2>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>
        
        <div className="modal-body">
          <p className="modal-question">
            Voulez-vous <strong>valider</strong> le stage de <strong>{stage.etudiant}</strong> ?
          </p>
          
          <div className="stage-summary">
            <div className="summary-item"><FaFileAlt /> {stage.titre}</div>
            <div className="summary-item"><FaBuilding /> {stage.entreprise}</div>
            <div className="summary-item"><FaCalendarAlt /> {formatDate(stage.dateDebut)} → {formatDate(stage.dateFin)}</div>
          </div>
          
          <div className="comment-section">
            <label><FaComment /> Commentaire (optionnel)</label>
            <textarea
              className="comment-textarea"
              placeholder="Ajouter un commentaire (optionnel)..."
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={onClose} disabled={loading}>
            Annuler
          </button>
          <button className="btn-modal-confirm btn-validate" onClick={onConfirm} disabled={loading}>
            {loading ? <FaSpinner className="spinner" /> : <><FaCheckCircle /> Valider</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ValidateModal;