import { useState } from 'react';
import { 
   FaDownload, FaEye, FaFilter, 
  FaUsers, FaBuilding, FaCheck, FaTimes
} from 'react-icons/fa';

function EnseignantRapports() {
  const [filters, setFilters] = useState({
    etudiant: 'all',
    stage: 'all',
    statut: 'all'
  });

  // ===== DONNÉES SIMULÉES =====
  const [rapports] = useState([
    { id: 1, etudiant: 'Miora Rakoto', stage: 'TechMada SARL', titre: 'Rapport de prise en main', date: '20 Mar 2024', statut: 'En révision', size: '1.2 MB' },
    { id: 2, etudiant: 'Hery Rakotondrabe', stage: 'Airtel Madagascar', titre: 'Rapport intermédiaire', date: '15 Mai 2024', statut: 'À corriger', size: '2.4 MB' },
    { id: 3, etudiant: 'Miora Rakoto', stage: 'TechMada SARL', titre: 'Rapport final', date: '10 Juin 2024', statut: 'Validé', size: '3.1 MB' },
    { id: 4, etudiant: 'Fanja Andriantsoa', stage: 'BNI Madagascar', titre: 'Rapport de prise en main', date: '05 Fév 2024', statut: 'Validé', size: '0.9 MB' },
  ]);

  const getStatusBadge = (statut) => {
    const classes = {
      'Validé': 'badge-valide',
      'En révision': 'badge-en-cours',
      'À corriger': 'badge-refuse',
    };
    return classes[statut] || 'badge-en-attente';
  };

  const etudiants = ['all', ...new Set(rapports.map(r => r.etudiant))];
  const stages = ['all', ...new Set(rapports.map(r => r.stage))];
  const statuts = ['all', 'En révision', 'Validé', 'À corriger'];

  const filteredRapports = rapports.filter(r => 
    (filters.etudiant === 'all' || r.etudiant === filters.etudiant) &&
    (filters.stage === 'all' || r.stage === filters.stage) &&
    (filters.statut === 'all' || r.statut === filters.statut)
  );

  return (
    <div className="rapports-enseignant">
      <div className="page-header">
        <div>
          <h1>📋 Rapports des étudiants</h1>
          <p className="text-muted">{rapports.length} rapports · {rapports.filter(r => r.statut === 'En révision').length} à valider</p>
        </div>
      </div>

      {/* ===== FILTRES ===== */}
      <div className="filters-section">
        <div className="filter-group">
          <label><FaUsers /> Étudiant</label>
          <select 
            value={filters.etudiant} 
            onChange={(e) => setFilters({...filters, etudiant: e.target.value})}
            className="filter-select"
          >
            {etudiants.map(opt => (
              <option key={opt} value={opt}>{opt === 'all' ? 'Tous' : opt}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label><FaBuilding /> Stage</label>
          <select 
            value={filters.stage} 
            onChange={(e) => setFilters({...filters, stage: e.target.value})}
            className="filter-select"
          >
            {stages.map(opt => (
              <option key={opt} value={opt}>{opt === 'all' ? 'Tous' : opt}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label><FaFilter /> Statut</label>
          <select 
            value={filters.statut} 
            onChange={(e) => setFilters({...filters, statut: e.target.value})}
            className="filter-select"
          >
            {statuts.map(opt => (
              <option key={opt} value={opt}>{opt === 'all' ? 'Tous' : opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ===== LISTE ===== */}
      <div className="reports-list">
        {filteredRapports.map((report) => (
          <div key={report.id} className="report-card">
            <div className="report-col-file">
              <div className="report-info">
                <span className="report-title">{report.titre}</span>
                <span className="report-meta">
                  {report.etudiant} · {report.stage}
                </span>
              </div>
            </div>
            <div className="report-col-date">
              <span className="report-date">{report.date}</span>
            </div>
            <div className="report-col-status">
              <span className={getStatusBadge(report.statut)}>{report.statut}</span>
            </div>
            <div className="report-col-actions">
              <button className="btn-action-icon" title="Voir"><FaEye /></button>
              <button className="btn-action-icon" title="Télécharger"><FaDownload /></button>
              {report.statut === 'En révision' && (
                <>
                  <button className="btn-action-icon btn-success" title="Valider"><FaCheck /></button>
                  <button className="btn-action-icon btn-danger" title="Refuser"><FaTimes /></button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EnseignantRapports;