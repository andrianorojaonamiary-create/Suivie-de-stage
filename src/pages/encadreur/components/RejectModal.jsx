import { 
  FaTimesCircle, FaTimes, FaSpinner, FaFileAlt, 
  FaBuilding, FaCalendarAlt, FaComment
} from 'react-icons/fa';

function RejectModal({ stage, isOpen, onClose, onConfirm, loading, commentaire, setCommentaire }) {
  if (!isOpen || !stage) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isCommentValid = commentaire && commentaire.trim() !== '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FaTimesCircle className="modal-icon-reject" /> Refuser le stage</h2>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>
        
        <div className="modal-body">
          <p className="modal-question">
            Voulez-vous <strong className="text-danger">refuser</strong> le stage de <strong>{stage.etudiant}</strong> ?
          </p>
          
          <div className="stage-summary">
            <div className="summary-item"><FaFileAlt /> {stage.titre}</div>
            <div className="summary-item"><FaBuilding /> {stage.entreprise}</div>
            <div className="summary-item"><FaCalendarAlt /> {formatDate(stage.dateDebut)} → {formatDate(stage.dateFin)}</div>
          </div>
          
          <div className="comment-section">
            <label><FaComment /> Commentaire (obligatoire)</label>
            <textarea
              className={`comment-textarea ${!isCommentValid ? 'error' : ''}`}
              placeholder="Justifiez votre refus..."
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              disabled={loading}
            />
            {!isCommentValid && <span className="error-message">Un commentaire est obligatoire pour refuser</span>}
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={onClose} disabled={loading}>
            Annuler
          </button>
          <button className="btn-modal-confirm btn-reject" onClick={onConfirm} disabled={loading || !isCommentValid}>
            {loading ? <FaSpinner className="spinner" /> : <><FaTimesCircle /> Refuser</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RejectModal;