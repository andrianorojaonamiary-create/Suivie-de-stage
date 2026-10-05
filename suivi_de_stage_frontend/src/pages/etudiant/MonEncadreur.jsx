import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUserTie, FaEnvelope, FaPhone, FaBuilding, FaBriefcase, FaClipboardCheck, FaPlus, FaChalkboardTeacher
} from 'react-icons/fa';
import { internshipsApi, supervisorsApi, teacherAssignmentsApi } from '../../api';
import { mapInternshipList } from '../../utils/internshipMapping';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';

function MonEncadreur() {
  // ===== ÉTATS =====
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedStageId, setSelectedStageId] = useState('all');
  // Tuteurs pédagogiques affectés par l'administration (indépendant du stage).
  const [tuteurs, setTuteurs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stagesRes, supervisorsRes, tuteursRes] = await Promise.allSettled([
          internshipsApi.getAll(),
          supervisorsApi.getAll({ limit: 100 }),
          teacherAssignmentsApi.getMyTeachers(),
        ]);
        const stagesList = stagesRes.status === 'fulfilled'
          ? stagesRes.value?.data || (Array.isArray(stagesRes.value) ? stagesRes.value : [])
          : [];
        setStages(mapInternshipList(stagesList));
        const supervisorsList = supervisorsRes.status === 'fulfilled'
          ? supervisorsRes.value?.data || (Array.isArray(supervisorsRes.value) ? supervisorsRes.value : [])
          : [];
        setSupervisors(supervisorsList);
        if (tuteursRes.status === 'fulfilled') {
          setTuteurs(tuteursRes.value?.items ?? []);
        }
      } catch (err) {
        console.error('Erreur chargement encadreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ===== STAGE SÉLECTIONNÉ + ENCADREUR ASSOCIÉ =====
  const stageOptions = stages.map((stage) => ({
    value: stage.id,
    label: stage.titre,
  }));

  const selectedStage = stages.find((s) => s.id === selectedStageId) || stages[0] || null;

  const matchedEncadreur = selectedStage?.encadreurId
    ? supervisors.find((s) => s.id === selectedStage.encadreurId) || null
    : null;

  const encadreur = matchedEncadreur
    ? {
        id: matchedEncadreur.id,
        prenom: matchedEncadreur.user?.prenom || '',
        nom: matchedEncadreur.user?.nom || 'Encadreur',
        fonction: matchedEncadreur.fonction || '',
        specialite: matchedEncadreur.specialite || '',
        entreprise: matchedEncadreur.entreprise || '',
        email: matchedEncadreur.user?.email || '',
        telephone: matchedEncadreur.telephone || '',
      }
    : {
        id: selectedStage?.encadreurId || null,
        prenom: '',
        nom: selectedStage?.encadreur || 'Non renseigné',
        fonction: '',
        specialite: '',
        entreprise: '',
        email: '',
        telephone: '',
      };

  return (
    <div className="etudiant-encadreur-page">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div>
          <h1>Mon encadreur</h1>
          <p className="text-muted">
            {selectedStage
              ? `Encadreur associé au stage « ${selectedStage.titre} »`
              : 'Aucun stage associé'}
          </p>
        </div>
      </div>

      {/* ===== SÉLECTEUR DE STAGE (si plusieurs) ===== */}
      {stageOptions.length > 1 && (
        <div className="encadreur-stage-selector">
          <SelectPersonnalise
            value={selectedStageId}
            onChange={setSelectedStageId}
            options={stageOptions}
            placeholder="Choisir un stage"
          />
        </div>
      )}

      {/* ===== TUTEURS PÉDAGOGIQUES (affectés par l'administration) ===== */}
      {!loading && (
        <div className="encadreur-card" style={{ marginTop: '16px' }}>
          <div className="encadreur-card-top">
            <div className="encadreur-avatar">
              <FaChalkboardTeacher />
            </div>
            <div className="encadreur-info">
              <h3>Tuteur pédagogique</h3>
              <span className="encadreur-fonction">
                {tuteurs.length === 0 ? 'Aucun tuteur affecté' : 'Tuteur affecté'}
              </span>
            </div>
          </div>
          {tuteurs.length === 0 ? (
            <div className="encadreur-card-middle">
              <p>
                <FaChalkboardTeacher /> Aucun tuteur ne vous est encore affecté.
                Contactez l'administration de l'EMIT.
              </p>
            </div>
          ) : (
            <div className="encadreur-card-middle">
                {tuteurs.map((t) => (
                <p key={t.id}>
                  <FaChalkboardTeacher />{' '}
                  {[t.prenom, t.nom].filter(Boolean).join(' ')}
                  {t.grade ? ` — ${t.grade}` : ''}
                  {t.email ? ` — ${t.email}` : ''}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== CONTENU ===== */}
      <div className="encadreur-grid">
        {loading && <p>Chargement...</p>}

        {!loading && stageOptions.length === 0 && (
          <div className="empty-state">
            <p>Aucun stage défini</p>
            <p className="empty-sub">Ajoutez votre stage pour associer votre maître de stage</p>
            <Link to="/etudiant/ajouter-stage" className="btn-primary">
              <FaPlus /> Ajouter un stage
            </Link>
          </div>
        )}

        {!loading && selectedStage && (
          <div className="encadreur-card">
            <div className="encadreur-card-top">
              <div className="encadreur-avatar">
                <FaUserTie />
              </div>
              <div className="encadreur-info">
                <h3>{[encadreur.prenom, encadreur.nom].filter(Boolean).join(' ') || 'Non renseigné'}</h3>
                <span className="encadreur-fonction">{encadreur.fonction || 'Fonction non renseignée'}</span>
              </div>
            </div>
            <div className="encadreur-card-middle">
              <p><FaBuilding /> {encadreur.entreprise || 'Entreprise non renseignée'}</p>
              <p><FaEnvelope /> {encadreur.email || 'Non renseigné'}</p>
              <p><FaPhone /> {encadreur.telephone || 'Non renseigné'}</p>
              {encadreur.specialite && <p><FaBriefcase /> {encadreur.specialite}</p>}
              <p><FaClipboardCheck /> Stage : {selectedStage.titre}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MonEncadreur;