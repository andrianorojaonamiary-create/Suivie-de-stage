import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaUserGraduate, FaBuilding, FaCalendarAlt, 
  FaMapMarkerAlt, FaUserTie,FaInfoCircle, 
} from 'react-icons/fa';

function EncadreurStageDetail() {
  useParams();
  const navigate = useNavigate();
  const [stage] = useState(null);
  const [loading] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (statut) => {
    const badges = {
      'En cours': { className: 'status-badge status-en-cours', label: 'En cours' },
      'En attente': { className: 'status-badge status-en-attente', label: 'En attente' },
      'Terminé': { className: 'status-badge status-termine', label: 'Terminé' },
      'Validé': { className: 'status-badge status-valide', label: 'Validé' },
      'Refusé': { className: 'status-badge status-refuse', label: 'Refusé' }
    };
    const badge = badges[statut] || badges['En attente'];
    return <span className={badge.className}>{badge.label}</span>;
  };

  if (loading) {
    return (
      <div className="stage-detail-loading">
        <div className="spinner"></div>
        <p>Chargement du stage...</p>
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="stage-detail-notfound">
        <FaInfoCircle className="notfound-icon" />
        <h2>Stage non trouvé</h2>
        <p>Le stage que vous recherchez n'existe pas.</p>
        <button className="btn-back-detail" onClick={() => navigate('/encadreur/stages')}>
          <FaArrowLeft /> Retour
        </button>
      </div>
    );
  }

  return (
    <div className="encadreur-stage-detail">
      <div className="page-header">
        <div>
          <button className="btn-back-header" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Retour
          </button>
          <h1>{stage.titre}</h1>
          <p className="text-muted"><FaUserGraduate /> {stage.etudiant} · {stage.entreprise}</p>
        </div>
      </div>

      <div className="stage-detail-status">
        <div className="status-item">
          <span className="status-label">Statut du stage</span>
          {getStatusBadge(stage.statut)}
        </div>
        <div className="status-item">
          <span className="status-label">Progression</span>
          <span className="progress-text">{stage.progression}%</span>
        </div>
      </div>

      <div className="stage-detail-grid">
        <div className="detail-card">
          <div className="detail-card-header"><FaBuilding /> Entreprise</div>
          <div className="detail-card-body">
            <span className="detail-value">{stage.entreprise}</span>
            <span className="detail-sub"><FaMapMarkerAlt /> {stage.ville}</span>
          </div>
        </div>
        <div className="detail-card">
          <div className="detail-card-header"><FaCalendarAlt /> Période</div>
          <div className="detail-card-body">
            <span className="detail-value">{formatDate(stage.dateDebut)} → {formatDate(stage.dateFin)}</span>
          </div>
        </div>
        <div className="detail-card">
          <div className="detail-card-header"><FaUserTie /> Encadreur</div>
          <div className="detail-card-body">
            <span className="detail-value">{stage.encadreur || 'Non renseigné'}</span>
          </div>
        </div>
        <div className="detail-card">
          <div className="detail-card-header"><FaUserTie /> Tuteur</div>
          <div className="detail-card-body">
            <span className="detail-value">{stage.tuteur || 'Non renseigné'}</span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3><FaMapMarkerAlt /> Adresse</h3>
        <p>{stage.adresse || 'Non renseignée'}</p>
      </div>

      <div className="detail-section">
        <h3><FaInfoCircle /> Description</h3>
        <p>{stage.description || 'Non renseignée'}</p>
      </div>
    </div>
  );
}

export default EncadreurStageDetail;