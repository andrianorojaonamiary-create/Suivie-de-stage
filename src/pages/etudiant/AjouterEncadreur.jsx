import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaSave, FaUserTie, FaEnvelope, FaPhone, FaBuilding, 
  FaTimes, FaInfoCircle, FaUserGraduate, FaArrowLeft,
 
} from 'react-icons/fa';

function AjouterEncadreur() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const encadreurData = location.state?.encadreur || null;
  
  const isEditing = !!encadreurData;
  const isViewMode = location.pathname.includes('/voir');
  
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nom: encadreurData?.nom || '',
    prenom: encadreurData?.prenom || '',
    fonction: encadreurData?.fonction || '',
    entreprise: encadreurData?.entreprise || '',
    email: encadreurData?.email || '',
    telephone: encadreurData?.telephone || '',
    specialite: encadreurData?.specialite || ''
  });

  const handleChange = (e) => {
    if (isViewMode) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isViewMode) return;
    
    if (!formData.nom || !formData.prenom) {
      alert('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      if (isEditing) {
        alert('✅ Encadreur modifié avec succès !');
      } else {
        alert('✅ Encadreur ajouté avec succès !');
      }
      setLoading(false);
      navigate('/etudiant/encadreur');
    }, 1500);
  };

  const getTitle = () => {
    if (isViewMode) return 'Consulter l\'encadreur';
    if (isEditing) return 'Modifier l\'encadreur';
    return 'Ajouter un encadreur';
  };

  const getSubtitle = () => {
    if (isViewMode) return 'Consultez les informations de votre encadreur';
    if (isEditing) return 'Modifiez les informations de votre encadreur';
    return 'Renseignez les informations de votre encadreur';
  };

  return (
    <div className="etudiant-form-page">
      {/* ===== HEADER ===== */}
      <div className="form-header">
        <button className="btn-back" onClick={() => navigate('/etudiant/encadreur')}>
          <FaArrowLeft /> Retour
        </button>
        <h1>{getTitle()}</h1>
        <p className="text-muted">{getSubtitle()}</p>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {/* ===== SECTION 1 : IDENTITÉ ===== */}
          <div className="form-section">
            <h3 className="form-section-title">
              <FaUserTie /> Identité
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label><FaUserTie /> Nom {!isViewMode && '*'}</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Rakotomalala"
                  required={!isViewMode}
                  disabled={isViewMode}
                  className={isViewMode ? 'field-disabled' : ''}
                />
              </div>
              <div className="form-group">
                <label><FaUserTie /> Prénom {!isViewMode && '*'}</label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Jean"
                  required={!isViewMode}
                  disabled={isViewMode}
                  className={isViewMode ? 'field-disabled' : ''}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><FaInfoCircle /> Fonction</label>
                <input
                  type="text"
                  name="fonction"
                  value={formData.fonction}
                  onChange={handleChange}
                  placeholder="Directeur technique"
                  disabled={isViewMode}
                  className={isViewMode ? 'field-disabled' : ''}
                />
              </div>
              <div className="form-group">
                <label><FaBuilding /> Entreprise</label>
                <input
                  type="text"
                  name="entreprise"
                  value={formData.entreprise}
                  onChange={handleChange}
                  placeholder="Nom de l'entreprise"
                  disabled={isViewMode}
                  className={isViewMode ? 'field-disabled' : ''}
                />
              </div>
            </div>
          </div>

          {/* ===== SECTION 2 : CONTACT ===== */}
          <div className="form-section">
            <h3 className="form-section-title">
              <FaPhone /> Contact
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label><FaEnvelope /> Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@entreprise.mg"
                  disabled={isViewMode}
                  className={isViewMode ? 'field-disabled' : ''}
                />
              </div>
              <div className="form-group">
                <label><FaPhone /> Téléphone</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="+261 34 12 345 67"
                  disabled={isViewMode}
                  className={isViewMode ? 'field-disabled' : ''}
                />
              </div>
            </div>
          </div>

          {/* ===== SECTION 3 : SPÉCIALITÉ ===== */}
          <div className="form-section">
            <h3 className="form-section-title">
              <FaUserGraduate /> Spécialité
            </h3>

            <div className="form-row">
              <div className="form-group full-width">
                <label><FaUserGraduate /> Spécialité</label>
                <input
                  type="text"
                  name="specialite"
                  value={formData.specialite}
                  onChange={handleChange}
                  placeholder="Développement logiciel"
                  disabled={isViewMode}
                  className={isViewMode ? 'field-disabled' : ''}
                />
              </div>
            </div>
          </div>

          {/* ===== SECTION 4 : ÉTUDIANTS ===== 
          {isViewMode && encadreurData?.etudiants && (
            <div className="form-section">
              <h3 className="form-section-title">
                <FaUsers /> Étudiants encadrés
              </h3>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="etudiants-list-disabled">
                    {encadreurData.etudiants.length > 0 ? (
                      encadreurData.etudiants.map((etudiant, index) => (
                        <span key={index} className="etudiant-tag">{etudiant}</span>
                      ))
                    ) : (
                      <span className="text-muted">Aucun étudiant encadré</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          */}

          {/* ===== BOUTONS ===== */}
          <div className="form-actions">
            {isViewMode ? (
              <button type="button" className="btn-secondary" onClick={() => navigate('/etudiant/encadreur')}>
                Retour
              </button>
            ) : (
              <>
                <button type="submit" className="btn-primary" disabled={loading}>
                  <FaSave /> {loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Ajouter')}
                </button>
                <button type="button" className="btn-reset" onClick={() => navigate('/etudiant/encadreur')}>
                  <FaTimes /> Annuler
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AjouterEncadreur;