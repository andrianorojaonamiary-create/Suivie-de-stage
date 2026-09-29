import { useState } from 'react';
import { FaEye, FaFilter, FaUsers, FaBuilding } from 'react-icons/fa';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';

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

  const etudiants = ['all', ...new Set(rapports.map(r => r.etudiant))].map(v => ({ value: v, label: v === 'all' ? 'Tous' : v }));
  const stages = ['all', ...new Set(rapports.map(r => r.stage))].map(v => ({ value: v, label: v === 'all' ? 'Tous' : v }));
  const entreprises = ['all', ...new Set(rapports.map(r => r.entreprise))].map(v => ({ value: v, label: v === 'all' ? 'Toutes' : v }));
  const statuts = [
    { value: 'all', label: 'Tous' },
    { value: 'En révision', label: 'En révision' },
    { value: 'Validé', label: 'Validé' },
    { value: 'À corriger', label: 'À corriger' }
  ];

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
          <h1>Gestion des rapports</h1>
          <p className="text-muted">{rapports.length} rapports au total</p>
        </div>
      </div>

      {/* ===== FILTRES AVANCÉS ===== */}
      <div className="filters-section">
        <div className="filter-group">
          <label><FaUsers /> Étudiant</label>
          <SelectPersonnalise
            value={filters.etudiant}
            onChange={(v) => setFilters({...filters, etudiant: v})}
            options={etudiants}
            className="filter-select"
          />
        </div>

        <div className="filter-group">
          <label><FaBuilding /> Stage</label>
          <SelectPersonnalise
            value={filters.stage}
            onChange={(v) => setFilters({...filters, stage: v})}
            options={stages}
            className="filter-select"
          />
        </div>

        <div className="filter-group">
          <label><FaBuilding /> Entreprise</label>
          <SelectPersonnalise
            value={filters.entreprise}
            onChange={(v) => setFilters({...filters, entreprise: v})}
            options={entreprises}
            className="filter-select"
          />
        </div>

        <div className="filter-group">
          <label><FaFilter /> Statut</label>
          <SelectPersonnalise
            value={filters.statut}
            onChange={(v) => setFilters({...filters, statut: v})}
            options={statuts}
            className="filter-select"
          />
        </div>
      </div>

      {/* ===== TABLEAU ===== */}
      <div className="admin-rapports-table-container">
        <table className="admin-rapports-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Étudiant</th>
              <th>Entreprise</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRapports.length === 0 ? (
              <tr>
                <td colSpan="6" className="admin-rapports-empty">Aucun rapport trouvé</td>
              </tr>
            ) : (
              filteredRapports.map((report) => (
                <tr key={report.id}>
                  <td className="admin-rapports-titre">{report.titre}</td>
                  <td>{report.etudiant}</td>
                  <td>{report.entreprise}</td>
                  <td><span className="admin-rapports-date">{report.date}</span></td>
                  <td><span className={getStatusBadge(report.statut)}>{report.statut}</span></td>
                  <td className="admin-rapports-actions">
                    <button className="btn-action-icon"><FaEye /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminRapports;