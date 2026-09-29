// src/pages/admin/components/EncadreurForm.jsx
import { FaTimes } from 'react-icons/fa';
import SelectPersonnalise from '../../../components/Common/SelectPersonnalise';
import { sanitizePhone } from '../../../utils/phone';

function EncadreurForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  title, 
  submitLabel,
  typeOptions,
  fonctionOptions,
  showPassword = false,
  error = '',
  submitting = false
}) {
  return (
    <div className="modal-overlay" onClick={() => !submitting && onCancel()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onCancel} disabled={submitting}><FaTimes /></button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-danger">{error}</div>}
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
            {showPassword && (
              <div className="form-group">
                <label>Mot de passe *</label>
                <input 
                  type="password" 
                  value={formData.motDePasse || ''} 
                  onChange={(e) => setFormData({...formData, motDePasse: e.target.value})} 
                  placeholder="8 caractères minimum" 
                  autoComplete="new-password" 
                />
              </div>
            )}
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
              <label>Type d'encadreur</label>
              <SelectPersonnalise
                value={formData.type}
                onChange={(v) => setFormData({...formData, type: v})}
                className="form-control"
                options={typeOptions.filter(t => t.value !== 'Tous')}
              />
            </div>
            <div className="form-group">
              <label>Fonction</label>
              <SelectPersonnalise
                value={formData.fonction}
                onChange={(v) => setFormData({...formData, fonction: v})}
                placeholder="Sélectionner"
                className="form-control"
                options={fonctionOptions.filter(f => f.value !== 'Tous')}
              />
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
          <button className="btn-secondary" onClick={onCancel} disabled={submitting}>Annuler</button>
          <button className="btn-primary" onClick={onSubmit} disabled={submitting}>
            {submitting ? 'Enregistrement...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EncadreurForm;
