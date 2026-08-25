import { 
  FaTimes, FaUserGraduate, FaEnvelope, FaPhone, 
  FaMapMarkerAlt, FaGraduationCap, FaBuilding, 
  FaCalendarAlt, FaClock, FaFileAlt, FaStar,
  FaCheckCircle, FaTimesCircle, FaBriefcase,
} from 'react-icons/fa';

function ViewStudentModal({ student, isOpen, onClose }) {
  if (!isOpen || !student) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (statut) => {
    const badges = {
      'En cours': { className: 'badge-view badge-en-cours', icon: <FaClock />, label: 'En cours' },
      'En attente': { className: 'badge-view badge-en-attente', icon: <FaClock />, label: 'En attente' },
      'Terminé': { className: 'badge-view badge-termine', icon: <FaCheckCircle />, label: 'Terminé' },
      'Validé': { className: 'badge-view badge-valide', icon: <FaCheckCircle />, label: 'Validé' },
      'Refusé': { className: 'badge-view badge-refuse', icon: <FaTimesCircle />, label: 'Refusé' }
    };
    const badge = badges[statut] || badges['En attente'];
    return <span className={`badge-view ${badge.className}`}>{badge.icon} {badge.label}</span>;
  };

  const getEvalBadge = (evalStatus) => {
    const badges = {
      'Validé': { className: 'badge-view badge-valide', label: 'Validé' },
      'À faire': { className: 'badge-view badge-en-attente', label: 'À faire' },
      'À corriger': { className: 'badge-view badge-refuse', label: 'À corriger' }
    };
    const badge = badges[evalStatus] || badges['À faire'];
    return <span className={`badge-view ${badge.className}`}>{badge.label}</span>;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FaUserGraduate className="modal-icon-view" /> Détails de l'étudiant</h2>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>
        
        <div className="modal-body">
          {/* ===== IDENTITÉ ===== */}
          <div className="view-row">
            <span className="view-label"><FaUserGraduate /> Nom complet</span>
            <span className="view-value"><strong>{student.prenom} {student.nom}</strong></span>
          </div>

          <div className="view-row">
            <span className="view-label"><FaGraduationCap /> Matricule</span>
            <span className="view-value">{student.matricule}</span>
          </div>

          <div className="view-row">
            <span className="view-label"><FaEnvelope /> Email</span>
            <span className="view-value">{student.email}</span>
          </div>

          <div className="view-row">
            <span className="view-label"><FaPhone /> Téléphone</span>
            <span className="view-value">{student.telephone || 'Non renseigné'}</span>
          </div>

          <div className="view-row">
            <span className="view-label"><FaMapMarkerAlt /> Ville</span>
            <span className="view-value">{student.ville}</span>
          </div>

          {/* ===== FORMATION ===== */}
          <div className="view-row">
            <span className="view-label"><FaGraduationCap /> Filière</span>
            <span className="view-value">{student.filiere}</span>
          </div>

          <div className="view-row">
            <span className="view-label"><FaGraduationCap /> Niveau</span>
            <span className="view-value">{student.niveau}</span>
          </div>

          {/* ===== STAGE ===== */}
          <div className="view-section-title">
            <FaBriefcase /> Informations du stage
          </div>

          <div className="view-row">
            <span className="view-label"><FaBuilding /> Entreprise</span>
            <span className="view-value"><strong>{student.stage.entreprise}</strong></span>
          </div>

          <div className="view-row">
            <span className="view-label"><FaBriefcase /> Titre du stage</span>
            <span className="view-value">{student.stage.titre}</span>
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
            <span className="view-label">Statut du stage</span>
            <span className="view-value">{getStatusBadge(student.stage.statut)}</span>
          </div>

          {/* ===== ENCADREUR ===== */}
          <div className="view-row">
            <span className="view-label"><FaUserGraduate /> Encadreur</span>
            <span className="view-value">{student.encadreur || 'Non renseigné'}</span>
          </div>

          {/* ===== RAPPORTS & ÉVALUATION ===== */}
          <div className="view-section-title">
            <FaFileAlt /> Suivi
          </div>

          <div className="view-row">
            <span className="view-label"><FaFileAlt /> Rapports</span>
            <span className="view-value">{student.rapports} rapport{student.rapports > 1 ? 's' : ''}</span>
          </div>

          <div className="view-row">
            <span className="view-label"><FaStar /> Évaluation</span>
            <span className="view-value">{getEvalBadge(student.evaluation)}</span>
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

export default ViewStudentModal;