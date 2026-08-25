import { useState } from 'react';
import {  FaCalendarAlt ,FaBuilding} from 'react-icons/fa';

function EnseignantEvaluations() {
  const [evaluations] = useState([
    { id: 1, etudiant: 'Miora Rakoto', stage: 'TechMada SARL', date: '15 Sep 2024', status: 'À faire' },
    { id: 2, etudiant: 'Hery Rakotondrabe', stage: 'Airtel Madagascar', date: '01 Oct 2024', status: 'Fait' },
  ]);

  return (
    <div className="etudiant-evaluations">
      <div className="page-header">
        <h1>Évaluations</h1>
        <p className="text-muted">{evaluations.filter(e => e.status === 'À faire').length} évaluation(s) à réaliser</p>
      </div>
      <div className="evaluations-list">
        {evaluations.map((evalItem) => (
          <div key={evalItem.id} className="evaluation-item">
            <div className="evaluation-info">
              <span className="evaluation-title">{evalItem.etudiant}</span>
              <span className="evaluation-date"><FaCalendarAlt /> {evalItem.date}</span>
              <span className="evaluation-evaluateur"><FaBuilding /> {evalItem.stage}</span>
            </div>
            <span className={evalItem.status === 'À faire' ? 'badge-en-attente' : 'badge-valide'}>
              {evalItem.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EnseignantEvaluations;