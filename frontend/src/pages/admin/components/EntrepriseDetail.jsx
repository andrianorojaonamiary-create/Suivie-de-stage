// src/pages/admin/components/EntrepriseDetail.jsx
import { FaTimes, FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUsers } from 'react-icons/fa';

function EntrepriseDetail({ entreprise, onClose }) {
  if (!entreprise) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-detail" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><FaBuilding /> Détail de l'entreprise</h3>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item">
              <label>Nom</label>
              <span><FaBuilding /> {entreprise.nom}</span>
            </div>
            <div className="detail-item">
              <label>Domaine</label>
              <span>{entreprise.domaine}</span>
            </div>
            <div className="detail-item">
              <label>Adresse</label>
              <span>{entreprise.adresse}</span>
            </div>
            <div className="detail-item">
              <label>Ville</label>
              <span><FaMapMarkerAlt /> {entreprise.ville}</span>
            </div>
            <div className="detail-item">
              <label>Téléphone</label>
              <span><FaPhone /> {entreprise.telephone}</span>
            </div>
            <div className="detail-item">
              <label>Email</label>
              <span><FaEnvelope /> {entreprise.email}</span>
            </div>
            <div className="detail-item">
              <label>Stagiaires</label>
              <span><FaUsers /> {entreprise.stagiaires}</span>
            </div>
            <div className="detail-item">
              <label>Coordonnées</label>
              <span>Lat: {entreprise.latitude} / Lon: {entreprise.longitude}</span>
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

export default EntrepriseDetail;