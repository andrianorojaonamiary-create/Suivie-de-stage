import { useState } from 'react';
import { 
   FaDownload, FaEye, FaFilter, 
  FaUsers, FaBuilding, FaCheck, FaTimes, FaTrash
} from 'react-icons/fa';

function AdminRapports() {
  const [filters, setFilters] = useState({
    etudiant: 'all',
    stage: 'all',
    statut: 'all',
    entreprise: 'all'
  });

  // ===== TOUS LES RAPPORTS =====
  const [rapports] = useState([
    { id: 1, etudiant: 'Miora Rakoto', stage: 'TechMada SARL', entreprise: 'TechMada', titre: 'Rapport de prise en main', date: '20 Mar 2024', statut: 'Validé', size: '1.2 MB' },
    { id: 2, etudiant: 'Hery Rakotondrabe', stage: 'Airtel Madagascar', entreprise: 'Airtel', titre: 'Rapport intermédiaire', date: '15 Mai 2024', statut: 'En révision', size: '2.4 MB' },
    { id: 3, etudiant: 'Fanja Andriantsoa', stage: 'BNI Madagascar', entreprise: 'BNI', titre: 'Rapport final', date: '10 Juin 2024', statut: 'À corriger', size: '3.1 MB' },
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
  const entreprises = ['all', ...new Set(rapports.map(r => r.entreprise))];
  const statuts = ['all', 'En révision', 'Validé', 'À corriger'];

  const filteredRapports = rapports.filter(r => 
    (filters.etudiant === 'all' || r.etudiant === filters.etudiant) &&
    (filters.stage === 'all' || r.stage === filters.stage) &&
    (filters.entreprise === 'all' || r.entreprise === filters.entreprise) &&
    (filters.statut === 'all' || r.statut === filters.statut)
  );

  return (
    <div className="rapports-admin">
      <div className="page-header">
        <div>
          <h1>📋 Gestion des rapports</h1>
          <p className="text-muted">{rapports.length} rapports au total</p>
        </div>
      </div>

      {/* ===== FILTRES AVANCÉS ===== */}
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
          <label><FaBuilding /> Entreprise</label>
          <select 
            value={filters.entreprise} 
            onChange={(e) => setFilters({...filters, entreprise: e.target.value})}
            className="filter-select"
          >
            {entreprises.map(opt => (
              <option key={opt} value={opt}>{opt === 'all' ? 'Toutes' : opt}</option>
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
                  {report.etudiant} · {report.stage} · {report.entreprise}
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
              <button className="btn-action-icon"><FaEye /></button>
              <button className="btn-action-icon"><FaDownload /></button>
              {report.statut === 'En révision' && (
                <>
                  <button className="btn-action-icon btn-success"><FaCheck /></button>
                  <button className="btn-action-icon btn-danger"><FaTimes /></button>
                </>
              )}
              <button className="btn-action-icon btn-danger"><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminRapports;