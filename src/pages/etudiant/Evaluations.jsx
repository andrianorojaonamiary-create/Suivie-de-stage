import { useState } from 'react';
import { 
  FaChevronDown, FaChevronUp,
  FaUserGraduate, FaBriefcase,  FaInfoCircle,

} from 'react-icons/fa';

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================
const getStatusBadge = (status) => {
  const classes = {
    'Validé': 'eval-badge-valide',
    'Complétée': 'eval-badge-valide',
    'En attente': 'eval-badge-en-attente',
    'À venir': 'eval-badge-termine',
    'En révision': 'eval-badge-en-cours',
  };
  return classes[status] || 'eval-badge-en-attente';
};

const getStars = (note) => {
  if (!note) return null;
  const value = parseInt(note);
  const fullStars = Math.floor(value / 4);
  const emptyStars = 5 - fullStars;
  return (
    <span className="eval-stars">
      {'★'.repeat(fullStars)}{'☆'.repeat(emptyStars)}
    </span>
  );
};

// ============================================================
// COMPOSANT Carte d'évaluation (avec critères)
// ============================================================
const EvaluationDetailCard = ({ evaluation, title }) => {
  if (!evaluation) {
    return (
      <div className="eval-card-empty">
        <p>Aucune évaluation disponible</p>
      </div>
    );
  }

  return (
    <div className="eval-card">
      <div className="eval-card-header">
        <h4>{title}</h4>
        <div className="eval-card-status">
          <span className={getStatusBadge(evaluation.status)}>{evaluation.status}</span>
          <span className="eval-card-date">{evaluation.date}</span>
        </div>
      </div>

      {/* TABLEAU DES CRITÈRES */}
      {evaluation.criteres && evaluation.criteres.length > 0 && (
        <div className="eval-criteres">
          <table className="eval-table">
            <thead>
              <tr>
                <th>Critères d'évaluation</th>
                <th className="eval-th-center">Note /20</th>
              </tr>
            </thead>
            <tbody>
              {evaluation.criteres.map((critere, index) => (
                <tr key={index}>
                  <td>{critere.nom}</td>
                  <td className="eval-td-center">
                    <span className="eval-critere-note">{critere.note} / 20</span>
                    <span className="eval-critere-stars">{getStars(critere.note)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* NOTE + APPRÉCIATION */}
      {evaluation.note && (
        <div className="eval-footer-simple">
          <div className="eval-note-moyenne-simple">
            <span className="eval-note-label">Note moyenne</span>
            <span className="eval-note-value">{evaluation.note} / 20</span>
            <span className="eval-note-stars">{getStars(parseInt(evaluation.note))}</span>
          </div>
          {evaluation.commentaire && (
            <div className="eval-appreciation-simple">
              <span className="eval-appreciation-label">Appréciation générale</span>
              <span className="eval-appreciation-text">{evaluation.commentaire}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// COMPOSANT Carte entreprise (simple)
// ============================================================
const EvaluationSimpleCard = ({ evaluation, title }) => {
  if (!evaluation) {
    return (
      <div className="eval-card-simple-empty">
        <p>Aucune évaluation disponible</p>
      </div>
    );
  }

  return (
    <div className="eval-card-simple">
      <div className="eval-card-simple-header">
        <h4>{title}</h4>
        <div className="eval-card-simple-status">
          <span className={getStatusBadge(evaluation.status)}>{evaluation.status}</span>
          <span className="eval-card-simple-date">{evaluation.date}</span>
        </div>
      </div>

      {evaluation.note && (
        <div className="eval-simple-content">
          <div className="eval-simple-note">
            <span className="eval-simple-note-label">Note</span>
            <span className="eval-simple-note-value">{evaluation.note} / 20</span>
            <span className="eval-simple-note-stars">{getStars(parseInt(evaluation.note))}</span>
          </div>
          {evaluation.commentaire && (
            <div className="eval-simple-appreciation">
              <span className="eval-simple-appreciation-label">Appréciation générale</span>
              <span className="eval-simple-appreciation-text">{evaluation.commentaire}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
function Evaluations() {
  const [selectedStageId, setSelectedStageId] = useState(1);
  const [isStageSelectorOpen, setIsStageSelectorOpen] = useState(false);

  const [stages] = useState([
    {
      id: 1,
      titre: "Développement d'une application web",
      entreprise: 'ABC Informatique',
      dateDebut: '03 Août 2026',
      dateFin: '03 Octobre 2026',
      statut: 'En cours'
    },
    {
      id: 2,
      titre: "Développement mobile",
      entreprise: 'XYZ Tech',
      dateDebut: '01 Jan 2025',
      dateFin: '30 Juin 2025',
      statut: 'Terminé'
    }
  ]);

  const getStageInfo = (stageId) => {
    const infos = {
      1: {
        tuteur: {
          nom: 'RAKOTONDRASOA Mamy',
          role: 'Enseignant à l\'EMIT',
          email: 'm.rakotondrasoa@emit.mg'
        },
        encadreur: {
          nom: 'RABEMANANTSOA Nivo',
          role: 'Responsable technique',
          entreprise: 'ABC Informatique'
        }
      },
      2: {
        tuteur: {
          nom: 'RANAIVO Jean',
          role: 'Enseignant à l\'EMIT',
          email: 'j.ranaivo@emit.mg'
        },
        encadreur: {
          nom: 'RALAVA Marie',
          role: 'Responsable projet',
          entreprise: 'XYZ Tech'
        }
      }
    };
    return infos[stageId] || infos[1];
  };

  const getEvaluations = (stageId) => {
    const evals = {
      1: {
        tuteur: {
          id: 1,
          date: '28/09/2026',
          status: 'Complétée',
          note: '16.4',
          commentaire: 'Miary a montré une bonne capacité d\'adaptation et un réel investissement dans les tâches qui lui ont été confiées.',
          criteres: [
            { nom: 'Compétences techniques', note: 16 },
            { nom: 'Qualité du travail', note: 17 },
            { nom: 'Autonomie', note: 15 },
            { nom: 'Respect des délais', note: 18 },
            { nom: 'Esprit d\'équipe', note: 16 },
            { nom: 'Communication', note: 15 },
            { nom: 'Assiduité et ponctualité', note: 17 }
          ]
        },
        encadreur: {
          id: 2,
          date: '28/09/2026',
          status: 'Complétée',
          note: '16.4',
          commentaire: 'Miary a montré une bonne capacité d\'adaptation et un réel investissement.',
          criteres: [
            { nom: 'Compétences techniques', note: 16 },
            { nom: 'Qualité du travail', note: 17 },
            { nom: 'Autonomie', note: 15 },
            { nom: 'Respect des délais', note: 16 },
            { nom: 'Esprit d\'équipe', note: 18 },
            { nom: 'Communication', note: 16 },
            { nom: 'Assiduité et ponctualité', note: 17 }
          ]
        },
        entreprise: {
          id: 5,
          date: '30/09/2026',
          status: 'Complétée',
          note: '15.8',
          commentaire: 'Stagiaire sérieux, bonne intégration dans l\'équipe.'
        }
      },
      2: {
        tuteur: {
          id: 3,
          date: '15/06/2025',
          status: 'Complétée',
          note: '18.0',
          commentaire: 'Excellent travail, l\'étudiant a dépassé les attentes.',
          criteres: [
            { nom: 'Compétences techniques', note: 19 },
            { nom: 'Qualité du travail', note: 18 },
            { nom: 'Autonomie', note: 17 },
            { nom: 'Respect des délais', note: 18 },
            { nom: 'Esprit d\'équipe', note: 18 },
            { nom: 'Communication', note: 17 },
            { nom: 'Assiduité et ponctualité', note: 19 }
          ]
        },
        encadreur: {
          id: 4,
          date: '30/06/2025',
          status: 'Complétée',
          note: '17.0',
          commentaire: 'Bon travail d\'ensemble, l\'étudiant a rempli les objectifs.',
          criteres: [
            { nom: 'Compétences techniques', note: 17 },
            { nom: 'Qualité du travail', note: 17 },
            { nom: 'Autonomie', note: 16 },
            { nom: 'Respect des délais', note: 17 },
            { nom: 'Esprit d\'équipe', note: 17 },
            { nom: 'Communication', note: 16 },
            { nom: 'Assiduité et ponctualité', note: 18 }
          ]
        },
        entreprise: {
          id: 6,
          date: '30/06/2025',
          status: 'Complétée',
          note: '16.5',
          commentaire: 'Bon stagiaire, à l\'écoute et impliqué.'
        }
      }
    };
    return evals[stageId] || evals[1];
  };

  const selectedStage = stages.find(s => s.id === selectedStageId);
  const stageInfo = getStageInfo(selectedStageId);
  const evaluations = getEvaluations(selectedStageId);

  const handleStageSelect = (stageId) => {
    setSelectedStageId(stageId);
    setIsStageSelectorOpen(false);
  };

  return (
    <div className="etudiant-evaluations">
      <div className="eval-page-header">
        <h1 className="eval-page-title">Évaluation de stage</h1>
        <p className="eval-page-subtitle">
          Consultez les évaluations de votre stage et les appréciations des encadreurs.
        </p>
      </div>

      {/* SÉLECTEUR DE STAGE */}
      <div className="eval-stage-selector">
        <button 
          className="eval-stage-btn"
          onClick={() => setIsStageSelectorOpen(!isStageSelectorOpen)}
        >
          <div className="eval-stage-info">
            <span className="eval-stage-title">{selectedStage?.titre}</span>
            <span className="eval-stage-company">{selectedStage?.entreprise}</span>
          </div>
          <span className="eval-stage-status">
            <span className={getStatusBadge(selectedStage?.statut)}>{selectedStage?.statut}</span>
            {isStageSelectorOpen ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </button>

        {isStageSelectorOpen && (
          <div className="eval-stage-dropdown">
            {stages.map(stage => (
              <div 
                key={stage.id}
                className={`eval-stage-item ${stage.id === selectedStageId ? 'eval-stage-item-active' : ''}`}
                onClick={() => handleStageSelect(stage.id)}
              >
                <div className="eval-stage-item-info">
                  <span className="eval-stage-item-title">{stage.titre}</span>
                  <span className="eval-stage-item-company">{stage.entreprise}</span>
                </div>
                <span className={getStatusBadge(stage.statut)}>{stage.statut}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3 CARTES D'INFOS */}
      <div className="eval-info-cards">
        <div className="eval-info-card">
          <div className="eval-info-card-icon"><FaInfoCircle /></div>
          <div className="eval-info-card-content">
            <h4>Mon stage</h4>
            <p className="eval-info-title">{selectedStage?.titre}</p>
            <p className="eval-info-company">{selectedStage?.entreprise}</p>
            <p className="eval-info-date">{selectedStage?.dateDebut} → {selectedStage?.dateFin}</p>
          </div>
        </div>

        <div className="eval-info-card">
          <div className="eval-info-card-icon"><FaUserGraduate /></div>
          <div className="eval-info-card-content">
            <h4>Encadreur pédagogique</h4>
            <p className="eval-info-name">{stageInfo.tuteur.nom}</p>
            <p className="eval-info-role">{stageInfo.tuteur.role}</p>
            <p className="eval-info-email">{stageInfo.tuteur.email}</p>
          </div>
        </div>

        <div className="eval-info-card">
          <div className="eval-info-card-icon"><FaBriefcase /></div>
          <div className="eval-info-card-content">
            <h4>Maître de stage</h4>
            <p className="eval-info-name">{stageInfo.encadreur.nom}</p>
            <p className="eval-info-role">{stageInfo.encadreur.role}</p>
            <p className="eval-info-company">{stageInfo.encadreur.entreprise}</p>
          </div>
        </div>
      </div>

      {/* TUTEUR + ENCADREUR */}
      <div className="eval-two-columns">
        <EvaluationDetailCard 
          evaluation={evaluations.tuteur} 
          title="Évaluation par l'encadreur pédagogique"
        />
        <EvaluationDetailCard 
          evaluation={evaluations.encadreur} 
          title="Évaluation par le maître de stage"
        />
      </div>

      {/* ENTREPRISE */}
      <div className="eval-entreprise-section">
        <EvaluationSimpleCard 
          evaluation={evaluations.entreprise} 
          title="Évaluation par l'entreprise"
        />
      </div>
    </div>
  );
}

export default Evaluations;