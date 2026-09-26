// src/pages/admin/components/EtudiantDetail.jsx
import { FaTimes, FaEnvelope, FaPhone, FaGraduationCap } from 'react-icons/fa';

function EtudiantDetail({ etudiant, onClose }) {
  const getStatusBadge = (statut) => {
    if (statut === 'DIPLOME') return 'badge-diplome';
    return 'badge-actif';
  };

  if (!etudiant) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-detail" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><FaGraduationCap /> Détail de l'étudiant</h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item">
              <label>Nom complet</label>
              <span>{etudiant.prenom} {etudiant.nom}</span>
            </div>
            <div className="detail-item">
              <label>Matricule</label>
              <span>{etudiant.matricule}</span>
            </div>
            <div className="detail-item">
              <label>Email</label>
              <span><FaEnvelope /> {etudiant.email}</span>
            </div>
            <div className="detail-item">
              <label>Téléphone</label>
              <span><FaPhone /> {etudiant.telephone}</span>
            </div>
            <div className="detail-item">
              <label>Formation</label>
              <span>{etudiant.formation}</span>
            </div>
            <div className="detail-item">
              <label>Promotion</label>
              <span>{etudiant.promotion}</span>
            </div>
            <div className="detail-item">
              <label>Niveau</label>
              <span>{etudiant.niveau}</span>
            </div>
            <div className="detail-item">
              <label>Statut</label>
              <span className={getStatusBadge(etudiant.statut)}>{etudiant.statut}</span>
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

export default EtudiantDetail;