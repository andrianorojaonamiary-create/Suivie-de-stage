import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaFileAlt,
  FaCheck,
  FaTimes,
  FaEye,
  FaClock,
  FaFilter,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { internshipsApi } from "../../api";
import {
  mapInternshipList,
  STATUT_LABELS,
} from "../../utils/internshipMapping";
import SelectPersonnalise from "../../components/Common/SelectPersonnalise";

// Composants Modals
import ViewModal from "./components/ViewModal";
import ValidateModal from "./components/ValidateModal";
import RejectModal from "./components/RejectModal";

function StagesEnseignant() {
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("tous");
  const [searchTerm, setSearchTerm] = useState("");

  // ===== MODALS =====
  const [modalValidateOpen, setModalValidateOpen] = useState(false);
  const [modalRejectOpen, setModalRejectOpen] = useState(false);
  const [modalViewOpen, setModalViewOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [commentaire, setCommentaire] = useState("");

  // ===== PAGINATION =====
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ===== DONNÉES API =====
  const [stages, setStages] = useState([]);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const res = await internshipsApi.getAll();
        const list = res?.data || (Array.isArray(res) ? res : []);
        setStages(mapInternshipList(list));
      } catch (err) {
        console.error("Erreur chargement stages enseignant:", err);
      }
    };
    fetchStages();
  }, []);

  // ===== STATISTIQUES =====
  const stats = {
    enAttente: stages.filter((s) => s.statutApi === "EN_ATTENTE").length,
    valides: stages.filter((s) => s.statutApi === "EN_COURS").length,
    refuses: stages.filter((s) => s.statutApi === "REFUSE").length,
    total: stages.length,
  };

  // ===== FILTRAGE ET RECHERCHE =====
  const filteredStages = stages.filter((s) => {
    if (selectedStatus !== "tous" && s.statutApi !== selectedStatus)
      return false;

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim();
      return (
        s.etudiant.toLowerCase().includes(term) ||
        s.titre.toLowerCase().includes(term) ||
        s.entreprise.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // ===== PAGINATION =====
  const totalPages = Math.ceil(filteredStages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStages = filteredStages.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleFilterChange = (value) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // ===== FORMAT DATE =====
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ===== BADGE STATUT =====
  const getStatusBadge = (statut) => {
    const badges = {
      EN_COURS: { className: "status-badge status-valide", label: "Validé" },
      REFUSE: { className: "status-badge status-refuse", label: "Refusé" },
      EN_ATTENTE: {
        className: "status-badge status-en-attente",
        label: "En attente",
      },
    };
    const badge = badges[statut] || {
      className: "status-badge status-en-attente",
      label: STATUT_LABELS[statut] || "En attente",
    };
    return <span className={badge.className}>{badge.label}</span>;
  };

  // ===== ACTIONS =====
  const openValidateModal = (stage) => {
    setSelectedStage(stage);
    setCommentaire("");
    setModalValidateOpen(true);
  };

  const openRejectModal = (stage) => {
    setSelectedStage(stage);
    setCommentaire("");
    setModalRejectOpen(true);
  };

  const openViewModal = (stage) => {
    setSelectedStage(stage);
    setModalViewOpen(true);
  };

  const closeValidateModal = () => {
    if (!loading) {
      setModalValidateOpen(false);
      setSelectedStage(null);
      setCommentaire("");
    }
  };

  const closeRejectModal = () => {
    if (!loading) {
      setModalRejectOpen(false);
      setSelectedStage(null);
      setCommentaire("");
    }
  };

  const closeViewModal = () => {
    setModalViewOpen(false);
    setSelectedStage(null);
  };

  const confirmValidate = async () => {
    setLoading(true);
    try {
      const payload = { statut: "EN_COURS" };
      const trimmed = commentaire?.trim();
      if (trimmed && trimmed.length >= 2) payload.observations = trimmed;
      await internshipsApi.update(selectedStage.id, payload);
      setStages((prev) =>
        prev.map((s) =>
          s.id === selectedStage.id
            ? {
                ...s,
                statutApi: "EN_COURS",
                statut: "Validé",
                commentaireValidation: commentaire,
              }
            : s,
        ),
      );
      toast.success(`Stage "${selectedStage?.titre}" validé avec succès !`);
    } catch {
      toast.error("Erreur lors de la validation");
    } finally {
      setLoading(false);
      setModalValidateOpen(false);
      setSelectedStage(null);
      setCommentaire("");
    }
  };

  const confirmReject = async () => {
    if (!commentaire || commentaire.trim() === "") {
      toast.warning("Veuillez ajouter un commentaire pour justifier le refus");
      return;
    }
    setLoading(true);
    try {
      await internshipsApi.update(selectedStage.id, {
        statut: "REFUSE",
        observations: commentaire,
      });
      setStages((prev) =>
        prev.map((s) =>
          s.id === selectedStage.id
            ? {
                ...s,
                statutApi: "REFUSE",
                statut: "Refusé",
                commentaireValidation: commentaire,
              }
            : s,
        ),
      );
      toast.success(`Stage "${selectedStage?.titre}" refusé.`);
    } catch {
      toast.error("Erreur lors du refus");
    } finally {
      setLoading(false);
      setModalRejectOpen(false);
      setSelectedStage(null);
      setCommentaire("");
    }
  };

  const statusOptions = [
    { value: "tous", label: "Tous les statuts" },
    { value: "EN_ATTENTE", label: "En attente" },
    { value: "EN_COURS", label: "Validé" },
    { value: "REFUSE", label: "Refusé" },
  ];

  return (
    <div className="enseignant-stages">
      {/* ===== EN-TÊTE ===== */}
      <div className="page-header">
        <div>
          <h1>Stages à valider</h1>
          <p className="text-muted">
            Gérez les stages en attente de validation
          </p>
        </div>
      </div>

      {/* ===== STATISTIQUES ===== */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon pending">
            <FaClock />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.enAttente}</span>
            <span className="stat-label">En attente</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon validated">
            <FaCheck />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.valides}</span>
            <span className="stat-label">Validés</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon rejected">
            <FaTimes />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.refuses}</span>
            <span className="stat-label">Refusés</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon total">
            <FaFileAlt />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
      </div>

      {/* ===== TABLEAU ===== */}
      <div className="table-container">
        {/* ===== TOOLBAR ===== */}
        <div className="table-toolbar">
          <div className="toolbar-filters">
            <div className="filter-wrapper">
              <div className="filter-group">
                <FaFilter className="filter-icon" />
                <SelectPersonnalise
                  value={selectedStatus}
                  onChange={handleFilterChange}
                  options={statusOptions}
                />
              </div>
            </div>
          </div>

          <div className="search-wrapper">
            <div className="search-group">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              {searchTerm && (
                <button
                  className="search-clear"
                  onClick={() => setSearchTerm("")}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ===== TABLEAU ===== */}
        {filteredStages.length === 0 ? (
          <div className="empty-state">
            <FaFileAlt className="empty-icon" />
            <h3>Aucun stage trouvé</h3>
          </div>
        ) : (
          <>
            <table className="stages-table">
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>Stage</th>
                  <th>Entreprise</th>
                  <th>Période</th>
                  <th>Statut</th>
                  <th className="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStages.map((stage) => (
                  <tr key={stage.id}>
                    <td>
                      <div className="stage-student">
                        <span className="student-name">{stage.etudiant}</span>
                      </div>
                    </td>
                    <td>
                      <div className="stage-title-cell">
                        <span className="stage-title">{stage.titre}</span>
                      </div>
                    </td>
                    <td>
                      <div className="stage-company-cell">
                        <span className="company-name">{stage.entreprise}</span>
                      </div>
                    </td>
                    <td>
                      <span className="date-text">
                        {formatDate(stage.dateDebut)} →{" "}
                        {formatDate(stage.dateFin)}
                      </span>
                    </td>
                    <td>{getStatusBadge(stage.statutApi)}</td>
                    <td>
                      <div className="action-buttons">
                        {stage.statutApi === "EN_ATTENTE" && (
                          <>
                            <button
                              className="action-btn validate"
                              onClick={() => openValidateModal(stage)}
                              title="Valider le stage"
                            >
                              <FaCheck />
                            </button>
                            <button
                              className="action-btn reject"
                              onClick={() => openRejectModal(stage)}
                              title="Refuser le stage"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        <button
                          className="action-btn view"
                          onClick={() => openViewModal(stage)}
                          title="Voir les détails du stage"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ===== PAGINATION ===== */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft />
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={`page-btn ${currentPage === index + 1 ? "active" : ""}`}
                    onClick={() => goToPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  className="page-btn"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <FaChevronRight />
                </button>

                <span className="page-info">
                  {filteredStages.length} stage
                  {filteredStages.length > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== MODALS ===== */}
      <ValidateModal
        stage={selectedStage}
        isOpen={modalValidateOpen}
        onClose={closeValidateModal}
        onConfirm={confirmValidate}
        loading={loading}
        commentaire={commentaire}
        setCommentaire={setCommentaire}
      />

      <RejectModal
        stage={selectedStage}
        isOpen={modalRejectOpen}
        onClose={closeRejectModal}
        onConfirm={confirmReject}
        loading={loading}
        commentaire={commentaire}
        setCommentaire={setCommentaire}
      />

      <ViewModal
        stage={selectedStage}
        isOpen={modalViewOpen}
        onClose={closeViewModal}
      />
    </div>
  );
}

export default StagesEnseignant;
