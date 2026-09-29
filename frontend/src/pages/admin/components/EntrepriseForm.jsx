// src/pages/admin/components/EntrepriseForm.jsx
import { FaTimes } from 'react-icons/fa';
import SelectPersonnalise from '../../../components/Common/SelectPersonnalise';
import { sanitizePhone } from '../../../utils/phone';

function EntrepriseForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  title, 
  submitLabel,
  domaineOptions,
  villeOptions
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
              <label>Nom de l'entreprise</label>
              <input 
                type="text" 
                value={formData.nom} 
                onChange={(e) => setFormData({...formData, nom: e.target.value})} 
                placeholder="ABC Informatique"
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
              <label>Adresse</label>
              <input 
                type="text" 
                value={formData.adresse} 
                onChange={(e) => setFormData({...formData, adresse: e.target.value})} 
                placeholder="Lot III A 15 bis, Andrainjato"
              />
            </div>
            <div className="form-group">
              <label>Ville</label>
              <SelectPersonnalise
                value={formData.ville}
                onChange={(v) => setFormData({...formData, ville: v})}
                placeholder="Sélectionner"
                className="form-control"
                options={villeOptions.filter(v => v.value !== 'Tous')}
              />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input 
                type="tel" 
                value={formData.telephone} 
                onChange={(e) => setFormData({...formData, telephone: sanitizePhone(e.target.value)})} 
                placeholder="+261 34 XX XXX XX"
                maxLength={14}
                inputMode="tel"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                placeholder="contact@entreprise.mg"
              />
            </div>
            <div className="form-group">
              <label>Latitude</label>
              <input 
                type="text" 
                value={formData.latitude} 
                onChange={(e) => setFormData({...formData, latitude: e.target.value})} 
                placeholder="-18.8792"
              />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input 
                type="text" 
                value={formData.longitude} 
                onChange={(e) => setFormData({...formData, longitude: e.target.value})} 
                placeholder="47.5079"
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

export default EntrepriseForm;