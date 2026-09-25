// src/pages/admin/components/EtudiantForm.jsx
import { FaTimes } from 'react-icons/fa';
import SelectPersonnalise from '../../../components/Common/SelectPersonnalise';
import { sanitizePhone } from '../../../utils/phone';

function EtudiantForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  title, 
  submitLabel,
  filiereOptions,
  promotionOptions,
  niveauOptions,
  statutOptions,
  isCreate = false
}) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onCancel}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Matricule *</label>
              <input 
                type="text" 
                value={formData.matricule || ''} 
                onChange={(e) => setFormData({...formData, matricule: e.target.value})} 
                placeholder="ETU001"
              />
            </div>
            <div className="form-group">
              <label>Nom *</label>
              <input 
                type="text" 
                value={formData.nom || ''} 
                onChange={(e) => setFormData({...formData, nom: e.target.value})} 
                placeholder="Rakoto"
              />
            </div>
            <div className="form-group">
              <label>Prénom *</label>
              <input 
                type="text" 
                value={formData.prenom || ''} 
                onChange={(e) => setFormData({...formData, prenom: e.target.value})} 
                placeholder="Miora"
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input 
                type="email" 
                value={formData.email || ''} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                placeholder="miora.rakoto@email.mg"
              />
            </div>
            {isCreate && (
              <div className="form-group">
                <label>Mot de passe *</label>
                <input 
                  type="password" 
                  value={formData.motDePasse || ''} 
                  onChange={(e) => setFormData({...formData, motDePasse: e.target.value})} 
                  placeholder="Minimum 8 caractères"
                />
              </div>
            )}
            <div className="form-group">
              <label>Téléphone</label>
              <input 
                type="tel" 
                value={formData.telephone || ''} 
                onChange={(e) => setFormData({...formData, telephone: sanitizePhone(e.target.value)})} 
                placeholder="+261 34 12 345 67"
                maxLength={14}
                inputMode="tel"
              />
            </div>
            <div className="form-group">
              <label>Filière / Formation *</label>
              <SelectPersonnalise
                value={formData.filiere || ''}
                onChange={(v) => setFormData({...formData, filiere: v})}
                placeholder="Sélectionner"
                className="form-control"
                options={filiereOptions.filter(f => f.value !== 'Tous')}
              />
            </div>
            <div className="form-group">
              <label>Promotion *</label>
              <SelectPersonnalise
                value={formData.promotion || ''}
                onChange={(v) => setFormData({...formData, promotion: v})}
                placeholder="Sélectionner"
                className="form-control"
                options={promotionOptions.filter(p => p.value !== 'Tous')}
              />
            </div>
            <div className="form-group">
              <label>Niveau *</label>
              <SelectPersonnalise
                value={formData.niveau || ''}
                onChange={(v) => setFormData({...formData, niveau: v})}
                placeholder="Sélectionner"
                className="form-control"
                options={niveauOptions}
              />
            </div>
            {!isCreate && (
              <div className="form-group">
                <label>Statut</label>
                <SelectPersonnalise
                  value={formData.statut || 'Actif'}
                  onChange={(v) => setFormData({...formData, statut: v})}
                  className="form-control"
                  options={statutOptions}
                />
              </div>
            )}
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

export default EtudiantForm;