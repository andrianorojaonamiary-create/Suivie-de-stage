import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useAuth } from '../hooks/useAuth';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function CarteStages() {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [filterCity, setFilterCity] = useState('Toutes');

  // ===== DONNÉES PAR RÔLE =====
  const getMarkersByRole = () => {
    const role = user?.role;
    
    // Tous les stages (pour Admin et Enseignant)
    const allStages = [
      { id: 1, student: 'Miora Rakoto', company: 'TechMada SARL', city: 'Antananarivo', subject: 'Plateforme web RH', status: 'En cours', lat: -18.8792, lng: 47.5079 },
      { id: 2, student: 'Hery Rakotondrabe', company: 'Airtel Madagascar', city: 'Antananarivo', subject: 'Application mobile', status: 'En attente', lat: -18.8792, lng: 47.5079 },
      { id: 3, student: 'Fanja Andriantsoa', company: 'BNI Madagascar', city: 'Antananarivo', subject: 'Système de reporting', status: 'En cours', lat: -18.8792, lng: 47.5079 },
      { id: 4, student: 'Tojo Ramanantsoa', company: 'JIRAMA', city: 'Fianarantsoa', subject: 'Supervision réseau', status: 'En cours', lat: -21.4588, lng: 47.0878 },
      { id: 5, student: 'Lalao Rasamimanana', company: 'Orange Madagascar', city: 'Antananarivo', subject: 'Analyse de données', status: 'Terminé', lat: -18.8792, lng: 47.5079 },
      { id: 6, student: 'Noro Raharison', company: 'CNAPS', city: 'Toamasina', subject: "Système d'information", status: 'Validé', lat: -18.1492, lng: 49.4023 },
      { id: 7, student: 'Solo Rakotoarisoa', company: 'Telma', city: 'Mahajanga', subject: 'Infrastructure Cloud', status: 'En cours', lat: -15.7167, lng: 46.3167 },
      { id: 8, student: 'Vola Randrianirina', company: 'Star Madagascar', city: 'Antsirabe', subject: 'ERP implémentation', status: 'En cours', lat: -19.8659, lng: 47.0333 },
    ];

    // Stages pour Encadreur (seulement ceux qu'il suit)
    const encadreurStages = [
      { id: 4, student: 'Tojo Ramanantsoa', company: 'JIRAMA', city: 'Fianarantsoa', subject: 'Supervision réseau', status: 'En cours', lat: -21.4588, lng: 47.0878 },
      { id: 6, student: 'Noro Raharison', company: 'CNAPS', city: 'Toamasina', subject: "Système d'information", status: 'Validé', lat: -18.1492, lng: 49.4023 },
    ];

    // Stages pour Étudiant (seulement son stage)
    const etudiantStages = [
      { id: 1, student: 'Miora Rakoto', company: 'TechMada SARL', city: 'Antananarivo', subject: 'Plateforme web RH', status: 'En cours', lat: -18.8792, lng: 47.5079 },
    ];

    if (role === 'ROLE_ADMIN' || role === 'ROLE_ENSEIGNANT') {
      return allStages;
    } else if (role === 'ROLE_ENCADREUR') {
      return encadreurStages;
    } else if (role === 'ROLE_ETUDIANT') {
      return etudiantStages;
    }
    return allStages;
  };

  const stageMarkers = getMarkersByRole();

  const statusColors = {
    'En cours': '#27AE60',
    'En attente': '#F39C12',
    'Terminé': '#6c7a8a',
    'Validé': '#4A90D9',
  };

  const statusLabels = {
    'En cours': 'badge-en-cours',
    'En attente': 'badge-en-attente',
    'Terminé': 'badge-termine',
    'Validé': 'badge-valide',
  };

  const filteredMarkers = stageMarkers.filter(
    m => (filterStatus === 'Tous' || m.status === filterStatus) &&
         (filterCity === 'Toutes' || m.city === filterCity)
  );

  const cities = ['Toutes', ...new Set(stageMarkers.map(m => m.city))];
  const center = [-18.8792, 47.5079];

  // ===== TITRE SELON LE RÔLE =====
  const getTitle = () => {
    const role = user?.role;
    if (role === 'ROLE_ETUDIANT') return '🗺️ Localisation de mon stage';
    if (role === 'ROLE_ENCADREUR') return '🗺️ Stages que je suis';
    return '🗺️ Carte des stages';
  };

  const getSubtitle = () => {
    const role = user?.role;
    if (role === 'ROLE_ETUDIANT') return 'Votre stage est localisé sur la carte';
    if (role === 'ROLE_ENCADREUR') return `${stageMarkers.length} stage(s) que vous encadrez`;
    return `${stageMarkers.length} stages localisés sur Madagascar`;
  };

  return (
    <div className="map-page-container">
      <div className="map-page-header">
        <h2>{getTitle()}</h2>
        <p className="text-muted">{getSubtitle()}</p>
      </div>

      <div className="map-layout">
        <div className="map-sidebar">
          <div className="card-emit">
            <h4 className="filter-title">Filtres</h4>
            <div className="filter-group">
              <label className="filter-label">Statut</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option>Tous</option>
                <option>En cours</option>
                <option>En attente</option>
                <option>Terminé</option>
                <option>Validé</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Ville</label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="filter-select"
              >
                {cities.map(city => (
                  <option key={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card-emit">
            <h4 className="filter-title">Légende</h4>
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: color }} />
                <span className="legend-label">{status}</span>
              </div>
            ))}
          </div>

          <div className="card-emit">
            <h4 className="filter-title">Statistiques</h4>
            {cities.filter(c => c !== 'Toutes').map(city => {
              const count = stageMarkers.filter(m => m.city === city).length;
              return (
                <div key={city} className="city-stat-item">
                  <span className="city-stat-name">{city}</span>
                  <div className="city-stat-bar">
                    <div className="city-stat-fill" style={{ width: `${(count / stageMarkers.length) * 100}%` }} />
                  </div>
                  <span className="city-stat-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="map-container">
          <MapContainer
            center={center}
            zoom={7}
            style={{ height: '100%', width: '100%', borderRadius: '12px' }}
          >
            <ChangeView center={center} zoom={7} />
            
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />

            {filteredMarkers.map((marker) => (
              <Marker
                key={marker.id}
                position={[marker.lat, marker.lng]}
              >
                <Popup>
                  <div className="popup-content">
                    <h4>{marker.student}</h4>
                    <p><strong>Entreprise :</strong> {marker.company}</p>
                    <p><strong>Ville :</strong> {marker.city}</p>
                    <p><strong>Sujet :</strong> {marker.subject}</p>
                    <span className={statusLabels[marker.status] || 'badge-en-attente'}>
                      {marker.status}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default CarteStages;