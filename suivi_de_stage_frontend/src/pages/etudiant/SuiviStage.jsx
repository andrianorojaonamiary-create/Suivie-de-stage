import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCheckCircle, FaCircle, FaCalendarAlt, FaClock, 
  FaStar, FaComment, FaUserTie, FaArrowRight,
  FaBuilding,
  FaFilePdf, FaFileWord, FaFile, FaCheck,
  FaFilter
} from 'react-icons/fa';

function SuiviStage() {
  // ===== STAGES DE L'ÉTUDIANT =====
  const [stages] = useState([
    {
      id: 1,
      titre: "Développement d'une application web",
      entreprise: 'ABC Informatique',
      dateDebut: '03 Août 2026',
      dateFin: '03 Octobre 2026',
      statut: 'En cours',
      duree: '2 mois',
      joursRestants: 22,
      joursTotal: 62,
      joursEcoules: 20,
      description: "Développement d'une application web de gestion des ressources humaines avec React et Node.js.",
      progression: 32
    },
    {
      id: 2,
      titre: "Développement mobile",
      entreprise: 'XYZ Tech',
      dateDebut: '01 Jan 2025',
      dateFin: '30 Juin 2025',
      statut: 'Terminé',
      duree: '6 mois',
      joursRestants: 0,
      joursTotal: 180,
      joursEcoules: 180,
      description: "Développement d'une application mobile de gestion des stocks.",
      progression: 100
    }
  ]);

  // ===== STAGE SÉLECTIONNÉ =====
  const [selectedStageId, setSelectedStageId] = useState('all');

  const getFilteredStages = () => {
    if (selectedStageId === 'all') {
      return stages;
    }
    return stages.filter(s => s.id === parseInt(selectedStageId));
  };

  const filteredStages = getFilteredStages();
  const selectedStage = filteredStages.length > 0 ? filteredStages[0] : stages[0];

  // ===== ÉTAPES =====
  const milestones = [
    { label: "Convention signée", done: true, date: "28/07/2026" },
    { label: "Stage validé", done: true, date: "01/08/2026" },
    { label: "Stage commencé", done: true, date: "03/08/2026" },
    { label: "Stage en cours", done: true, date: "En progression" },
    { label: "Visite de stage", done: false, date: "À venir" },
    { label: "Rapport à déposer", done: false, date: "À venir" },
    { label: "Évaluation", done: false, date: "À venir" },
    { label: "Stage terminé", done: false, date: "À venir" },
  ];

  // ===== DOCUMENTS =====
  const documents = [
    { name: "Convention de stage", type: "pdf", date: "28/07/2026", status: "Validé" },
    { name: "Plan de travail", type: "word", date: "03/08/2026", status: "Validé" },
    { name: "Rapport de stage (brouillon)", type: "word", date: "20/08/2026", status: "En cours" },
    { name: "Fichiers du projet", type: "pdf", date: "21/08/2026", status: "Validé" },
    { name: "Attestation de stage", type: "pdf", date: "Non encore déposé", status: "À déposer" },
  ];

  // ===== ÉVALUATIONS =====
  const evaluations = [
    { 
      id: 1, 
      titre: 'Évaluation de mi-parcours', 
      date: '01 Jun 2024', 
      status: 'Validé',
      evaluateur: 'Prof. Andrianivo',
      role: 'Tuteur pédagogique'
    },
    { 
      id: 2, 
      titre: 'Évaluation de fin de stage', 
      date: '15 Sep 2024', 
      status: 'En attente',
      evaluateur: 'M. Rakotomalala',
      role: 'Maître de stage'
    },
  ];

  // ===== OBSERVATIONS =====
  const observations = [
    {
      id: 1,
      auteur: 'M. Rakotomalala',
      role: 'Maître de stage',
      date: '15 Mar 2024',
      contenu: 'Bon début de stage, Miora s\'est bien intégré dans l\'équipe. Il a rapidement pris en main les outils de développement.'
    },
    {
      id: 2,
      auteur: 'Prof. Andrianivo',
      role: 'Tuteur pédagogique',
      date: '20 Mar 2024',
      contenu: 'La première semaine s\'est bien passée. L\'étudiant a déjà commencé à travailler sur le projet principal.'
    }
  ];

  const getStatusBadge = (status) => {
    const classes = {
      'Validé': 'badge-valide',
      'En attente': 'badge-en-attente',
      'À venir': 'badge-termine',
      'En cours': 'badge-en-cours',
      'À déposer': 'badge-en-attente',
    };
    return classes[status] || 'badge-en-attente';
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return <FaFilePdf className="pdf" />;
      case 'word': return <FaFileWord className="word" />;
      default: return <FaFile />;
    }
  };

  return (
    <div className="etudiant-suivi">
      {/* ===== HEADER EN COLONNE ===== */}
      <div className="eval-page-header">
        <h1 className="eval-page-title">Suivi de stage</h1>
        <p className="eval-page-subtitle">Suivez l'avancement et les activités de votre stage.</p>
      </div>

      {/* ===== FILTRE ===== */}
      <div className="suivi-filter-section">
        <div className="suivi-filter-group">
          <label>
            <FaFilter /> Filtrer par stage
          </label>
          <select 
            value={selectedStageId} 
            onChange={(e) => setSelectedStageId(e.target.value)}
            className="suivi-filter-select"
          >
            <option value="all">Tous les stages</option>
            {stages.map(stage => (
              <option key={stage.id} value={stage.id}>
                {stage.titre}
              </option>
            ))}
          </select>
        </div>
        <div className="suivi-filter-count">
          <strong>{stages.length}</strong> stage{stages.length > 1 ? 's' : ''} enregistré{stages.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* ===== INFORMATION DU STAGE ===== */}
      <div className="suivi-stage-info">
        {/* GAUCHE */}
        <div className="stage-info-left">
          <h2>{selectedStage.titre}</h2>
          <p className="stage-company"><FaBuilding /> {selectedStage.entreprise}</p>
          
          {/* 3 COLONNES : Début | Fin | Durée */}
          <div className="stage-info-columns">
            <div className="stage-info-col">
              <span className="stage-info-label"><FaCalendarAlt /> Début de stage</span>
              <span className="stage-info-value">{selectedStage.dateDebut}</span>
            </div>
            <div className="stage-info-col">
              <span className="stage-info-label"><FaCalendarAlt /> Fin de stage</span>
              <span className="stage-info-value">{selectedStage.dateFin}</span>
            </div>
            <div className="stage-info-col">
              <span className="stage-info-label"><FaClock /> Durée</span>
              <span className="stage-info-value">{selectedStage.duree}</span>
            </div>
          </div>
          <div className="stage-status-row">
            <span className="stage-status-text">{selectedStage.statut}</span>
            <span className="stage-days-text">
              {selectedStage.joursEcoules} jours écoulés sur {selectedStage.joursTotal} jours
            </span>
          </div>
        </div>

        {/* DROITE : CERCLE DE PROGRESSION */}
        <div className="stage-info-right">
          <div className="progress-circle">
            <svg viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="58" fill="none" stroke="#E8ECF0" strokeWidth="8" />
              <circle 
                cx="70" 
                cy="70" 
                r="58" 
                fill="none" 
                stroke="#6BA9E6" 
                strokeWidth="8"
                strokeDasharray="364.42"
                strokeDashoffset={364.42 - (364.42 * selectedStage.progression / 100)}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
              />
            </svg>
            <div className="progress-text">
              <span className="progress-percent">{selectedStage.progression}%</span>
              <span className="progress-label">Avancement global</span>
            </div>
          </div>
        </div>

        {/* BAS : STATUT + JOURS + DESCRIPTION AVEC BORDER TOP */}
        <div className="stage-bottom-wrapper">
          <div className="stage-description">
            <p>{selectedStage.description}</p>
          </div>
        </div>
      </div>

      {/* ===== ÉTAPES + DOCUMENTS ===== */}
      <div className="suivi-grid-2">
        {/* ÉTAPES */}
        <div className="suivi-card steps-card">
          <h3><FaCheckCircle /> Étapes de suivi du stage</h3>
          <div className="steps-list">
            {milestones.map((step, index) => (
              <div key={index} className={`step-item ${step.done ? 'done' : ''}`}>
                <div className="step-number">{index + 1}</div>
                <div className="step-content">
                  <span className="step-label">{step.label}</span>
                  <span className="step-date">{step.date}</span>
                </div>
                <div className={`step-status ${step.done ? 'done' : ''}`}>
                  {step.done ? <FaCheck /> : <FaCircle />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DOCUMENTS */}
        <div className="suivi-card documents-card">
          <h3><FaFile /> Documents du stage</h3>
          <div className="documents-list">
            {documents.map((doc, index) => (
              <div key={index} className="document-item">
                <div className="document-left">
                  <div className="document-icon">
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="document-info">
                    <span className="document-name">{doc.name}</span>
                    <span className="document-date">Déposé le {doc.date}</span>
                  </div>
                </div>
                <div className="document-status">
                  <span className={getStatusBadge(doc.status)}>{doc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== ÉVALUATIONS ===== */}
      <div className="suivi-card evaluations-card">
        <div className="card-header">
          <h3><FaStar /> Évaluations</h3>
          <Link to="/etudiant/evaluations" className="link-view">
            Voir toutes <FaArrowRight />
          </Link>
        </div>
        <div className="evaluations-list">
          {evaluations.map((evalItem) => (
            <div key={evalItem.id} className="evaluation-item">
              <div className="evaluation-info">
                <span className="evaluation-title">{evalItem.titre}</span>
                <span className="evaluation-date">{evalItem.date}</span>
                <span className="evaluation-evaluateur">
                  <FaUserTie /> {evalItem.evaluateur}
                </span>
                <span className="evaluation-role">{evalItem.role}</span>
              </div>
              <span className={getStatusBadge(evalItem.status)}>{evalItem.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== OBSERVATIONS ===== */}
      <div className="suivi-card observations-card">
        <h3><FaComment /> Observations</h3>
        <div className="observations-list">
          {observations.map((obs) => (
            <div key={obs.id} className="observation-item">
              <div className="observation-header">
                <span className="observation-auteur">
                  <FaUserTie /> {obs.auteur}
                  <span className="observation-role">({obs.role})</span>
                </span>
                <span className="observation-date">{obs.date}</span>
              </div>
              <p className="observation-contenu">{obs.contenu}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SuiviStage;