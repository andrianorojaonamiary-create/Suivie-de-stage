import { useState } from 'react';
import {  FaDownload, FaEye, } from 'react-icons/fa';

function EncadreurRapports() {
  // ===== DONNÉES SIMULÉES (uniquement les étudiants encadrés) =====
  const [rapports] = useState([
    { id: 1, etudiant: 'Miora Rakoto', stage: 'TechMada SARL', titre: 'Rapport de prise en main', date: '20 Mar 2024', statut: 'Validé', size: '1.2 MB' },
    { id: 2, etudiant: 'Tojo Ramanantsoa', stage: 'JIRAMA', titre: 'Rapport intermédiaire', date: '15 Mai 2024', statut: 'En révision', size: '2.4 MB' },
  ]);

  const getStatusBadge = (statut) => {
    const classes = {
      'Validé': 'badge-valide',
      'En révision': 'badge-en-cours',
      'À corriger': 'badge-refuse',
    };
    return classes[statut] || 'badge-en-attente';
  };

  return (
    <div className="rapports-encadreur">
      <div className="page-header">
        <div>
          <h1>📋 Rapports des étudiants</h1>
          <p className="text-muted">Étudiants encadrés · {rapports.length} rapports</p>
        </div>
      </div>

      <div className="reports-list">
        {rapports.map((report) => (
          <div key={report.id} className="report-card">
            <div className="report-col-file">
              <div className="report-info">
                <span className="report-title">{report.titre}</span>
                <span className="report-meta">{report.etudiant} · {report.stage}</span>
              </div>
            </div>
            <div className="report-col-date">
              <span className="report-date">{report.date}</span>
            </div>
            <div className="report-col-status">
              <span className={getStatusBadge(report.statut)}>{report.statut}</span>
            </div>
            <div className="report-col-actions">
              <button className="btn-action-icon"><FaEye /></button>
              <button className="btn-action-icon"><FaDownload /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EncadreurRapports;