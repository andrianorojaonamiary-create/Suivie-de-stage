// src/pages/admin/components/EncadreurForm.jsx
import { FaTimes } from 'react-icons/fa';

function EncadreurForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  title, 
  submitLabel,
  typeOptions,
  fonctionOptions
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
              <label>Nom</label>
              <input 
                type="text" 
                value={formData.nom} 
                onChange={(e) => setFormData({...formData, nom: e.target.value})} 
                placeholder="RABEMANANTSOA" 
              />
            </div>
            <div className="form-group">
              <label>Prénom</label>
              <input 
                type="text" 
                value={formData.prenom} 
                onChange={(e) => setFormData({...formData, prenom: e.target.value})} 
                placeholder="Nivo" 
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                placeholder="exemple@email.mg" 
              />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input 
                type="text" 
                value={formData.telephone} 
                onChange={(e) => setFormData({...formData, telephone: e.target.value})} 
                placeholder="+261 34 XX XXX XX" 
              />
            </div>
            <div className="form-group">
              <label>Type d'encadreur</label>
              <select 
                value={formData.type} 
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                {typeOptions.filter(t => t !== 'Tous').map(opt => (
                  <option key={opt} value={opt}>
                    {opt === 'professionnel' ? 'Encadreur professionnel' : 'Tuteur pédagogique'}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Fonction</label>
              <select 
                value={formData.fonction} 
                onChange={(e) => setFormData({...formData, fonction: e.target.value})}
              >
                <option value="">Sélectionner</option>
                {fonctionOptions.filter(f => f !== 'Tous').map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Entreprise / Établissement</label>
              <input 
                type="text" 
                value={formData.entreprise} 
                onChange={(e) => setFormData({...formData, entreprise: e.target.value})} 
                placeholder={formData.type === 'professionnel' ? 'Nom de l\'entreprise' : 'EMIT'} 
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

export default EncadreurForm;