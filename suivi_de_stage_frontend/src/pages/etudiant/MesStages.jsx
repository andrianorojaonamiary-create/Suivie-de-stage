import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEye, FaEdit, FaTrash, FaBuilding, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { internshipsApi } from '../../api';
import { toast } from 'react-toastify';
import { mapInternshipList, getStatutBadge } from '../../utils/internshipMapping';

function MesStages() {
  const navigate = useNavigate();
  const [stages, setStages] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stageToDelete, setStageToDelete] = useState(null);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const res = await internshipsApi.getAll();
        const list = res?.data || (Array.isArray(res) ? res : []);
        setStages(mapInternshipList(list));
      } catch (err) {
        console.error('Erreur chargement mes stages:', err);
      }
    };
    fetchStages();
  }, []);

  const getStatusBadge = (statut) => getStatutBadge(statut);

  // ===== VOIR =====
  const handleView = (id) => {
    navigate(`/etudiant/stage/${id}`);
  };

  // ===== MODIFIER =====
  const handleEdit = (id) => {
    navigate(`/etudiant/stage/${id}`, {state : {editMode: true}});
  };

  // ===== SUPPRIMER =====
  const handleDeleteClick = (id) => {
    setStageToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (stageToDelete) {
        await internshipsApi.delete(stageToDelete);
      }
      setStages(stages.filter(s => s.id !== stageToDelete));
      toast.success('Stage supprimé avec succès !');
    } catch (err) {
      console.error('Erreur suppression stage:', err);
      toast.error('Erreur lors de la suppression du stage');
    } finally {
      setShowDeleteModal(false);
      setStageToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStageToDelete(null);
  };

  // ===== FORMATEUR DE DATE =====
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="etudiant-stages">
      <div className="page-header">
        <div>
          <h1>Mes stages</h1>
          <p className="text-muted">{stages.length} stage(s) enregistré(s)</p>
        </div>
        <Link to="/etudiant/ajouter-stage" className="btn-primary">
          <FaPlus /> Ajouter un stage
        </Link>
      </div>

      <div className="stages-grid">
        {stages.length === 0 ? (
          <div className="empty-state">
            <p>Vous n'avez pas encore de stage.</p>
            <Link to="/etudiant/ajouter-stage" className="btn-primary">
              Ajouter votre premier stage
            </Link>
          </div>
        ) : (
          stages.map((stage) => (
            <div key={stage.id} className="stage-card">
              <div className="stage-card-top">
                <h3>{stage.titre}</h3>
                <span className={`status-badge ${getStatusBadge(stage.statut)}`}>
                  {stage.statut}
                </span>
              </div>
              <div className="stage-card-middle">
                <p><FaBuilding /> {stage.entreprise}</p>
                <p><FaMapMarkerAlt /> {stage.ville}</p>
                <p><FaCalendarAlt /> {formatDate(stage.dateDebut)} → {formatDate(stage.dateFin)}</p>
              </div>
              <div className="stage-card-bottom">
                <span><strong>Tuteur :</strong> {stage.tuteur || 'Non renseigné'}</span>
                <span><strong>Encadreur :</strong> {stage.encadreur || 'Non renseigné'}</span>
              </div>
              <div className="stage-card-actions">
                <button className="btn-action" onClick={() => handleView(stage.id)} title="Voir">
                  <FaEye />
                </button>
                <button className="btn-action" onClick={() => handleEdit(stage.id)} title="Modifier">
                  <FaEdit />
                </button>
                <button className="btn-action btn-danger" onClick={() => handleDeleteClick(stage.id)} title="Supprimer">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ===== MODAL DE CONFIRMATION SUPPRESSION ===== */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmer la suppression</h3>
            <p>Voulez-vous vraiment supprimer ce stage ? Cette action est irréversible.</p>
            <div className="modal-actions">
              <button className="btn-danger" onClick={confirmDelete}>
                Supprimer
              </button>
              <button className="btn-secondary" onClick={cancelDelete}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MesStages;