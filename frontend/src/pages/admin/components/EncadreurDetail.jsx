// src/pages/admin/components/EncadreurDetail.jsx
import { FaTimes, FaEnvelope, FaPhone, FaBuilding, FaUsers, FaUserTie, FaChalkboardTeacher, FaBriefcase } from 'react-icons/fa';

function EncadreurDetail({ encadreur, onClose }) {
  if (!encadreur) return null;

  const getTypeBadge = (type) => {
    return type === 'professionnel' ? 'badge-professionnel' : 'badge-pedagogique';
  };

  const getTypeLabel = (type) => {
    return type === 'professionnel' ? 'Encadreur professionnel' : 'Tuteur pédagogique';
  };

  const getTypeIcon = (type) => {
    return type === 'professionnel' ? <FaBriefcase /> : <FaChalkboardTeacher />;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-detail" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><FaUserTie /> Détail de l'encadreur</h3>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item">
              <label>Nom complet</label>
              <span>{encadreur.prenom} {encadreur.nom}</span>
            </div>
            <div className="detail-item">
              <label>Type</label>
              <span className={getTypeBadge(encadreur.type)}>
                {getTypeIcon(encadreur.type)} {getTypeLabel(encadreur.type)}
              </span>
            </div>
            <div className="detail-item">
              <label>Email</label>
              <span><FaEnvelope /> {encadreur.email}</span>
            </div>
            <div className="detail-item">
              <label>Téléphone</label>
              <span><FaPhone /> {encadreur.telephone}</span>
            </div>
            <div className="detail-item">
              <label>Fonction</label>
              <span>{encadreur.fonction}</span>
            </div>
            <div className="detail-item">
              <label>Entreprise / Établissement</label>
              <span><FaBuilding /> {encadreur.entreprise}</span>
            </div>
            <div className="detail-item" style={{ gridColumn: 'span 2' }}>
              <label>Étudiants encadrés</label>
              <span><FaUsers /> {encadreur.etudiants.length}</span>
            </div>
          </div>
          {encadreur.etudiants.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6c7a8a', textTransform: 'uppercase' }}>Liste des étudiants</label>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
                {encadreur.etudiants.map((e, i) => (
                  <li key={i} style={{ padding: '4px 0', borderBottom: '1px solid #F5F8FC' }}>• {e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

export default EncadreurDetail;