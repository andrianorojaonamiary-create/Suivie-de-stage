// src/pages/admin/components/StageForm.jsx
import { FaTimes } from 'react-icons/fa';
import SelectPersonnalise from '../../../components/Common/SelectPersonnalise';

function StageForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  title, 
  submitLabel,
  statutOptions,
  domaineOptions,
  supervisorOptions = [],
  supervisorLoading = false
}) {
  const supervisorId = formData.supervisorId || '';
  // Un stage n'a jamais d'encadreur « vide » : l'affectation est obligatoire,
  // et le serveur refuse de toute façon un corps sans supervisorId.
  const supervisorMissing = !supervisorId;

  const handleSubmit = (event) => {
    event?.preventDefault?.();
    if (supervisorMissing) return;
    onSubmit();
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onCancel}><FaTimes /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Titre du stage</label>
              <input 
                type="text" 
                value={formData.titre} 
                onChange={(e) => setFormData({...formData, titre: e.target.value})} 
                placeholder="Développement d'une application web"
              />
            </div>
            <div className="form-group">
              <label>Domaine</label>
              <SelectPersonnalise
                value={formData.domaine}
                onChange={(v) => setFormData({...formData, domaine: v})}
                placeholder="Sélectionner"
                className="form-control"
                options={domaineOptions.filter(d => d.value !== 'Tous')}
              />
            </div>
            <div className="form-group">
              <label>Étudiant</label>
              <input 
                type="text" 
                value={formData.etudiant} 
                readOnly
                title="L'étudiant d'un stage ne se modifie pas après création"
                placeholder="Nom de l'étudiant"
              />
            </div>
            <div className="form-group">
              <label>Entreprise</label>
              <input 
                type="text" 
                value={formData.entreprise} 
                readOnly
                title="L'entreprise d'un stage ne se modifie pas après création"
                placeholder="Nom de l'entreprise"
              />
            </div>
            <div className="form-group">
              <label>Encadreur *</label>
              <SelectPersonnalise
                value={supervisorId}
                onChange={(v) => setFormData({...formData, supervisorId: v})}
                placeholder={supervisorLoading ? 'Chargement des encadreurs...' : 'Sélectionner un encadreur'}
                className="form-control"
                options={supervisorOptions}
              />
              {supervisorMissing && (
                <small className="error-text">L'encadreur est obligatoire.</small>
              )}
            </div>
            <div className="form-group">
              <label>Statut</label>
              <SelectPersonnalise
                value={formData.statut}
                onChange={(v) => setFormData({...formData, statut: v})}
                className="form-control"
                options={statutOptions.filter(s => s.value !== 'Tous')}
              />
            </div>
            <div className="form-group">
              <label>Date de début</label>
              <input 
                type="date" 
                value={formData.dateDebut} 
                onChange={(e) => setFormData({...formData, dateDebut: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Date de fin</label>
              <input 
                type="date" 
                value={formData.dateFin} 
                onChange={(e) => setFormData({...formData, dateFin: e.target.value})} 
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel}>Annuler</button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={supervisorMissing || supervisorLoading}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StageForm;
