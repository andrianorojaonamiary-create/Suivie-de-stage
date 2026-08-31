import { useEffect, useMemo, useState } from 'react';
import { FaBuilding, FaClipboardList, FaClock, FaSearch, FaUserGraduate } from 'react-icons/fa';
import apiClient, { getApiErrorMessage } from '../../api/apiClient';
import { useAuth } from '../../hooks/useAuth';

const labels = { A_VENIR: 'À venir', EN_COURS: 'En cours', TERMINE: 'Terminé', SUSPENDU: 'Suspendu', ANNULE: 'Annulé' };
const classes = { A_VENIR: 'status-en-attente', EN_COURS: 'status-en-cours', TERMINE: 'status-termine', SUSPENDU: 'status-en-attente', ANNULE: 'status-termine' };
const formatDate = (date) => date ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(date)) : '—';
const nameOf = (student) => [student?.user?.nom, student?.user?.prenom].filter(Boolean).join(' ') || 'Étudiant';

function EncadreurStages() {
  const { user } = useAuth();
  const [stages, setStages] = useState([]); const [query, setQuery] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => {
    const loadStages = async () => {
      try { setLoading(true); const { data: supervisor } = await apiClient.get('/supervisors/me'); const { data } = await apiClient.get('/internships', { params: { supervisorId: supervisor.id, limit: 100 } }); setStages(data.data || []); setError(''); }
      catch (loadError) { setError(getApiErrorMessage(loadError, 'Impossible de charger vos stages.')); }
      finally { setLoading(false); }
    };
    if (user?.role === 'ROLE_ENCADREUR') void Promise.resolve().then(loadStages);
  }, [user]);
  const filtered = useMemo(() => { const term = query.trim().toLowerCase(); return stages.filter((stage) => !term || [nameOf(stage.student), stage.company?.nom, stage.intitule, stage.domaine].filter(Boolean).join(' ').toLowerCase().includes(term)); }, [query, stages]);
  return <div className="encadreur-stages"><div className="page-header"><div><h1><FaClipboardList /> Mes stages</h1><p className="text-muted">Stages des étudiants qui vous sont affectés.</p></div></div>{error && <div className="alert alert-danger">{error}</div>}<div className="table-container"><div className="table-toolbar"><div className="search-group"><FaSearch className="search-icon" /><input className="search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un étudiant ou un stage…" /></div></div>{loading ? <div className="empty-state"><p>Chargement de vos stages…</p></div> : filtered.length === 0 ? <div className="empty-state"><FaClipboardList className="empty-icon" /><h3>Aucun stage suivi</h3></div> : <div className="stages-table-scroll"><table className="stages-table"><thead><tr><th><FaUserGraduate /> Étudiant</th><th><FaBuilding /> Entreprise</th><th>Stage</th><th>Période</th><th>Statut</th></tr></thead><tbody>{filtered.map((stage) => <tr key={stage.id}><td><strong>{nameOf(stage.student)}</strong></td><td>{stage.company?.nom || 'Non renseignée'}</td><td>{stage.intitule || stage.domaine || 'Non renseigné'}</td><td>{formatDate(stage.dateDebut)} — {formatDate(stage.dateFin)}</td><td><span className={`status-badge ${classes[stage.statut] || 'status-en-attente'}`}><FaClock /> {labels[stage.statut] || stage.statut}</span></td></tr>)}</tbody></table></div>}</div></div>;
}
export default EncadreurStages;
