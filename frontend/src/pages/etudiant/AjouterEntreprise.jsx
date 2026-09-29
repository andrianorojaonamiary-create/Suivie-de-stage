import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaSave, FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, 
  FaGlobe, FaTimes, FaSpinner, FaMapPin, FaInfoCircle,
  FaArrowLeft
} from 'react-icons/fa';
import { geocodeAddress } from '../../services/geocoding';
import { sanitizePhone } from '../../utils/phone';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function AjouterEntreprise() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const entrepriseData = location.state?.entreprise || null;
  
  const isEditing = !!entrepriseData;
  const isViewMode = location.pathname.includes('/voir');
  
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [locationMap, setLocationMap] = useState(null);
  const [geocodeError, setGeocodeError] = useState('');
  
  const [formData, setFormData] = useState({
    nom: entrepriseData?.nom || '',
    domaine: entrepriseData?.domaine || '',
    adresse: entrepriseData?.adresse || '',
    ville: entrepriseData?.ville || '',
    telephone: entrepriseData?.telephone || '',
    email: entrepriseData?.email || '',
    site: entrepriseData?.site || '',
    description: entrepriseData?.description || ''
  });

  const handleChange = (e) => {
    if (isViewMode) return;
    const { name, value } = e.target;
    const nextValue = name === 'telephone' ? sanitizePhone(value) : value;
    setFormData(prev => ({ ...prev, [name]: nextValue }));
  };

  const handleGeocode = async () => {
    if (isViewMode) return;
    const fullAddress = `${formData.adresse}, ${formData.ville}`.trim();
    if (!fullAddress || fullAddress === ',') {
      setGeocodeError('Veuillez saisir une adresse complète');
      return;
    }

    setGeocoding(true);
    setGeocodeError('');
    
    try {
      const result = await geocodeAddress(fullAddress);
      if (result) {
        setLocationMap(result);
        setGeocodeError('');
      } else {
        setGeocodeError('Adresse non trouvée. Veuillez vérifier.');
        setLocationMap(null);
      }
    } catch (err) {
      console.error('Erreur de géocodage:', err);
      setGeocodeError('Erreur de connexion au service de géocodage.');
      setLocationMap(null);
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isViewMode) return;
    
    if (!formData.nom || !formData.ville) {
      alert('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      if (isEditing) {
        alert('Entreprise modifiée avec succès !');
      } else {
        alert('Entreprise ajoutée avec succès !');
      }
      setLoading(false);
      navigate('/etudiant/entreprise');
    }, 1500);
  };

  const getTitle = () => {
    if (isViewMode) return 'Consulter l\'entreprise';
    if (isEditing) return 'Modifier l\'entreprise';
    return 'Ajouter une entreprise';
  };

  const getSubtitle = () => {
    if (isViewMode) return 'Consultez les informations de votre entreprise d\'accueil';
    if (isEditing) return 'Modifiez les informations de votre entreprise';
    return 'Renseignez les informations de votre entreprise d\'accueil';
  };

  return (
    <div className="etudiant-form-page">
      {/* ===== HEADER ===== */}
      <div className="form-header">
        <button className="btn-back" onClick={() => navigate('/etudiant/entreprise')}>
          <FaArrowLeft /> Retour
        </button>
        <h1>{getTitle()}</h1>
        <p className="text-muted">{getSubtitle()}</p>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group full-width">
              <label><FaBuilding /> Nom de l'entreprise {!isViewMode && '*'}</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="TechMada SARL"
                required={!isViewMode}
                disabled={isViewMode}
                className={isViewMode ? 'field-disabled' : ''}
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
                placeholder="Technologies de l'information"
                disabled={isViewMode}
                className={isViewMode ? 'field-disabled' : ''}
              />
            </div>
          </div>

          <div className="form-row">
              <div className="form-group">
                <label><FaMapMarkerAlt /> Ville {!isViewMode && '*'}</label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  placeholder="Ville"
                  required={!isViewMode}
                  disabled={isViewMode}
                  className={isViewMode ? 'field-disabled' : ''}
                />
              </div>
              <div className="form-group">
                <label><FaMapMarkerAlt /> Adresse</label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  placeholder="Lot II M 77, Antananarivo"
                  disabled={isViewMode}
                  className={isViewMode ? 'field-disabled' : ''}
                />
              </div>
            </div>

            {!isViewMode && (
              <div className="form-row">
                <div className="form-group full-width">
                  <button
                    type="button"
                    className="btn-geocode"
                    onClick={handleGeocode}
                    disabled={geocoding}
                  >
                    {geocoding ? <FaSpinner className="spinning" /> : <FaMapPin />}
                    {geocoding ? 'Recherche...' : 'Localiser sur la carte'}
                  </button>
                  {geocodeError && <span className="geocode-error">{geocodeError}</span>}
                  {locationMap && <span className="geocode-success">Localisé</span>}
                </div>
              </div>
            )}

            {(locationMap || (entrepriseData?.lat && entrepriseData?.lng)) && (
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Localisation sur la carte</label>
                  <div className="map-preview">
                    <MapContainer
                      center={[locationMap?.lat || entrepriseData?.lat, locationMap?.lon || entrepriseData?.lng]}
                      zoom={15}
                      style={{ height: '200px', width: '100%', borderRadius: '10px' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                      />
                      <Marker position={[locationMap?.lat || entrepriseData?.lat, locationMap?.lon || entrepriseData?.lng]}>
                        <Popup>{formData.nom || 'Entreprise'}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              </div>
            )}
            
            <div className="form-row">
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
                  maxLength={14}
                  inputMode="tel"
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
                  disabled={isViewMode}
                  className={isViewMode ? 'field-disabled' : ''}
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
                  disabled={isViewMode}
                  className={isViewMode ? 'field-disabled' : ''}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label><FaInfoCircle /> Description</label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description de l'entreprise..."
                  disabled={isViewMode}
                  className={isViewMode ? 'field-disabled' : ''}
                />
              </div>
            </div>

          {/* ===== BOUTONS ===== */}
          <div className="form-actions">
            {isViewMode ? (
              <button type="button" className="btn-secondary" onClick={() => navigate('/etudiant/entreprise')}>
                Retour
              </button>
            ) : (
              <>
                <button type="submit" className="btn-primary" disabled={loading}>
                  <FaSave /> {loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Ajouter')}
                </button>
                <button type="button" className="btn-reset" onClick={() => navigate('/etudiant/entreprise')}>
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

export default AjouterEntreprise;