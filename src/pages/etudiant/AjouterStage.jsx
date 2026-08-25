import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSave, FaBuilding, FaUserTie, FaCalendarAlt, 
  FaFileAlt, FaMapMarkerAlt, FaSpinner, FaMapPin,
  FaTimes, FaUpload, FaInfoCircle, FaBriefcase
} from 'react-icons/fa';
import { geocodeAddress } from '../../services/geocoding';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function AjouterStage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titre: '',
    entreprise: '',
    ville: '',
    adresse: '',
    dateDebut: '',
    dateFin: '',
    tuteur: '',
    encadreur: '',
    description: '',
  });
  const [fichier, setFichier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [location, setLocation] = useState(null);
  const [geocodeError, setGeocodeError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFichier(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFichier(null);
    document.getElementById('fileInput').value = '';
  };

  const handleGeocode = async () => {
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
        setLocation(result);
        setGeocodeError('');
      } else {
        setGeocodeError('Adresse non trouvée. Veuillez vérifier.');
        setLocation(null);
      }
    } catch (err) {
      console.error('Erreur de géocodage:', err);
      setGeocodeError('Erreur de connexion au service de géocodage.');
      setLocation(null);
    } finally {
      setGeocoding(false);
    }
  };

  const handleReset = () => {
    setFormData({
      titre: '',
      entreprise: '',
      ville: '',
      adresse: '',
      dateDebut: '',
      dateFin: '',
      tuteur: '',
      encadreur: '',
      description: '',
    });
    setFichier(null);
    setLocation(null);
    setGeocodeError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.titre || !formData.entreprise || !formData.ville || !formData.dateDebut || !formData.dateFin) {
      alert('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('✅ Stage ajouté avec succès !');
      navigate('/etudiant/mes-stages');
    }, 1500);
  };

  return (
    <div className="etudiant-form-page">
      <div className="form-header">
        <h1>Ajouter un stage</h1>
        <p className="text-muted">Renseignez les informations de votre stage</p>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {/* ===== SECTION 1 : INFORMATIONS GÉNÉRALES ===== */}
          <div className="form-section">
            <h3 className="form-section-title">
              <FaInfoCircle /> Informations générales
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label><FaFileAlt /> Titre du stage *</label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  placeholder="Ex: Développement d'une plateforme web"
                  required
                />
              </div>
              <div className="form-group">
                <label><FaUserTie /> Tuteur pédagogique</label>
                <input
                  type="text"
                  name="tuteur"
                  value={formData.tuteur}
                  onChange={handleChange}
                  placeholder="Nom du tuteur"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><FaCalendarAlt /> Date de début *</label>
                <input
                  type="date"
                  name="dateDebut"
                  value={formData.dateDebut}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label><FaCalendarAlt /> Date de fin *</label>
                <input
                  type="date"
                  name="dateFin"
                  value={formData.dateFin}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description du stage..."
                />
              </div>
            </div>
          </div>

          {/* ===== SECTION 2 : INFORMATIONS DE L'ENTREPRISE ===== */}
          <div className="form-section">
            <h3 className="form-section-title">
              <FaBriefcase /> Informations de l'entreprise
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label><FaBuilding /> Entreprise *</label>
                <input
                  type="text"
                  name="entreprise"
                  value={formData.entreprise}
                  onChange={handleChange}
                  placeholder="Nom de l'entreprise"
                  required
                />
              </div>
              <div className="form-group">
                <label><FaMapMarkerAlt /> Ville *</label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  placeholder="Ville"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label><FaMapMarkerAlt /> Adresse</label>
                <div className="address-input-group">
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    placeholder="Lot II M 77, Antananarivo"
                    className="address-input"
                  />
                  <button
                    type="button"
                    className="btn-geocode"
                    onClick={handleGeocode}
                    disabled={geocoding}
                  >
                    {geocoding ? <FaSpinner className="spinning" /> : <FaMapPin />}
                    {geocoding ? 'Recherche...' : 'Localiser'}
                  </button>
                </div>
                {geocodeError && <span className="geocode-error">{geocodeError}</span>}
                {location && (
                  <span className="geocode-success">✅ Localisé</span>
                )}
              </div>
            </div>

            {location && (
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Aperçu de la localisation</label>
                  <div className="map-preview">
                    <MapContainer
                      center={[location.lat, location.lon]}
                      zoom={15}
                      style={{ height: '200px', width: '100%', borderRadius: '10px' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                      />
                      <Marker position={[location.lat, location.lon]}>
                        <Popup>{formData.entreprise || 'Stage'}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label><FaUserTie /> Encadreur</label>
                <input
                  type="text"
                  name="encadreur"
                  value={formData.encadreur}
                  onChange={handleChange}
                  placeholder="Nom de l'encadreur"
                />
              </div>
            </div>
          </div>

          {/* ===== SECTION 3 : CONVENTION DE STAGE ===== */}
          <div className="form-section">
            <h3 className="form-section-title">
              <FaFileAlt /> Documents
            </h3>

            <div className="form-row">
              <div className="form-group full-width">
                <label><FaFileAlt /> Convention de stage (PDF)</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="fileInput"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="fileInput" className="file-label-btn">
                    <FaUpload /> Parcourir
                  </label>
                  {fichier ? (
                    <>
                      <span className="file-selected-name">📄 {fichier.name}</span>
                      <button
                        type="button"
                        className="file-remove-btn"
                        onClick={handleRemoveFile}
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <span className="file-placeholder">Aucun fichier sélectionné</span>
                  )}
                </div>
                <small className="form-hint">Format PDF, max 5 Mo</small>
              </div>
            </div>
          </div>

          {/* ===== BOUTONS ===== */}
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              <FaSave /> {loading ? 'Enregistrement...' : 'Enregistrer le stage'}
            </button>
            <button type="button" className="btn-reset" onClick={handleReset}>
              <FaTimes /> Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AjouterStage;