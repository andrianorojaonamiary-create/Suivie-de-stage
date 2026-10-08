// src/pages/admin/components/StageForm.jsx
import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import studentsApi from '../../../api/studentsApi';
import companiesApi from '../../../api/companiesApi';
import supervisorsApi from '../../../api/supervisorsApi';
import usersApi from '../../../api/usersApi';

function StageForm({ formData, setFormData, onSubmit, onCancel, title, submitLabel, loading }) {
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [tuteurs, setTuteurs] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [studRes, compRes, supRes, tutRes] = await Promise.allSettled([
          studentsApi.getAll({ limit: 200 }),
          companiesApi.getAll({ limit: 200 }),
          supervisorsApi.getAll({ limit: 200 }),
          usersApi.getAll({ role: 'ENSEIGNANT', limit: 200 }),
        ]);

        if (studRes.status === 'fulfilled') {
          const list = studRes.value?.items || studRes.value?.data || [];
          setStudents(list.map(s => ({
            id: s.id,
            label: `${s.user?.prenom || ''} ${s.user?.nom || ''} (${s.matricule || ''})`
          })));
        }
        if (compRes.status === 'fulfilled') {
          const list = Array.isArray(compRes.value) ? compRes.value : compRes.value?.data || [];
          setCompanies(list.map(c => ({ id: c.id, label: c.nom || 'Entreprise' })));
        }
        if (supRes.status === 'fulfilled') {
          const list = Array.isArray(supRes.value) ? supRes.value : supRes.value?.data || [];
          setSupervisors(list.map(s => ({
            id: s.id,
            label: `${s.user?.prenom || ''} ${s.user?.nom || ''} — ${s.fonction || s.specialite || ''}`
          })));
        }
        if (tutRes.status === 'fulfilled') {
          const list = Array.isArray(tutRes.value) ? tutRes.value : tutRes.value?.data || [];
          setTuteurs(list.map(t => ({
            id: t.id,
            label: `${t.prenom || ''} ${t.nom || ''}`
          })));
        }
      } catch (err) {
        console.error('Erreur chargement options form:', err);
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onCancel}><FaTimes /></button>
        </div>

        <div className="modal-body">
          {loadingOptions ? (
            <div className="stage-form-loading">
              <FaSpinner className="spin" /> Chargement des données...
            </div>
          ) : (
            <div className="form-grid">

              {/* Intitulé */}
              <div className="form-group form-group-full">
                <label>Intitulé du stage <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.intitule || ''}
                  onChange={e => set('intitule', e.target.value)}
                  placeholder="Ex : Développement d'une application web"
                />
              </div>

              {/* Description */}
              <div className="form-group form-group-full">
                <label>Description <span className="required">*</span></label>
                <textarea
                  value={formData.description || ''}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Décrivez les missions et objectifs du stage..."
                  rows={3}
                />
              </div>

              {/* Étudiant */}
              <div className="form-group">
                <label>Étudiant <span className="required">*</span></label>
                <select
                  value={formData.studentId || ''}
                  onChange={e => set('studentId', e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Sélectionner un étudiant --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Entreprise */}
              <div className="form-group">
                <label>Entreprise <span className="required">*</span></label>
                <select
                  value={formData.companyId || ''}
                  onChange={e => set('companyId', e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Sélectionner une entreprise --</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Encadreur professionnel */}
              <div className="form-group">
                <label>Encadreur professionnel</label>
                <select
                  value={formData.supervisorId || ''}
                  onChange={e => set('supervisorId', e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Sélectionner un encadreur --</option>
                  {supervisors.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
                {!formData.supervisorId && (
                  <div className="form-group" style={{ marginTop: 8 }}>
                    <label style={{ fontSize: '0.8rem', color: '#888' }}>
                      Ou saisir le nom de l'encadreur professionnel
                    </label>
                    <input
                      type="text"
                      value={formData.encadreurProfessionnelNom || ''}
                      onChange={e => set('encadreurProfessionnelNom', e.target.value)}
                      placeholder="Nom encadreur professionnel"
                    />
                  </div>
                )}
              </div>

              {/* Tuteur pédagogique */}
              <div className="form-group">
                <label>Tuteur pédagogique (enseignant)</label>
                <select
                  value={formData.tuteurId || ''}
                  onChange={e => set('tuteurId', e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Sélectionner un tuteur --</option>
                  {tuteurs.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Domaine */}
              <div className="form-group">
                <label>Domaine <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.domaine || ''}
                  onChange={e => set('domaine', e.target.value)}
                  placeholder="Ex : Développement Web"
                />
              </div>

              {/* Lieu */}
              <div className="form-group">
                <label>Lieu <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.lieu || ''}
                  onChange={e => set('lieu', e.target.value)}
                  placeholder="Adresse du lieu de stage"
                />
              </div>

              {/* Ville */}
              <div className="form-group">
                <label>Ville <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.ville || ''}
                  onChange={e => set('ville', e.target.value)}
                  placeholder="Ex : Antananarivo"
                />
              </div>

              {/* Statut */}
              <div className="form-group">
                <label>Statut</label>
                <select
                  value={formData.statut || 'EN_ATTENTE'}
                  onChange={e => set('statut', e.target.value)}
                  className="form-select"
                >
                  <option value="EN_ATTENTE">En attente</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="TERMINE">Terminé</option>
                  <option value="REFUSE">Refusé</option>
                </select>
              </div>

              {/* Date début */}
              <div className="form-group">
                <label>Date de début <span className="required">*</span></label>
                <input
                  type="date"
                  value={formData.dateDebut || ''}
                  onChange={e => set('dateDebut', e.target.value)}
                />
              </div>

              {/* Date fin */}
              <div className="form-group">
                <label>Date de fin <span className="required">*</span></label>
                <input
                  type="date"
                  value={formData.dateFin || ''}
                  onChange={e => set('dateFin', e.target.value)}
                />
              </div>

              {/* Observations */}
              <div className="form-group form-group-full">
                <label>Observations</label>
                <textarea
                  value={formData.observations || ''}
                  onChange={e => set('observations', e.target.value)}
                  placeholder="Notes ou remarques..."
                  rows={2}
                />
              </div>

            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel} disabled={loading}>Annuler</button>
          <button className="btn-primary" onClick={onSubmit} disabled={loading || loadingOptions}>
            {loading ? <><FaSpinner className="spin" /> Enregistrement...</> : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StageForm;