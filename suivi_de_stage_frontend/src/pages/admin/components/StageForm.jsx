// src/pages/admin/components/StageForm.jsx
import { FaTimes } from 'react-icons/fa';
import SelectPersonnalise from '../../../components/Common/SelectPersonnalise';
import DateField from '../../../components/Common/DateField';

function StageForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  title, 
  submitLabel,
  statutOptions,
  domaineOptions
}) {
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
                onChange={(e) => setFormData({...formData, etudiant: e.target.value})} 
                placeholder="Nom de l'étudiant"
              />
            </div>
            <div className="form-group">
              <label>Entreprise</label>
              <input 
                type="text" 
                value={formData.entreprise} 
                onChange={(e) => setFormData({...formData, entreprise: e.target.value})} 
                placeholder="Nom de l'entreprise"
              />
            </div>
            <div className="form-group">
              <label>Encadreur</label>
              <input 
                type="text" 
                value={formData.encadreur} 
                onChange={(e) => setFormData({...formData, encadreur: e.target.value})} 
                placeholder="Nom de l'encadreur"
              />
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
              <DateField 
                value={formData.dateDebut} 
                onChange={(e) => setFormData({...formData, dateDebut: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Date de fin</label>
              <DateField 
                value={formData.dateFin} 
                onChange={(e) => setFormData({...formData, dateFin: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Progression (%)</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                value={formData.progression} 
                onChange={(e) => setFormData({...formData, progression: parseInt(e.target.value) || 0})} 
                placeholder="0"
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel}>Annuler</button>
          <button className="btn-primary" onClick={onSubmit}>{submitLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default StageForm;