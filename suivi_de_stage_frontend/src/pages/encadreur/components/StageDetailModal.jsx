import { useState, useEffect } from "react";
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
} from "react-icons/fa";
import { internshipsApi } from "../../../api";
import { mapInternship } from "../../../utils/internshipMapping";

function StageDetailModal({ stage, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchStage = async () => {
      if (!stage?.id) return;
      try {
        setLoading(true);
        setErrorMessage("");
        const data = await internshipsApi.getById(stage.id);
        setDetail(mapInternship(data));
      } catch (err) {
        console.error("Erreur chargement stage:", err);
        const raw = err?.response?.data?.message || err?.message || "";
        setErrorMessage(
          Array.isArray(raw) ? raw.join(", ") : raw || "Erreur lors du chargement du stage.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchStage();
  }, [stage]);

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
      "En cours": { className: "status-badge status-en-cours", label: "En cours" },
      "En attente": { className: "status-badge status-en-attente", label: "En attente" },
      "En attente de validation": { className: "status-badge status-en-attente", label: "En attente" },
      "À venir": { className: "status-badge status-en-attente", label: "À venir" },
      "Terminé": { className: "status-badge status-termine", label: "Terminé" },
      "Validé": { className: "status-badge status-valide", label: "Validé" },
      "Refusé": { className: "status-badge status-refuse", label: "Refusé" },
      "Suspendu": { className: "status-badge status-refuse", label: "Suspendu" },
      "Annulé": { className: "status-badge status-refuse", label: "Annulé" },
    };
    const badge = badges[statut] || badges["En attente"];
    return <span className={badge.className}>{badge.label}</span>;
  };

  if (!stage) return null;

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
          {loading && (
            <div className="stage-detail-loading" style={{ padding: "32px", textAlign: "center" }}>
              <div className="spinner"></div>
              <p>Chargement du stage...</p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="stage-detail-notfound" style={{ padding: "32px", textAlign: "center" }}>
              <FaInfoCircle className="notfound-icon" />
              <p>{errorMessage}</p>
            </div>
          )}

          {!loading && !errorMessage && detail && (
            <>
              {/* ===== STATUT ===== */}
              <div className="view-row view-status">
                <span className="view-label">Statut</span>
                <span className="view-value">{getStatusBadge(detail.statut)}</span>
              </div>

              {/* ===== ÉTUDIANT ===== */}
              <div className="view-row">
                <span className="view-label">
                  <FaUserGraduate /> Étudiant
                </span>
                <span className="view-value">
                  <strong>{detail.etudiant}</strong>
                </span>
              </div>

              {/* ===== TITRE ===== */}
              <div className="view-row">
                <span className="view-label">
                  <FaFileAlt /> Titre du stage
                </span>
                <span className="view-value">{detail.titre}</span>
              </div>

              {/* ===== ENTREPRISE ===== */}
              <div className="view-row">
                <span className="view-label">
                  <FaBuilding /> Entreprise
                </span>
                <span className="view-value">{detail.entreprise}</span>
              </div>

              {/* ===== VILLE ===== */}
              <div className="view-row">
                <span className="view-label">
                  <FaMapMarkerAlt /> Ville
                </span>
                <span className="view-value">{detail.ville}</span>
              </div>

              {/* ===== PÉRIODE ===== */}
              <div className="view-row">
                <span className="view-label">
                  <FaCalendarAlt /> Période
                </span>
                <span className="view-value">
                  {formatDate(detail.dateDebut)} → {formatDate(detail.dateFin)}
                </span>
              </div>

              {/* ===== ENCADREUR ===== */}
              <div className="view-row">
                <span className="view-label">
                  <FaUserTie /> Encadreur
                </span>
                <span className="view-value">{detail.encadreur || "Non renseigné"}</span>
              </div>

              {/* ===== TUTEUR ===== */}
              <div className="view-row">
                <span className="view-label">
                  <FaUserTie /> Tuteur
                </span>
                <span className="view-value">{detail.tuteur || "Non renseigné"}</span>
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
                      style={{ width: `${detail.progression || 0}%` }}
                    />
                  </div>
                  <span className="progress-text-view">
                    {detail.progression || 0}%
                  </span>
                </span>
              </div>

              {/* ===== ADRESSE ===== */}
              <div className="view-row view-description">
                <span className="view-label">
                  <FaMapMarkerAlt /> Adresse
                </span>
                <span className="view-value view-description-text">
                  {detail.adresse || "Non renseignée"}
                </span>
              </div>

              {/* ===== DESCRIPTION ===== */}
              <div className="view-row view-description">
                <span className="view-label">
                  <FaInfoCircle /> Description
                </span>
                <span className="view-value view-description-text">
                  {detail.description || "Non renseignée"}
                </span>
              </div>
            </>
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

export default StageDetailModal;