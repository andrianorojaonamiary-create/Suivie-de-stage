// src/pages/admin/components/StageDetail.jsx
import { FaTimes, FaList, FaUserGraduate, FaBuilding, FaUserTie, FaCalendarAlt, FaClock } from 'react-icons/fa';

function StageDetail({ stage, onClose }) {
  if (!stage) return null;

  const getStatusBadge = (statut) => {
    const classes = {
      'À venir': 'badge-a-venir',
      'En cours': 'badge-en-cours',
      'Terminé': 'badge-termine'
    };
    return classes[statut] || 'badge-en-cours';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-detail" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><FaList /> Détail du stage</h3>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item" style={{ gridColumn: 'span 2' }}>
              <label>Titre</label>
              <span style={{ fontSize: 18, fontWeight: 700 }}>{stage.titre}</span>
            </div>
            <div className="detail-item">
              <label>Étudiant</label>
              <span><FaUserGraduate /> {stage.etudiant}</span>
            </div>
            <div className="detail-item">
              <label>Entreprise</label>
              <span><FaBuilding /> {stage.entreprise}</span>
            </div>
            <div className="detail-item">
              <label>Encadreur</label>
              <span><FaUserTie /> {stage.encadreur}</span>
            </div>
            <div className="detail-item">
              <label>Domaine</label>
              <span>{stage.domaine}</span>
            </div>
            <div className="detail-item">
              <label>Période</label>
              <span><FaCalendarAlt /> {stage.dateDebut} → {stage.dateFin}</span>
            </div>
            <div className="detail-item">
              <label>Statut</label>
              <span className={getStatusBadge(stage.statut)}>{stage.statut}</span>
            </div>
            <div className="detail-item">
              <label>Progression</label>
              <span><FaClock /> {stage.progression}%</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

export default StageDetail;