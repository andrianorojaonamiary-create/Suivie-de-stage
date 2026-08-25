import { useState } from 'react';
import { FaComment, FaPlus } from 'react-icons/fa';

function EncadreurObservations() {
  const [observations] = useState([
    { id: 1, etudiant: 'Miora Rakoto', date: '15 Mar 2024', contenu: 'Bon début de stage, bonne intégration.' },
  ]);

  return (
    <div className="etudiant-rapports">
      <div className="page-header">
        <h1>Observations</h1>
        <button className="btn-primary"><FaPlus /> Ajouter</button>
      </div>
      <div className="reports-list">
        {observations.map((obs) => (
          <div key={obs.id} className="report-card">
            <div className="report-col-file">
              <div className="report-icon-wrapper"><FaComment /></div>
              <div className="report-info">
                <span className="report-title">{obs.etudiant}</span>
                <span className="report-filename">{obs.contenu}</span>
              </div>
            </div>
            <div className="report-col-date">
              <span className="report-date">{obs.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EncadreurObservations;