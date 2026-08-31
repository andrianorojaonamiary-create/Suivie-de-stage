import { useEffect, useMemo, useState } from 'react';
import { FaCalendarAlt, FaComment, FaPlus, FaSave, FaUserGraduate } from 'react-icons/fa';
import { toast } from 'react-toastify';
import apiClient, { getApiErrorMessage } from '../../api/apiClient';
import { useAuth } from '../../hooks/useAuth';

const studentName = (student) => [student?.user?.nom, student?.user?.prenom].filter(Boolean).join(' ') || 'Étudiant';
const formatDate = (date) => date ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(date)) : '—';

function EncadreurObservations() {
  const { user } = useAuth();
  const [stages, setStages] = useState([]); const [observations, setObservations] = useState([]); const [selectedStageId, setSelectedStageId] = useState(''); const [content, setContent] = useState(''); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const loadData = async () => {
    try {
      setLoading(true);
      const { data: supervisor } = await apiClient.get('/supervisors/me');
      const { data: stagesResult } = await apiClient.get('/internships', { params: { supervisorId: supervisor.id, limit: 100 } });
      const loadedStages = stagesResult.data || [];
      const followUps = await Promise.all(loadedStages.map(async (stage) => { const { data } = await apiClient.get(`/internship-tracking/internships/${stage.id}`, { params: { limit: 100 } }); return (data.data || []).map((item) => ({ ...item, stage })); }));
      setStages(loadedStages); setObservations(followUps.flat()); setSelectedStageId((current) => current || loadedStages[0]?.id || ''); setError('');
    } catch (loadError) { setError(getApiErrorMessage(loadError, 'Impossible de charger les observations.')); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (user?.role === 'ROLE_ENCADREUR') void Promise.resolve().then(loadData); }, [user]);
  const ordered = useMemo(() => [...observations].sort((a, b) => new Date(b.date) - new Date(a.date)), [observations]);
  const save = async (event) => { event.preventDefault(); if (!selectedStageId || !content.trim()) return; try { setSaving(true); await apiClient.post(`/internship-tracking/internships/${selectedStageId}`, { contenu: content.trim(), type: 'OBSERVATION' }); setContent(''); toast.success('Observation enregistrée'); await loadData(); } catch (saveError) { toast.error(getApiErrorMessage(saveError, 'Impossible d’enregistrer l’observation.')); } finally { setSaving(false); } };
  return <div className="encadreur-observations"><div className="page-header"><div><h1><FaComment /> Observations de suivi</h1><p className="text-muted">Observations liées uniquement aux stages que vous suivez.</p></div></div>{error && <div className="alert alert-danger">{error}</div>}<section className="observation-form-card"><h2><FaPlus /> Ajouter une observation</h2><form onSubmit={save}><label>Stage<select value={selectedStageId} onChange={(event) => setSelectedStageId(event.target.value)} required>{stages.map((stage) => <option key={stage.id} value={stage.id}>{studentName(stage.student)} — {stage.intitule}</option>)}</select></label><label>Observation<textarea value={content} onChange={(event) => setContent(event.target.value)} rows="4" maxLength="5000" required /></label><button type="submit" className="btn-modal-confirm btn-validate" disabled={saving || !selectedStageId}><FaSave /> {saving ? 'Enregistrement…' : 'Enregistrer'}</button></form></section>{loading ? <div className="empty-state"><p>Chargement des observations…</p></div> : ordered.length === 0 ? <div className="empty-state"><FaComment className="empty-icon" /><h3>Aucune observation</h3></div> : <section className="observations-list">{ordered.map((item) => <article key={item.id} className="observation-card"><div><strong><FaUserGraduate /> {studentName(item.stage.student)}</strong><span>{item.stage.intitule} · {item.stage.company?.nom}</span></div><p>{item.contenu}</p><small><FaCalendarAlt /> {formatDate(item.date)}</small></article>)}</section>}</div>;
}
export default EncadreurObservations;
