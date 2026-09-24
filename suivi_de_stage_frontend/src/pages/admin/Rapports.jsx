import { useEffect, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';
import reportsApi, { getApiErrorMessage } from '../../api';
import { formatReportDate, mapReportStatus, REPORT_STATUS_LABELS } from '../../utils/reportMapping';

const STATUS_FILTERS = Object.entries(REPORT_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
);
const STATUT_TO_API = Object.fromEntries(
  Object.entries(REPORT_STATUS_LABELS).map(([value, label]) => [label, value]),
);

function AdminRapports() {
  const [filters, setFilters] = useState({
    etudiant: 'all',
    stage: 'all',
    statut: 'all',
    entreprise: 'all'
  });
  const [rapports, setRapports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRapports = async () => {
      setLoading(true);
      setError('');
      try {
        const params = { limit: 100 };
        if (filters.statut !== 'all') {
          params.statut = STATUT_TO_API[filters.statut] || filters.statut;
        }
        const res = await reportsApi.getAll(params);
        const items = (res?.items ?? []).map((r) => ({
          id: r.id,
          titre: r.stage?.intitule || r.originalName || r.fileName || 'Rapport',
          etudiant: r.stage?.etudiant || '—',
          entreprise: r.stage?.entreprise || '—',
          date: formatReportDate(r.dateCreation),
          statut: mapReportStatus(r.statut),
        }));
        setRapports(items);
        setTotal(res?.meta?.total ?? 0);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Erreur lors du chargement des rapports'));
      } finally {
        setLoading(false);
      }
    };
    fetchRapports();
  }, [filters.statut]);

  const handleViewFile = async (report) => {
    if (!report?.id) return;
    const win = window.open('', '_blank');
    try {
      const blob = await reportsApi.download(report.id);
      const url = URL.createObjectURL(blob);
      if (win) {
        win.location.href = url;
      } else {
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Erreur ouverture fichier:', err);
      if (win) win.close();
    }
  };

  const getStatusBadge = (statut) => {
    const classes = {
      Validé: 'badge-valide',
      'En révision': 'badge-en-cours',
      Refusé: 'badge-refuse',
    };
    return classes[statut] || 'badge-en-attente';
  };

  const maps = {
    etudiant: ['all', ...new Set(rapports.map((r) => r.etudiant))].map((v) => ({
      value: v,
      label: v === 'all' ? 'Tous les étudiants' : v,
    })),
    stage: ['all', ...new Set(rapports.map((r) => r.stage))].map((v) => ({
      value: v,
      label: v === 'all' ? 'Tous les stages' : v,
    })),
    entreprise: ['all', ...new Set(rapports.map((r) => r.entreprise))].map((v) => ({
      value: v,
      label: v === 'all' ? 'Toutes les entreprises' : v,
    })),
  };

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    ...STATUS_FILTERS,
  ];

  const filteredRapports = rapports.filter((r) =>
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
          <p className="text-muted">
            {loading
              ? 'Chargement...'
              : `${total} rapport${total > 1 ? 's' : ''} au total · ${filteredRapports.length} affiché${filteredRapports.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* ===== FILTRES AVANCÉS ===== */}
      <div className="filters-section">
        <div className="filter-group">
          <SelectPersonnalise
            value={filters.etudiant}
            onChange={(v) => setFilters({ ...filters, etudiant: v })}
            options={maps.etudiant}
            className="filter-select"
          />
        </div>

        <div className="filter-group">
          <SelectPersonnalise
            value={filters.stage}
            onChange={(v) => setFilters({ ...filters, stage: v })}
            options={maps.stage}
            className="filter-select"
          />
        </div>

        <div className="filter-group">
          <SelectPersonnalise
            value={filters.entreprise}
            onChange={(v) => setFilters({ ...filters, entreprise: v })}
            options={maps.entreprise}
            className="filter-select"
          />
        </div>

        <div className="filter-group">
          <SelectPersonnalise
            value={filters.statut}
            onChange={(v) => setFilters({ ...filters, statut: v })}
            options={statusOptions}
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
            {loading ? (
              <tr>
                <td colSpan="6" className="admin-rapports-empty">Chargement des rapports...</td>
              </tr>
            ) : filteredRapports.length === 0 ? (
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
                    <button className="admin-rapports-btn-view" onClick={() => handleViewFile(report)} title="Voir le fichier"><FaEye /> Voir</button>
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