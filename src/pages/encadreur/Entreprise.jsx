import { useState } from 'react';

import { 
  FaBuilding, FaMapMarkerAlt, FaPhone, 
  FaEnvelope, FaGlobe, FaSave, FaTimes, FaInfoCircle,
  FaEdit
} from 'react-icons/fa';

function EncadreurEntreprise() {
  
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    nom: 'TechMada SARL',
    domaine: "Technologies de l'information",
    adresse: 'Lot II M 77, Antananarivo',
    ville: 'Antananarivo',
    telephone: '+261 34 12 345 67',
    email: 'contact@techmada.mg',
    site: 'www.techmada.mg',
    description: 'Entreprise spécialisée dans le développement de solutions logicielles.'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      alert('✅ Informations de l\'entreprise mises à jour avec succès !');
      setLoading(false);
      setIsEditing(false);
    }, 1500);
  };

  return (
    <div className="encadreur-entreprise-page">
      {/* ===== HEADER SANS BOUTON RETOUR ===== */}
      <div className="page-header">
        <div>
          <h1><FaBuilding /> Mon entreprise</h1>
          <p className="text-muted">
            {isEditing ? 'Modifiez les informations de votre entreprise' : 'Consultez les informations de votre entreprise'}
          </p>
        </div>
        {!isEditing && (
          <button className="btn-edit-entreprise" onClick={() => setIsEditing(true)}>
            <FaEdit /> Modifier
          </button>
        )}
      </div>

      <div className="form-card">
        {!isEditing ? (
          <div className="entreprise-display">
            <div className="display-row">
              <span className="display-label"><FaBuilding /> Nom</span>
              <span className="display-value"><strong>{formData.nom}</strong></span>
            </div>
            <div className="display-row">
              <span className="display-label"><FaInfoCircle /> Domaine</span>
              <span className="display-value">{formData.domaine}</span>
            </div>
            <div className="display-row">
              <span className="display-label"><FaMapMarkerAlt /> Adresse</span>
              <span className="display-value">{formData.adresse}</span>
            </div>
            <div className="display-row">
              <span className="display-label"><FaMapMarkerAlt /> Ville</span>
              <span className="display-value">{formData.ville}</span>
            </div>
            <div className="display-row">
              <span className="display-label"><FaPhone /> Téléphone</span>
              <span className="display-value">{formData.telephone}</span>
            </div>
            <div className="display-row">
              <span className="display-label"><FaEnvelope /> Email</span>
              <span className="display-value">{formData.email}</span>
            </div>
            <div className="display-row">
              <span className="display-label"><FaGlobe /> Site web</span>
              <span className="display-value">{formData.site}</span>
            </div>
            <div className="display-row display-description">
              <span className="display-label"><FaInfoCircle /> Description</span>
              <span className="display-value">{formData.description}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="form-section-title"><FaBuilding /> Informations générales</h3>

              <div className="form-row">
                <div className="form-group full-width">
                  <label><FaBuilding /> Nom de l'entreprise *</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Nom de l'entreprise"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><FaInfoCircle /> Domaine d'activité</label>
                  <input
                    type="text"
                    name="domaine"
                    value={formData.domaine}
                    onChange={handleChange}
                    placeholder="Domaine d'activité"
                  />
                </div>
                <div className="form-group">
                  <label><FaMapMarkerAlt /> Ville</label>
                  <input
                    type="text"
                    name="ville"
                    value={formData.ville}
                    onChange={handleChange}
                    placeholder="Ville"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label><FaMapMarkerAlt /> Adresse</label>
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    placeholder="Adresse complète"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title"><FaPhone /> Contact</h3>

              <div className="form-row">
                <div className="form-group">
                  <label><FaPhone /> Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="+261 34 12 345 67"
                  />
                </div>
                <div className="form-group">
                  <label><FaEnvelope /> Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@entreprise.mg"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><FaGlobe /> Site web</label>
                  <input
                    type="text"
                    name="site"
                    value={formData.site}
                    onChange={handleChange}
                    placeholder="www.entreprise.mg"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title"><FaInfoCircle /> Description</h3>

              <div className="form-row">
                <div className="form-group full-width">
                  <textarea
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Description de l'entreprise..."
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                <FaSave /> {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
              <button type="button" className="btn-reset" onClick={() => setIsEditing(false)}>
                <FaTimes /> Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EncadreurEntreprise;