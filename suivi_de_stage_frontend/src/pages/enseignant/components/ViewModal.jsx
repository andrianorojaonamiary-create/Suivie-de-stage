import {
  FaTimes,
  FaInfoCircle,
  FaUserGraduate,
  FaFileAlt,
  FaBuilding,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserTie,
  FaPercent,
  FaComment,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";

function ViewModal({ stage, isOpen, onClose }) {
  if (!isOpen || !stage) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (statut) => {
    const badges = {
      EN_COURS: {
        className: "badge-view badge-valide",
        icon: <FaCheckCircle />,
        label: "Validé",
      },
      REFUSE: {
        className: "badge-view badge-refuse",
        icon: <FaTimesCircle />,
        label: "Refusé",
      },
      EN_ATTENTE: {
        className: "badge-view badge-en-attente",
        icon: <FaClock />,
        label: "En attente",
      },
    };
    const badge = badges[statut] || badges.EN_ATTENTE;
    return (
      <span className={`badge-view ${badge.className}`}>
        {badge.icon} {badge.label}
      </span>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-detail-role" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FaInfoCircle className="modal-icon-view" /> Détails du stage
          </h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {/* ===== STATUT ===== */}
          <div className="view-row view-status">
            <span className="view-label">Statut</span>
            <span className="view-value">
              {getStatusBadge(stage.statutApi)}
            </span>
          </div>

          {/* ===== ÉTUDIANT ===== */}
          <div className="view-row">
            <span className="view-label">
              <FaUserGraduate /> Étudiant
            </span>
            <span className="view-value">
              <strong>{stage.etudiant}</strong>
            </span>
          </div>

          {/* ===== TITRE ===== */}
          <div className="view-row">
            <span className="view-label">
              <FaFileAlt /> Titre du stage
            </span>
            <span className="view-value">{stage.titre}</span>
          </div>

          {/* ===== ENTREPRISE ===== */}
          <div className="view-row">
            <span className="view-label">
              <FaBuilding /> Entreprise
            </span>
            <span className="view-value">{stage.entreprise}</span>
          </div>

          {/* ===== VILLE ===== */}
          <div className="view-row">
            <span className="view-label">
              <FaMapMarkerAlt /> Ville
            </span>
            <span className="view-value">{stage.ville}</span>
          </div>

          {/* ===== PÉRIODE ===== */}
          <div className="view-row">
            <span className="view-label">
              <FaCalendarAlt /> Période
            </span>
            <span className="view-value">
              {formatDate(stage.dateDebut)} → {formatDate(stage.dateFin)}
            </span>
          </div>

          {/* ===== TUTEUR ===== */}
          <div className="view-row">
            <span className="view-label">
              <FaUserTie /> Tuteur pédagogique
            </span>
            <span className="view-value">
              {stage.tuteur || "Non renseigné"}
            </span>
          </div>

          {/* ===== ENCADREUR ===== */}
          <div className="view-row">
            <span className="view-label">
              <FaUserTie /> Maître de stage
            </span>
            <span className="view-value">
              {stage.encadreur || "Non renseigné"}
            </span>
          </div>

          {/* ===== PROGRESSION ===== */}
          <div className="view-row">
            <span className="view-label">
              <FaPercent /> Progression
            </span>
            <span className="view-value">
              <div className="progress-bar-view">
                <div
                  className="progress-fill-view"
                  style={{ width: `${stage.progression || 0}%` }}
                />
              </div>
              <span className="progress-text-view">
                {stage.progression || 0}%
              </span>
            </span>
          </div>

          {/* ===== DESCRIPTION ===== */}
          <div className="view-row view-description">
            <span className="view-label">
              <FaInfoCircle /> Description
            </span>
            <span className="view-value view-description-text">
              {stage.description || "Non renseignée"}
            </span>
          </div>

          {/* ===== COMMENTAIRE ===== */}
          {stage.commentaireValidation && (
            <div className="view-row view-comment">
              <span className="view-label">
                <FaComment /> Commentaire
              </span>
              <span className="view-value view-comment-text">
                {stage.commentaireValidation}
              </span>
            </div>
          )}
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
