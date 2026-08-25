import { useState } from 'react';
import { FaEye, FaClipboardCheck, FaUsers , FaBuilding } from 'react-icons/fa';

function EncadreurStages() {
  const [stages] = useState([
    { id: 1, titre: 'Développement plateforme web RH', entreprise: 'TechMada SARL', etudiant: 'Miora Rakoto', statut: 'En cours' },
    { id: 2, titre: 'Application mobile de gestion', entreprise: 'Airtel Madagascar', etudiant: 'Hery Rakotondrabe', statut: 'En attente' },
  ]);

  return (
    <div className="etudiant-stages">
      <div className="page-header">
        <h1>Stages suivis</h1>
        <p className="text-muted">{stages.length} stage(s) à suivre</p>
      </div>
      <div className="stages-grid">
        {stages.map((stage) => (
          <div key={stage.id} className="stage-card">
            <div className="stage-card-top">
              <h3>{stage.titre}</h3>
              <span className="badge-en-cours">{stage.statut}</span>
            </div>
            <div className="stage-card-middle">
              <p><FaBuilding /> {stage.entreprise}</p>
              <p><FaUsers /> {stage.etudiant}</p>
            </div>
            <div className="stage-card-actions">
              <button className="btn-action" title="Voir"><FaEye /></button>
              <button className="btn-action" title="Suivi"><FaClipboardCheck /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EncadreurStages;