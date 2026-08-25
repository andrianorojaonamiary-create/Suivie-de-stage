import { useState } from 'react';
import { FaEye, FaStar, FaComment ,FaClipboardCheck ,FaUserTie } from 'react-icons/fa';

function EncadreurEtudiants() {
  const [etudiants] = useState([
    { id: 1, nom: 'Miora Rakoto', stage: 'TechMada SARL', statut: 'En cours', evaluation: 'À faire' },
    { id: 2, nom: 'Hery Rakotondrabe', stage: 'Airtel Madagascar', statut: 'En attente', evaluation: 'Fait' },
  ]);

  return (
    <div className="etudiant-encadreur-page">
      <div className="page-header">
        <h1>Mes étudiants</h1>
        <p className="text-muted">{etudiants.length} étudiant(s) encadré(s)</p>
      </div>
      <div className="encadreur-grid">
        {etudiants.map((etudiant) => (
          <div key={etudiant.id} className="encadreur-card">
            <div className="encadreur-card-top">
              <div className="encadreur-avatar"><FaUserTie /></div>
              <div className="encadreur-info">
                <h3>{etudiant.nom}</h3>
                <span className="encadreur-fonction">{etudiant.stage}</span>
              </div>
            </div>
            <div className="encadreur-card-middle">
              <p><FaClipboardCheck /> Statut : {etudiant.statut}</p>
              <p><FaStar /> Évaluation : {etudiant.evaluation}</p>
            </div>
            <div className="encadreur-card-actions">
              <button className="btn-action" title="Voir"><FaEye /></button>
              <button className="btn-action" title="Évaluer"><FaStar /></button>
              <button className="btn-action" title="Observation"><FaComment /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EncadreurEtudiants;