import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEye, FaEdit, FaTrash, FaBuilding, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

function MesStages() {
  const navigate = useNavigate();
  const [stages, setStages] = useState([
    {
      id: 1,
      titre: 'Développement plateforme web RH',
      entreprise: 'TechMada SARL',
      ville: 'Antananarivo',
      adresse: 'Lot II M 77, Antananarivo',
      dateDebut: '2024-03-01',
      dateFin: '2024-09-15',
      statut: 'En cours',
      tuteur: 'Prof. Andrianivo',
      encadreur: 'M. Rakotomalala',
      description: 'Développement d\'une plateforme web de gestion des ressources humaines.'
    },
    {
      id: 2,
      titre: 'Application mobile de gestion',
      entreprise: 'Airtel Madagascar',
      ville: 'Antananarivo',
      adresse: 'Avenue de l\'Indépendance, Antananarivo',
      dateDebut: '2024-04-01',
      dateFin: '2024-10-01',
      statut: 'En attente',
      tuteur: 'Dr. Ranaivo',
      encadreur: 'Mme. Ralava',
      description: 'Développement d\'une application mobile de gestion des comptes clients.'
    },
  ]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stageToDelete, setStageToDelete] = useState(null);

  const getStatusBadge = (statut) => {
    const classes = {
      'En cours': 'badge-en-cours',
      'En attente': 'badge-en-attente',
      'Terminé': 'badge-termine',
      'Validé': 'badge-valide',
      'Refusé': 'badge-refuse',
    };
    return classes[statut] || 'badge-en-attente';
  };

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

  const confirmDelete = () => {
    setStages(stages.filter(s => s.id !== stageToDelete));
    setShowDeleteModal(false);
    setStageToDelete(null);
    alert('🗑️ Stage supprimé avec succès !');
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
            <p>📭 Vous n'avez pas encore de stage.</p>
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
            <h3>🗑️ Confirmer la suppression</h3>
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