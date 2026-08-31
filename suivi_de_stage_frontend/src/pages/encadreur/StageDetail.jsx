import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaUserGraduate, FaBuilding, FaCalendarAlt, 
  FaMapMarkerAlt, FaUserTie,FaInfoCircle, 
} from 'react-icons/fa';

function EncadreurStageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stage, setStage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const stages = {
        1: {
          id: 1,
          titre: "Développement d'une plateforme web de gestion RH",
          etudiant: 'Rakoto Miora',
          entreprise: 'TechMada SARL',
          ville: 'Antananarivo',
          adresse: 'Lot II M 77, Antananarivo',
          dateDebut: '2024-03-01',
          dateFin: '2024-09-15',
          statut: 'En cours',
          description: "Développement d'une plateforme web de gestion des ressources humaines avec React et Node.js.",
          encadreur: 'M. Rakotomalala',
          tuteur: 'Prof. Andrianivo',
          progression: 65
        },
        2: {
          id: 2,
          titre: "Migration et sécurisation du système d'information",
          etudiant: 'Ramanantsoa Tojo',
          entreprise: 'BNI Madagascar',
          ville: 'Antananarivo',
          adresse: 'Rue Ravoninahitriniarivo, Antananarivo',
          dateDebut: '2024-05-01',
          dateFin: '2024-11-01',
          statut: 'En attente',
          description: "Migration du système d'information vers une architecture sécurisée.",
          encadreur: 'M. Rakotomalala',
          tuteur: 'Prof. Andrianivo',
          progression: 15
        },
        3: {
          id: 3,
          titre: "Application de gestion des rendez-vous",
          etudiant: 'Razafindramary Fy',
          entreprise: 'Santé Plus',
          ville: 'Antananarivo',
          adresse: 'Lot II M 77, Antananarivo',
          dateDebut: '2024-08-01',
          dateFin: '2025-01-15',
          statut: 'En cours',
          description: "Application mobile de gestion des rendez-vous médicaux avec React Native.",
          encadreur: 'M. Rakotomalala',
          tuteur: 'Prof. Andrianivo',
          progression: 5
        },
        4: {
          id: 4,
          titre: "Système de gestion de stock",
          etudiant: 'Rajaonarivelo Ando',
          entreprise: 'DistriTech',
          ville: 'Antananarivo',
          adresse: 'Lot II M 77, Antananarivo',
          dateDebut: '2024-07-01',
          dateFin: '2024-12-31',
          statut: 'Refusé',
          description: "Développement d'un système de gestion de stock pour entreprise de distribution.",
          encadreur: 'M. Rakotomalala',
          tuteur: 'Dr. Ranaivo',
          progression: 20
        }
      };
      
      setStage(stages[id] || null);
      setLoading(false);
    }, 500);
  }, [id]);

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
          <h1><FaBuilding /> {stage.titre}</h1>
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