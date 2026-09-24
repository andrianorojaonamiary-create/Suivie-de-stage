import { useEffect, useState } from 'react';
import {
  FaCheckCircle, FaCircle, FaCalendarAlt, FaClock,
  FaComment, FaUserTie,
  FaBuilding, FaUserGraduate, FaBriefcase, FaInfoCircle,
  FaFilePdf, FaFileWord, FaFile, FaCheck,
  FaFilter
} from 'react-icons/fa';
import { internshipsApi, trackingApi, evaluationsApi, reportsApi } from '../../api';
import { mapInternshipList, getStatutBadge } from '../../utils/internshipMapping';
import { mapReportStatus, formatReportDate } from '../../utils/reportMapping';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';

function SuiviStage() {
  const [loading, setLoading] = useState(true);
  // ===== STAGES DE L'ÉTUDIANT =====
  const [stages, setStages] = useState([]);

  useEffect(() => {
    const fetchSuivi = async () => {
      try {
        setLoading(true);
        const res = await internshipsApi.getAll();
        const list = res?.data || (Array.isArray(res) ? res : []);
        setStages(mapInternshipList(list));
      } catch (err) {
        console.error('Erreur chargement suivi stage:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuivi();
  }, []);

  // ===== STAGE SÉLECTIONNÉ =====
  const [selectedStageId, setSelectedStageId] = useState('all');

  const getFilteredStages = () => {
    if (selectedStageId === 'all') {
      return stages;
    }
    return stages.filter(s => String(s.id) === String(selectedStageId));
  };

  const getResponseList = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.items)) return response.items;
    return [];
  };

  const filteredStages = getFilteredStages();
  const selectedStage = filteredStages.length > 0 ? filteredStages[0] : stages[0];

  // ===== OBSERVATIONS =====
  const [observations, setObservations] = useState([]);
  // ===== DOCUMENTS (convention + rapports) =====
  const [documents, setDocuments] = useState([]);
  // ===== ÉVALUATION (étape) =====
  const [hasEvaluation, setHasEvaluation] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchObservations = async () => {
      const stage = getFilteredStages()[0] || stages[0];
      if (!stage) return;
      try {
        const [obsRes, repRes, evalsRes] = await Promise.allSettled([
          trackingApi.getByInternship(stage.id),
          reportsApi.byStage(stage.id),
          evaluationsApi.getByInternship(stage.id),
        ]);
        if (!cancelled) {
          if (obsRes.status === 'fulfilled') {
            setObservations(getResponseList(obsRes.value));
          } else {
            setObservations([]);
          }

          if (repRes.status === 'fulfilled') {
            const reports = Array.isArray(repRes.value)
              ? repRes.value
              : repRes.value?.data || [];
            const convention = stage.conventionNom
              ? [{ id: 'convention', name: stage.conventionNom, date: '—', status: 'Déposée', type: 'pdf' }]
              : [];
            setDocuments([
              ...convention,
              ...reports.map((r) => {
                const fileName = r.originalName || r.fileName || '';
                const ext = fileName.split('.').pop()?.toLowerCase();
                return {
                  id: r.id,
                  name: fileName || 'Rapport',
                  date: formatReportDate(r.dateCreation),
                  status: mapReportStatus(r.statut),
                  type: ext === 'pdf' ? 'pdf' : (ext === 'doc' || ext === 'docx') ? 'word' : 'other',
                };
              }),
            ]);
          } else {
            setDocuments(stage.conventionNom
              ? [{ id: 'convention', name: stage.conventionNom, date: '—', status: 'Déposée', type: 'pdf' }]
              : []);
          }

          if (evalsRes.status === 'fulfilled') {
            const ev = evalsRes.value;
            const evalsList = Array.isArray(ev) ? ev : ev?.data || [];
            setHasEvaluation(evalsList.length > 0);
          } else {
            setHasEvaluation(false);
          }
        }
      } catch (err) {
        console.error('Erreur chargement observations:', err);
        if (!cancelled) {
          setObservations([]);
          setDocuments([]);
          setHasEvaluation(false);
        }
      }
    };
    fetchObservations();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStageId, stages]);

  // ===== INFOS TUTEUR / ENCADREUR =====
  const stageInfo = {
    tuteur: {
      nom: selectedStage?.tuteur
        ? selectedStage.tuteur
        : selectedStage?.tuteurId
          ? 'Chargement...'
          : 'Tuteur non assigné',
      role: '',
      email: ''
    },
    encadreur: {
      nom: selectedStage?.encadreur || 'Non renseigné',
      role: '',
      entreprise: selectedStage?.entreprise || ''
    }
  };

  // ===== ÉTAPES (6 étapes alignées sur le dashboard) =====
  const stageStarted = selectedStage && (selectedStage.statut === 'En cours' || selectedStage.statut === 'Terminé');
  const nowDate = new Date(); nowDate.setHours(0, 0, 0, 0);
  const debutMs = selectedStage?.dateDebut ? new Date(selectedStage.dateDebut).getTime() : null;
  const finMs = selectedStage?.dateFin ? new Date(selectedStage.dateFin).getTime() : null;
  const milestones = selectedStage ? [
    { label: 'Validation du thème', done: true },
    { label: 'Début du stage', done: !!stageStarted },
    { label: 'Mi-parcours', done: !!stageStarted && debutMs !== null && finMs !== null && nowDate.getTime() >= (debutMs + finMs) / 2 },
    { label: 'Fin du stage', done: !!stageStarted && finMs !== null && nowDate.getTime() >= finMs },
    { label: 'Évaluation', done: hasEvaluation },
    { label: 'Validation finale', done: selectedStage.statut === 'Terminé' },
  ] : [];
  const stageProgress = milestones.length > 0
    ? Math.round((milestones.filter((m) => m.done).length / milestones.length) * 100)
    : 0;

  const getStatusBadge = (status) => getStatutBadge(status);

  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return <FaFilePdf className="pdf" />;
      case 'word': return <FaFileWord className="word" />;
      default: return <FaFile />;
    }
  };

  if (!selectedStage) {
    return (
      <div className="etudiant-suivi">
        <div className="eval-page-header">
          <h1 className="eval-page-title">Suivi de stage</h1>
          <p className="eval-page-subtitle">Suivez l'avancement et les activités de votre stage.</p>
        </div>
        <div className="empty-state">
          <p>Aucun stage enregistré pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="etudiant-suivi">
      {/* ===== HEADER EN COLONNE ===== */}
      <div className="eval-page-header">
        <h1 className="eval-page-title">Suivi de stage</h1>
        <p className="eval-page-subtitle">Suivez l'avancement et les activités de votre stage.</p>
      </div>

      {/* ===== FILTRE ===== */}
      <div className="suivi-filter-section">
        <div className="suivi-filter-group">
          <label>
            <FaFilter /> Filtrer par stage
          </label>
          <SelectPersonnalise
            value={selectedStageId}
            onChange={setSelectedStageId}
            className="suivi-filter-select"
            options={[
              { value: 'all', label: 'Tous les stages' },
              ...stages.map(stage => ({ value: String(stage.id), label: stage.titre }))
            ]}
          />
        </div>
        <div className="suivi-filter-count">
          <strong>{stages.length}</strong> stage{stages.length > 1 ? 's' : ''} enregistré{stages.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* ===== 3 CARTES : VOTRE STAGE / ENCADREUR PÉDAGOGIQUE / MAÎTRE DE STAGE ===== */}
      <div className="avenir-card">
        <div className="avenir-card-header">
          <h3>
            <FaInfoCircle /> {selectedStage?.titre}
          </h3>
          <span className={getStatusBadge(selectedStage?.statut)}>
            {selectedStage?.statut}
          </span>
        </div>
        <div className="avenir-card-body">
          <div className="eval-info-cards">
            <div className="eval-info-card">
              <div className="eval-info-card-content">
                <h4><FaInfoCircle /> Votre stage</h4>
                <p className="eval-info-title">{selectedStage?.titre}</p>
                <p className="eval-info-company">{selectedStage?.entreprise}</p>
                <p className="eval-info-date">{selectedStage?.dateDebut} → {selectedStage?.dateFin}</p>
              </div>
            </div>

            <div className="eval-info-card">
              <div className="eval-info-card-content">
                <h4><FaUserGraduate /> Encadreur pédagogique</h4>
                <p className="eval-info-name">{stageInfo.tuteur.nom}</p>
                <p className="eval-info-role">{stageInfo.tuteur.role}</p>
                <p className="eval-info-email">{stageInfo.tuteur.email}</p>
              </div>
            </div>

            <div className="eval-info-card">
              <div className="eval-info-card-content">
                <h4><FaBriefcase /> Maître de stage</h4>
                <p className="eval-info-name">{stageInfo.encadreur.nom}</p>
                <p className="eval-info-role">{stageInfo.encadreur.role}</p>
                <p className="eval-info-company">{stageInfo.encadreur.entreprise}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== INFORMATION DU STAGE ===== */}
      <div className="suivi-stage-info">
        {/* GAUCHE */}
        <div className="stage-info-left">
          <h2>{selectedStage.titre}</h2>
          <p className="stage-company"><FaBuilding /> {selectedStage.entreprise}</p>
          
          {/* 3 COLONNES : Début | Fin | Durée */}
          <div className="stage-info-columns">
            <div className="stage-info-col">
              <span className="stage-info-label"><FaCalendarAlt /> Début de stage</span>
              <span className="stage-info-value">{selectedStage.dateDebut}</span>
            </div>
            <div className="stage-info-col">
              <span className="stage-info-label"><FaCalendarAlt /> Fin de stage</span>
              <span className="stage-info-value">{selectedStage.dateFin}</span>
            </div>
            <div className="stage-info-col">
              <span className="stage-info-label"><FaClock /> Durée</span>
              <span className="stage-info-value">{selectedStage.duree}</span>
            </div>
          </div>
          <div className="stage-status-row">
            <span className="stage-days-text">
              {selectedStage.joursEcoules} jours écoulés sur {selectedStage.joursTotal} jours
            </span>
          </div>
        </div>

        {/* DROITE : CERCLE DE PROGRESSION */}
        <div className="stage-info-right">
          <div className="progress-circle">
            <svg viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="58" fill="none" stroke="#E8ECF0" strokeWidth="8" />
              <circle 
                cx="70" 
                cy="70" 
                r="58" 
                fill="none" 
                stroke="#6BA9E6" 
                strokeWidth="8"
                strokeDasharray="364.42"
                strokeDashoffset={364.42 - (364.42 * stageProgress / 100)}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
              />
            </svg>
            <div className="progress-text">
              <span className="progress-percent">{stageProgress}%</span>
              <span className="progress-label">Avancement global</span>
            </div>
          </div>
        </div>

        {/* BAS : STATUT + JOURS + DESCRIPTION AVEC BORDER TOP */}
        <div className="stage-bottom-wrapper">
          <div className="stage-description">
            <p>{selectedStage.description}</p>
          </div>
        </div>
      </div>

      {/* ===== ÉTAPES + DOCUMENTS ===== */}
      <div className="suivi-grid-2">
        {/* ÉTAPES */}
        <div className="suivi-card steps-card">
          <h3><FaCheckCircle /> Étapes de suivi du stage</h3>
          <div className="steps-list">
            {milestones.length === 0 && (
              <p className="empty-section-message">Aucune étape de suivi n'est disponible pour ce stage pour le moment.</p>
            )}
            {milestones.map((step, index) => (
              <div key={index} className={`step-item ${step.done ? 'done' : ''}`}>
                <div className="step-number">{index + 1}</div>
                <div className="step-content">
                  <span className="step-label">{step.label}</span>
                  <span className="step-date">{step.date}</span>
                </div>
                <div className={`step-status ${step.done ? 'done' : ''}`}>
                  {step.done ? <FaCheck /> : <FaCircle />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DOCUMENTS */}
        <div className="suivi-card documents-card">
          <h3><FaFile /> Documents du stage</h3>
          <div className="documents-list">
            {documents.length === 0 && (
              <p className="empty-section-message">Aucun document n'est disponible pour ce stage pour le moment.</p>
            )}
            {documents.map((doc, index) => (
              <div key={index} className="document-item">
                <div className="document-left">
                  <div className="document-icon">
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="document-info">
                    <span className="document-name">{doc.name}</span>
                    <span className="document-date">Déposé le {doc.date}</span>
                  </div>
                </div>
                <div className="document-status">
                  <span className={getStatusBadge(doc.status)}>{doc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>      {/* ===== OBSERVATIONS ===== */}
      <div className="suivi-card observations-card">
        <h3><FaComment /> Observations</h3>
        <div className="observations-list">
          {observations.length === 0 && (
            <p className="empty-section-message">Aucune observation pour ce stage pour le moment.</p>
          )}
          {observations.map((obs) => (
            <div key={obs.id} className="observation-item">
              <div className="observation-header">
                <span className="observation-auteur">
                  <FaUserTie /> {`${obs.auteur?.prenom || ''} ${obs.auteur?.nom || ''}`.trim() || 'Utilisateur'}
                  {obs.type && <span className="observation-role">({obs.type})</span>}
                </span>
                <span className="observation-date">
                  {obs.date ? new Date(obs.date).toLocaleDateString('fr-FR') : ''}
                </span>
              </div>
              <p className="observation-contenu">{obs.contenu}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SuiviStage;