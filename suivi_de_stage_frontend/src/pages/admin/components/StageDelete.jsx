// src/pages/admin/components/StageDelete.jsx
import { FaTimes, FaTrash } from 'react-icons/fa';

function StageDelete({ stage, onConfirm, onCancel }) {
  if (!stage) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content modal-delete" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><FaTrash /> Confirmer la suppression</h3>
          <button className="modal-close" onClick={onCancel}><FaTimes /></button>
        </div>
        <div className="modal-body">
          <p>Êtes-vous sûr de vouloir supprimer le stage <strong>"{stage.titre}"</strong> ?</p>
          <p className="text-warning">⚠️ Cette action est irréversible.</p>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel}>Annuler</button>
          <button className="btn-danger" onClick={onConfirm}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}

export default StageDelete;