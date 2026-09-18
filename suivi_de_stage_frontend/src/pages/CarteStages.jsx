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

import mapApi from '../api/mapApi';
import SelectPersonnalise from '../components/Common/SelectPersonnalise';

function CarteStages() {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [filterCity, setFilterCity] = useState('Toutes');
  const [stageMarkers, setStageMarkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapPoints = async () => {
      try {
        setLoading(true);
        const data = await mapApi.getInternships();
        const rawList = Array.isArray(data) ? data : data?.items || [];

        if (rawList.length > 0) {
          const mapped = rawList.map(item => ({
            id: item.id,
            student: item.etudiant ? `${item.etudiant.prenom} ${item.etudiant.nom}` : (item.student || 'Étudiant'),
            company: item.entreprise?.nom || item.company || 'Entreprise',
            city: item.entreprise?.ville || item.city || 'Antananarivo',
            subject: item.titre || item.subject || 'Stage',
            status: item.statut === 'en_cours' ? 'En cours' : item.statut === 'a_venir' ? 'En attente' : 'Terminé',
            lat: parseFloat(item.latitude || item.entreprise?.latitude || -18.8792),
            lng: parseFloat(item.longitude || item.entreprise?.longitude || 47.5079)
          }));
          setStageMarkers(mapped);
        } else {
          setStageMarkers([]);
        }
      } catch (err) {
        console.error('Erreur chargement carte:', err);
        setStageMarkers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMapPoints();
  }, []);

  const statusColors = {
    'En cours': '#27AE60',
    'En attente': '#F39C12',
    'Terminé': '#6c7a8a',
    'Validé': '#6BA9E6',
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
    if (role === 'ROLE_ETUDIANT') return 'Localisation de mon stage';
    if (role === 'ROLE_ENCADREUR') return 'Stages que je suis';
    return 'Carte des stages';
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
              <SelectPersonnalise
                value={filterStatus}
                onChange={setFilterStatus}
                className="filter-select"
                options={[
                  { value: 'Tous', label: 'Tous les statuts' },
                  { value: 'En cours', label: 'En cours' },
                  { value: 'En attente', label: 'En attente' },
                  { value: 'Terminé', label: 'Terminé' },
                  { value: 'Validé', label: 'Validé' }
                ]}
              />
            </div>
            <div className="filter-group">
              <SelectPersonnalise
                value={filterCity}
                onChange={setFilterCity}
                className="filter-select"
                options={cities.map(city => ({ value: city, label: city === 'Toutes' ? 'Toutes les villes' : city }))}
              />
            </div>
          </div>

          <div className="card-emit">
            <h4 className="filter-title">Légende</h4>
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: color }} />
                <span className="legend-label">{status}</span>
                <span className="legend-count">
                  {stageMarkers.filter(m => m.status === status).length}
                </span>
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