import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaBuilding, FaCalendarAlt, FaPlus, FaUserGraduate } from 'react-icons/fa';
import { getApiErrorMessage } from '../../api/apiClient';
import encadreurService from '../../services/encadreurService';
import { useAuth } from '../../hooks/useAuth';

const statusLabels = { A_VENIR: 'À venir', EN_COURS: 'En cours', TERMINE: 'Terminé', SUSPENDU: 'Suspendu', ANNULE: 'Annulé' };
const statusClasses = { A_VENIR: 'status-en-attente', EN_COURS: 'status-en-cours', TERMINE: 'status-termine', SUSPENDU: 'status-suspendu', ANNULE: 'status-termine' };

const formatDate = (value) => value
  ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value))
  : 'Non renseignée';

const getProgress = (stage) => {
  if (!stage) return 0;
  if (stage.statut === 'TERMINE') return 100;
  if (stage.statut !== 'EN_COURS') return 0;
  const start = new Date(stage.dateDebut).getTime();
  const end = new Date(stage.dateFin).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.min(99, Math.max(1, Math.round(((Date.now() - start) / (end - start)) * 100)));
};

function StudentDetail() {
  const { studentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [stage, setStage] = useState(null);
  const [company, setCompany] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [observation, setObservation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadFollowUps = async (stageId) => {
    const { data } = await encadreurService.getFollowUps(stageId);
    setFollowUps(data.data || []);
  };

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setIsLoading(true);
        const { data: supervisor } = await encadreurService.getMe();
        const [studentsResponse, stagesResponse] = await Promise.all([
          encadreurService.getStudents(supervisor.id),
          encadreurService.getInternships(supervisor.id),
        ]);
        const selectedStudent = (studentsResponse.data || []).find((item) => item.id === studentId);
        const selectedStage = (stagesResponse.data.data || []).find((item) => item.student?.id === studentId);
        if (!selectedStudent || !selectedStage) throw new Error('Étudiant ou stage introuvable dans vos affectations.');
        setStudent(selectedStudent);
        setStage(selectedStage);
        const [followUpsResult, companyResult] = await Promise.allSettled([
          encadreurService.getFollowUps(selectedStage.id),
          selectedStage.company?.id
            ? encadreurService.getCompany(selectedStage.company.id)
            : Promise.resolve({ data: null }),
        ]);
        if (followUpsResult.status === 'fulfilled') {
          setFollowUps(followUpsResult.value.data.data || []);
        } else {
          throw followUpsResult.reason;
        }
        setCompany(companyResult.status === 'fulfilled' ? companyResult.value.data : null);
        setError('');
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Impossible de charger le suivi de cet étudiant.'));
      } finally {
        setIsLoading(false);
      }
    };
    if (user) loadDetails();
  }, [studentId, user]);

  const progress = useMemo(() => getProgress(stage), [stage]);
  const supervisorName = [user?.prenom, user?.nom].filter(Boolean).join(' ') || 'Encadreur affecté';
  const companySector = company?.secteurActivite || stage?.domaine || 'Non renseigné';
  const companyAddress = company?.adresse || stage?.lieu || 'Non renseignée';
  const companyCity = company?.ville || stage?.ville || 'Non renseignée';
  const latitude = company?.latitude ?? stage?.latitude;
  const longitude = company?.longitude ?? stage?.longitude;

  const openCreateForm = () => {
    setEditingId(null);
    setObservation('');
    setIsFormOpen(true);
  };

  const openEditForm = (followUp) => {
    setEditingId(followUp.id);
    setObservation(followUp.contenu);
    setIsFormOpen(true);
  };

  const saveObservation = async (event) => {
    event.preventDefault();
    if (!observation.trim() || !stage) return;
    try {
      setIsSaving(true);
      if (editingId) {
        await encadreurService.updateFollowUp(editingId, { contenu: observation.trim() });
      } else {
        await encadreurService.addFollowUp(stage.id, { contenu: observation.trim() });
      }
      await loadFollowUps(stage.id);
      setObservation('');
      setEditingId(null);
      setIsFormOpen(false);
      setError('');
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, 'Impossible d’enregistrer cette observation.'));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteObservation = async (id) => {
    try {
      await encadreurService.deleteFollowUp(id);
      await loadFollowUps(stage.id);
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, 'Impossible de supprimer cette observation.'));
    }
  };

  if (isLoading) return <div className="student-detail-loading"><div className="spinner" /><p>Chargement du suivi...</p></div>;
  if (!student || !stage) return <div className="student-detail-notfound"><h2>Suivi introuvable</h2><p>{error || 'Ce stage ne fait pas partie de vos affectations.'}</p><button type="button" className="btn-back-detail" onClick={() => navigate('/encadreur/etudiants')}><FaArrowLeft /> Retour</button></div>;

  const studentFullName = [student.user?.prenom, student.user?.nom].filter(Boolean).join(' ') || 'Étudiant';
  const canManage = (followUp) => followUp.auteur?.id === user?.id;

  return (
    <div className="encadreur-stage-follow-up">
      <div className="follow-up-header"><button type="button" className="btn-back-header" onClick={() => navigate('/encadreur/etudiants')}><FaArrowLeft /> Retour</button><div><h1><FaUserGraduate /> Suivi du stage</h1><p className="text-muted">Suivi de {studentFullName}</p></div></div>
      {error && <div className="alert alert-danger">{error}</div>}

      <section className="follow-up-progress-card"><div><span className="follow-up-progress-label">{statusLabels[stage.statut] || stage.statut}</span><strong>{progress} %</strong></div><div className="follow-up-progress-track"><span style={{ width: `${progress}%` }} /></div><div className="follow-up-progress-dates"><span>{formatDate(stage.dateDebut)}</span><span>{formatDate(stage.dateFin)}</span></div></section>

      <div className="follow-up-info-grid">
        <section className="follow-up-card"><h2><FaUserGraduate /> Informations étudiant</h2><dl><div><dt>Nom</dt><dd>{student.user?.nom || 'Non renseigné'}</dd></div><div><dt>Prénom</dt><dd>{student.user?.prenom || 'Non renseigné'}</dd></div><div><dt>Formation</dt><dd>{student.formation || 'Non renseignée'}</dd></div><div><dt>Promotion</dt><dd>{student.promotion || 'Non renseignée'}</dd></div></dl></section>
        <section className="follow-up-card"><h2><FaCalendarAlt /> Informations stage</h2><dl><div><dt>Intitulé</dt><dd>{stage.intitule}</dd></div><div><dt>Domaine</dt><dd>{stage.domaine || 'Non renseigné'}</dd></div><div><dt>Date de début</dt><dd>{formatDate(stage.dateDebut)}</dd></div><div><dt>Date de fin</dt><dd>{formatDate(stage.dateFin)}</dd></div><div><dt>Statut</dt><dd><span className={`status-badge ${statusClasses[stage.statut] || 'status-en-attente'}`}>{statusLabels[stage.statut] || stage.statut}</span></dd></div></dl></section>
        <section className="follow-up-card"><h2><FaBuilding /> Entreprise</h2><dl><div><dt>Nom</dt><dd>{company?.nom || stage.company?.nom || 'Non renseigné'}</dd></div><div><dt>Domaine</dt><dd>{companySector}</dd></div><div><dt>Adresse</dt><dd>{companyAddress}</dd></div><div><dt>Ville</dt><dd>{companyCity}</dd></div><div><dt>Localisation</dt><dd>{latitude != null && longitude != null ? `${latitude}, ${longitude}` : 'Coordonnées non renseignées'}</dd></div></dl></section>
        <section className="follow-up-card"><h2><FaUserGraduate /> Encadreur</h2><dl><div><dt>Nom</dt><dd>{supervisorName}</dd></div></dl></section>
      </div>

      <section className="follow-up-card follow-up-history"><div className="follow-up-section-header"><div><h2>Historique des observations</h2><p>Les observations enregistrées pendant le stage</p></div><button type="button" className="follow-up-add-button" onClick={openCreateForm}><FaPlus /> Ajouter une observation</button></div>
        {followUps.length === 0 ? <div className="follow-up-empty">Aucune observation enregistrée.</div> : <div className="follow-up-timeline">{followUps.map((followUp) => <article className="follow-up-entry" key={followUp.id}><span className="follow-up-dot" /><div className="follow-up-entry-content"><div className="follow-up-entry-meta"><strong>{formatDate(followUp.date)}</strong><span>Par {[followUp.auteur?.prenom, followUp.auteur?.nom].filter(Boolean).join(' ') || 'Auteur non renseigné'}</span></div><p>{followUp.contenu}</p>{canManage(followUp) && <div className="follow-up-entry-actions"><button type="button" onClick={() => openEditForm(followUp)}>Modifier</button><button type="button" onClick={() => deleteObservation(followUp.id)}>Supprimer</button></div>}</div></article>)}</div>}
      </section>

      {isFormOpen && <div className="follow-up-modal-backdrop"><form className="follow-up-modal" onSubmit={saveObservation}><h2>{editingId ? 'Modifier l’observation' : 'Ajouter une observation'}</h2><label htmlFor="observation">Observation</label><textarea id="observation" value={observation} onChange={(event) => setObservation(event.target.value)} minLength={2} maxLength={5000} required placeholder="Décrivez le suivi de l’étudiant..." /><div className="follow-up-modal-actions"><button type="button" onClick={() => setIsFormOpen(false)}>Annuler</button><button type="submit" disabled={isSaving}>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</button></div></form></div>}
    </div>
  );
}

export default StudentDetail;
