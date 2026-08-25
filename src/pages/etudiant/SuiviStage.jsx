import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCheckCircle, FaCircle, FaCalendarAlt, FaClock, 
  FaStar, FaComment, FaUserTie, FaArrowRight,
  FaBuilding, FaCalendarCheck, 
  FaFilePdf, FaFileWord, FaFile, FaCheck,
  FaTimes, FaHourglassHalf, FaChevronDown, FaChevronUp
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
      description: "Développement d'une application mobile de gestion des stocks.",
      progression: 100
    }
  ]);

  // ===== STAGE SÉLECTIONNÉ =====
  const [selectedStageId, setSelectedStageId] = useState(stages[0]?.id || null);
  const [isStageSelectorOpen, setIsStageSelectorOpen] = useState(false);

  const selectedStage = stages.find(s => s.id === selectedStageId) || stages[0];

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

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Validé': return <FaCheck className="status-icon valid" />;
      case 'En cours': return <FaHourglassHalf className="status-icon progress" />;
      case 'À déposer': return <FaTimes className="status-icon pending" />;
      default: return null;
    }
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return <FaFilePdf className="file-icon pdf" />;
      case 'word': return <FaFileWord className="file-icon word" />;
      default: return <FaFile className="file-icon" />;
    }
  };

  const handleStageSelect = (stageId) => {
    setSelectedStageId(stageId);
    setIsStageSelectorOpen(false);
  };

  return (
    <div className="etudiant-suivi">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <h1>Suivi de stage</h1>
        <p className="text-muted">Suivez l'avancement et les activités de votre stage.</p>
      </div>

      {/* ===== SÉLECTEUR DE STAGE ===== */}
      <div className="suivi-stage-selector">
        <button 
          className="stage-selector-btn"
          onClick={() => setIsStageSelectorOpen(!isStageSelectorOpen)}
        >
          <div className="stage-selector-info">
            <span className="stage-selector-title">{selectedStage?.titre}</span>
            <span className="stage-selector-company">
              <FaBuilding /> {selectedStage?.entreprise}
            </span>
          </div>
          <span className="stage-selector-status">
            <span className={getStatusBadge(selectedStage?.statut)}>{selectedStage?.statut}</span>
            {isStageSelectorOpen ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </button>

        {isStageSelectorOpen && (
          <div className="stage-selector-dropdown">
            {stages.map(stage => (
              <div 
                key={stage.id}
                className={`stage-selector-item ${stage.id === selectedStageId ? 'active' : ''}`}
                onClick={() => handleStageSelect(stage.id)}
              >
                <div className="stage-selector-item-info">
                  <span className="stage-selector-item-title">{stage.titre}</span>
                  <span className="stage-selector-item-company">{stage.entreprise}</span>
                </div>
                <span className={getStatusBadge(stage.statut)}>{stage.statut}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== INFORMATION DU STAGE ===== */}
      <div className="suivi-stage-info">
        <div className="stage-info-left">
          <h2>{selectedStage.titre}</h2>
          <p className="stage-company"><FaBuilding /> {selectedStage.entreprise}</p>
          <div className="stage-dates">
            <span><FaCalendarAlt /> Début : {selectedStage.dateDebut}</span>
            <span><FaCalendarAlt /> Fin : {selectedStage.dateFin}</span>
            <span><FaClock /> Durée : {selectedStage.duree}</span>
          </div>
          <div className="stage-days-remaining">
            <FaCalendarCheck /> {selectedStage.joursRestants} jours restants sur {selectedStage.joursTotal} jours
          </div>
        </div>
        <div className="stage-info-right">
          <div className="progress-circle">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#F5F8FC" strokeWidth="8" />
              <circle 
                cx="60" 
                cy="60" 
                r="50" 
                fill="none" 
                stroke="#4A90D9" 
                strokeWidth="8"
                strokeDasharray="314.16"
                strokeDashoffset={314.16 - (314.16 * selectedStage.progression / 100)}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="progress-text">
              <span className="progress-percent">{selectedStage.progression}%</span>
              <span className="progress-label">Avancement global</span>
            </div>
          </div>
        </div>

        {/* ===== LIGNE SÉPARATRICE ===== */}
        <div className="stage-divider"></div>

        {/* ===== DESCRIPTION ===== */}
        <div className="stage-description">
          <p>{selectedStage.description}</p>
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
                <div className="document-icon">
                  {getFileIcon(doc.type)}
                </div>
                <div className="document-info">
                  <span className="document-name">{doc.name}</span>
                  <span className="document-date">Déposé le {doc.date}</span>
                </div>
                <div className="document-status">
                  {getStatusIcon(doc.status)}
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