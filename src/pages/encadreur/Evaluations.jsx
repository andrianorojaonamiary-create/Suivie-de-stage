import { useEffect, useMemo, useState } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaEdit, FaSave, FaStar, FaTimes, FaUserGraduate } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '../../api/apiClient';
import encadreurService from '../../services/encadreurService';
import { useAuth } from '../../hooks/useAuth';

const formatDate = (value) => value ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value)) : '—';
const studentName = (student) => [student?.user?.nom, student?.user?.prenom].filter(Boolean).join(' ') || 'Étudiant';

function EvaluationForm({ evaluation, onCancel, onSave, isSaving }) {
  const [form, setForm] = useState({ note: '', observation: '', commentaire: '', appreciationGenerale: '' });
  const [error, setError] = useState('');
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    const note = Number(form.note);
    if (form.note === '' || !Number.isFinite(note) || note < 0 || note > 20) return setError('La note doit être comprise entre 0 et 20.');
    onSave({ ...form, note });
  };
  return <div className="modal-overlay" onMouseDown={onCancel}>
    <form className="modal-content modal-evaluation simple-evaluation-form" onSubmit={submit} onMouseDown={(event) => event.stopPropagation()}>
      <div className="modal-header"><h2><FaStar className="modal-icon-validate" /> Évaluer l’étudiant</h2><button type="button" className="modal-close" onClick={onCancel} aria-label="Fermer"><FaTimes /></button></div>
      <div className="modal-body eval-form-body">
        <div className="eval-info-header"><div className="eval-info-row"><span className="eval-info-label"><FaUserGraduate /> Étudiant</span><strong className="eval-info-value">{studentName(evaluation.stage.student)}</strong></div><div className="eval-info-row"><span className="eval-info-label">Entreprise</span><span className="eval-info-value">{evaluation.stage.company?.nom || 'Non renseignée'}</span></div><div className="eval-info-row"><span className="eval-info-label">Stage</span><span className="eval-info-value">{evaluation.stage.intitule}</span></div></div>
        <label className="evaluation-field">Note <span>*</span><div className="note-input"><input name="note" type="number" min="0" max="20" step="0.25" value={form.note} onChange={update} required autoFocus /><small>/ 20</small></div></label>
        <label className="evaluation-field">Observation<textarea name="observation" value={form.observation} onChange={update} rows="3" maxLength="5000" /></label>
        <label className="evaluation-field">Commentaire<textarea name="commentaire" value={form.commentaire} onChange={update} rows="3" maxLength="5000" /></label>
        <label className="evaluation-field">Appréciation générale<textarea name="appreciationGenerale" value={form.appreciationGenerale} onChange={update} rows="3" maxLength="5000" /></label>
        {error && <p className="evaluation-form-error">{error}</p>}
      </div>
      <div className="modal-footer"><button type="button" className="btn-modal-cancel" onClick={onCancel}>Annuler</button><button type="submit" className="btn-modal-confirm btn-validate" disabled={isSaving}><FaSave /> {isSaving ? 'Enregistrement…' : 'Enregistrer'}</button></div>
    </form>
  </div>;
}

function EncadreurEvaluations() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [selected, setSelected] = useState(null); const [isSaving, setIsSaving] = useState(false);
  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const { data: supervisor } = await encadreurService.getMe();
      const { data: stagesResult } = await encadreurService.getInternships(supervisor.id);
      const stages = stagesResult.data || [];
      const evaluations = await Promise.all(stages.map(async (stage) => {
        const { data } = await encadreurService.getEvaluationsForInternship(stage.id);
        return { stage, evaluation: data.data?.[0] || null };
      }));
      setRows(evaluations); setError('');
    } catch (loadError) { setError(getApiErrorMessage(loadError, 'Impossible de charger les évaluations.')); } finally { setLoading(false); }
  };
  useEffect(() => {
    if (user?.role === 'ROLE_ENCADREUR') void Promise.resolve().then(loadEvaluations);
  }, [user]);
  const stats = useMemo(() => ({ total: rows.length, saved: rows.filter((row) => row.evaluation).length, pending: rows.filter((row) => !row.evaluation).length }), [rows]);
  const save = async (form) => {
    try {
      setIsSaving(true);
      await encadreurService.createEvaluation({ stageId: selected.stage.id, evaluateurId: user.id, typeEvaluateur: 'ENCADREUR', note: form.note, observation: form.observation || undefined, commentaire: form.commentaire || undefined, appreciationGenerale: form.appreciationGenerale || undefined });
      setSelected(null); toast.success('Évaluation enregistrée'); await loadEvaluations();
    } catch (saveError) { toast.error(getApiErrorMessage(saveError, 'Impossible d’enregistrer l’évaluation.')); } finally { setIsSaving(false); }
  };
  return <div className="evaluations-page">
    <div className="page-header"><div><h1><FaStar /> Évaluations</h1><p className="text-muted">Évaluez uniquement les étudiants qui vous sont affectés.</p></div></div>
    {error && <div className="alert alert-danger">{error}</div>}
    <div className="stats-cards"><div className="stat-card"><div className="stat-icon total"><FaStar /></div><div className="stat-info"><span className="stat-value">{stats.total}</span><span className="stat-label">Étudiants suivis</span></div></div><div className="stat-card"><div className="stat-icon done"><FaCheckCircle /></div><div className="stat-info"><span className="stat-value">{stats.saved}</span><span className="stat-label">Évaluations enregistrées</span></div></div><div className="stat-card"><div className="stat-icon pending"><FaCalendarAlt /></div><div className="stat-info"><span className="stat-value">{stats.pending}</span><span className="stat-label">À évaluer</span></div></div></div>
    <div className="table-container">{loading ? <div className="empty-state"><p>Chargement des étudiants suivis…</p></div> : rows.length === 0 ? <div className="empty-state"><FaUserGraduate className="empty-icon" /><h3>Aucun étudiant affecté</h3><p>Vous ne pouvez évaluer que les étudiants qui vous sont affectés.</p></div> : <div className="evaluations-table-scroll"><table className="evaluations-table"><thead><tr><th>Nom de l’étudiant</th><th>Entreprise</th><th>Stage</th><th>Date</th><th>Statut de l’évaluation</th><th className="actions-header">Action</th></tr></thead><tbody>{rows.map(({ stage, evaluation }) => <tr key={stage.id}><td><strong>{studentName(stage.student)}</strong></td><td>{stage.company?.nom || 'Non renseignée'}</td><td>{stage.intitule || 'Non renseigné'}</td><td>{formatDate(evaluation?.dateEvaluation)}</td><td><span className={`badge ${evaluation ? 'badge-valide' : 'badge-en-attente'}`}>{evaluation ? 'Évaluation enregistrée' : 'À évaluer'}</span></td><td><div className="action-buttons">{evaluation ? <span className="evaluation-complete"><FaCheckCircle /> Enregistrée</span> : <button type="button" className="evaluate-button" onClick={() => setSelected({ stage })}><FaEdit /> Évaluer</button>}</div></td></tr>)}</tbody></table></div>}</div>
    {selected && <EvaluationForm evaluation={selected} onCancel={() => !isSaving && setSelected(null)} onSave={save} isSaving={isSaving} />}
  </div>;
}
export default EncadreurEvaluations;
