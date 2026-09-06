// src/pages/admin/components/EtudiantForm.jsx
import { FaTimes } from 'react-icons/fa';

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
  statutOptions
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
              <label>Matricule</label>
              <input 
                type="text" 
                value={formData.matricule} 
                onChange={(e) => setFormData({...formData, matricule: e.target.value})} 
                placeholder="ETUXXX"
              />
            </div>
            <div className="form-group">
              <label>Nom</label>
              <input 
                type="text" 
                value={formData.nom} 
                onChange={(e) => setFormData({...formData, nom: e.target.value})} 
                placeholder="Rakoto"
              />
            </div>
            <div className="form-group">
              <label>Prénom</label>
              <input 
                type="text" 
                value={formData.prenom} 
                onChange={(e) => setFormData({...formData, prenom: e.target.value})} 
                placeholder="Miora"
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
              <label>Filière</label>
              <select 
                value={formData.filiere} 
                onChange={(e) => setFormData({...formData, filiere: e.target.value})}
              >
                <option value="">Sélectionner</option>
                {filiereOptions.filter(f => f !== 'Tous').map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Promotion</label>
              <select 
                value={formData.promotion} 
                onChange={(e) => setFormData({...formData, promotion: e.target.value})}
              >
                <option value="">Sélectionner</option>
                {promotionOptions.filter(p => p !== 'Tous').map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Niveau</label>
              <select 
                value={formData.niveau} 
                onChange={(e) => setFormData({...formData, niveau: e.target.value})}
              >
                <option value="">Sélectionner</option>
                {niveauOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Statut</label>
              <select 
                value={formData.statut} 
                onChange={(e) => setFormData({...formData, statut: e.target.value})}
              >
                {statutOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
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

export default EtudiantForm;