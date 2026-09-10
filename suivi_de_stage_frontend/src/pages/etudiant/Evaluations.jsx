import { useState } from 'react';
import { 
  FaUserGraduate, FaBriefcase, FaInfoCircle,
  FaFilter
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

// ===== AFFICHAGE DES ÉTOILES =====
const getStars = (note) => {
  if (!note) return null;
  const value = parseInt(note);
  const fullStars = Math.floor(value / 4);
  const emptyStars = 5 - fullStars;
  return (
    <span className="eval-critere-stars1">
      {'★'.repeat(fullStars)}
      {'☆'.repeat(emptyStars)}
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
          <span className="eval-card-date">Évaluée le {evaluation.date}</span>
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
                     <span className="eval-critere-stars1">{getStars(critere.note)}</span>
                    <span className="eval-critere-note">{critere.note} / 20</span>
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
            <span className="eval-note-label">Moyenne générale</span>
            <span className="eval-note-value">{evaluation.note} / 20</span>
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
          <span className="eval-card-simple-date">Évaluée le {evaluation.date}</span>
        </div>
      </div>

      {evaluation.note && (
        <div className="eval-simple-content">
          <div className="eval-simple-note">
            <span className="eval-simple-note-label">Moyenne générale</span>
            <div className='eval-simple-note-right'>
              <span className="eval-simple-note-stars">{getStars(parseInt(evaluation.note))}</span>
              <span className="eval-simple-note-value">{evaluation.note} / 20</span>
            </div>            
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
  const [selectedStageId, setSelectedStageId] = useState('all');

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

  const getFilteredStages = () => {
    if (selectedStageId === 'all') {
      return stages;
    }
    return stages.filter(s => s.id === parseInt(selectedStageId));
  };

  const filteredStages = getFilteredStages();
  const selectedStage = filteredStages.length > 0 ? filteredStages[0] : stages[0];

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
          commentaire: 'Miary a montré une bonne capacité d\'adaptation et un réel investissement dans les tâches qui lui ont été confiées. Travail sérieux et satisfaisant.',
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
          commentaire: 'Bon travail dans l\'ensemble. Quelques améliorations à apporter dans l\'analyse et la formalisation des solutions.'
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

  const stageInfo = getStageInfo(selectedStage?.id || 1);
  const evaluations = getEvaluations(selectedStage?.id || 1);

  return (
    <div className="etudiant-evaluations">
      {/* ===== HEADER EN COLONNE ===== */}
      <div className="eval-page-header">
        <h1 className="eval-page-title">Évaluation de stage</h1>
        <p className="eval-page-subtitle">
          Consultez les évaluations de votre stage et les appréciations des encadreurs.
        </p>
      </div>

      {/* ===== FILTRE ===== */}
      <div className="eval-filter-section">
        <div className="eval-filter-group">
          <label>
            <FaFilter /> Filtrer par stage
          </label>
          <select 
            value={selectedStageId} 
            onChange={(e) => setSelectedStageId(e.target.value)}
            className="eval-filter-select"
          >
            <option value="all">Tous les stages</option>
            {stages.map(stage => (
              <option key={stage.id} value={stage.id}>
                {stage.titre}
              </option>
            ))}
          </select>
        </div>
        <div className="eval-filter-count">
          <strong>{stages.length}</strong> stage{stages.length > 1 ? 's' : ''} enregistré{stages.length > 1 ? 's' : ''}
        </div>
      </div>


      {/* ===== 3 CARTES DANS UNE CARTE COMMUNE ===== */}
      <div className="avenir-card">
        <div className="avenir-card-header">
          <h3>
            <FaInfoCircle /> {selectedStage?.titre}
          </h3>
          <span className={getStatusBadge(selectedStage?.statut)}>
            {selectedStage?.statut}
          </span>
        </div>
        <div className="avenir-card-body">
          <div className="eval-info-cards">
            <div className="eval-info-card">
              <div className="eval-info-card-icon"><FaInfoCircle /></div>
              <div className="eval-info-card-content">
                <h4>Votre stage</h4>
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
        </div>
      </div>

      {/* TUTEUR + ENCADREUR */}
      <div className="eval-two-columns">
        <EvaluationDetailCard 
          evaluation={evaluations.encadreur} 
          title="Évaluation par le maître de stage"
        />
        <EvaluationDetailCard 
          evaluation={evaluations.tuteur} 
          title="Évaluation par l'encadreur pédagogique"
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