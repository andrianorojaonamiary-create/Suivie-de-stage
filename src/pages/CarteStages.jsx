import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { FaSearch } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import apiClient, { getApiErrorMessage } from '../api/apiClient';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png', iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png' });

const stageStatuses = {
  A_VENIR: { label: 'À venir', color: '#F39C12', badge: 'badge-en-attente' },
  EN_COURS: { label: 'En cours', color: '#27AE60', badge: 'badge-en-cours' },
  TERMINE: { label: 'Terminé', color: '#6c7a8a', badge: 'badge-termine' },
  SUSPENDU: { label: 'Suspendu', color: '#E74C3C', badge: 'badge-en-attente' },
  ANNULE: { label: 'Annulé', color: '#6c7a8a', badge: 'badge-termine' },
};
const formatDate = (value) => value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value)) : 'Non renseignée';
const uniqueValues = (items) => [...new Set(items.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
const allFilterLabels = { Ville: 'Toutes les villes', Formation: 'Toutes les formations', Promotion: 'Toutes les promotions', Domaine: 'Tous les domaines' };

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
  return null;
}

function CarteStages() {
  const { user } = useAuth();
  const isSupervisor = user?.role === 'ROLE_ENCADREUR';
  const [stageMarkers, setStageMarkers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ ville: '', formation: '', promotion: '', domaine: '', statut: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMarkers = async () => {
      try {
        setIsLoading(true);
        const params = { limit: 500 };
        if (isSupervisor) {
          const { data: supervisor } = await apiClient.get('/supervisors/me');
          params.supervisorId = supervisor.id;
        }
        const { data } = await apiClient.get('/map/internships', { params });
        setStageMarkers(data || []);
        setError('');
      } catch (loadError) { setError(getApiErrorMessage(loadError, 'Impossible de charger les emplacements des stages.')); }
      finally { setIsLoading(false); }
    };
    if (user) void loadMarkers();
  }, [user]);

  const options = useMemo(() => ({ villes: uniqueValues(stageMarkers.map((item) => item.ville)), formations: uniqueValues(stageMarkers.map((item) => item.formation)), promotions: uniqueValues(stageMarkers.map((item) => item.promotion)), domaines: uniqueValues(stageMarkers.map((item) => item.domaine)) }), [stageMarkers]);
  const filteredMarkers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return stageMarkers.filter((item) => {
      const values = [item.nomEntreprise, item.ville, item.prenomEtudiant, item.nomEtudiant, item.domaine, item.intitule].filter(Boolean).join(' ').toLowerCase();
      return (!term || values.includes(term)) && (!filters.ville || item.ville === filters.ville) && (!filters.formation || item.formation === filters.formation) && (!filters.promotion || item.promotion === filters.promotion) && (!filters.domaine || item.domaine === filters.domaine) && (!filters.statut || item.statut === filters.statut);
    });
  }, [filters, searchTerm, stageMarkers]);
  const center = filteredMarkers.length > 0 ? [filteredMarkers[0].latitude, filteredMarkers[0].longitude] : [-18.8792, 47.5079];
  const updateFilter = (name) => (event) => setFilters((current) => ({ ...current, [name]: event.target.value }));
  const select = (id, label, name, values) => <div className="filter-group"><label className="filter-label" htmlFor={id}>{label}</label><select id={id} value={filters[name]} onChange={updateFilter(name)} className="filter-select"><option value="">{allFilterLabels[label]}</option>{values.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>;

  return <div className="map-page-container"><div className="map-page-header"><h2>{isSupervisor ? 'Localisation des stages' : 'Carte des stages'}</h2><p className="text-muted">{isSupervisor ? `${filteredMarkers.length} lieu(x) de stage pour les étudiants que vous suivez` : `${filteredMarkers.length} stage(s) localisé(s)`}</p></div>{error && <div className="alert alert-danger">{error}</div>}<div className="map-layout"><aside className="map-sidebar"><div className="card-emit"><h4 className="filter-title">Filtres</h4>{isSupervisor && <div className="map-search-group"><FaSearch className="map-search-icon" /><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Rechercher un stage..." aria-label="Rechercher un stage" /></div>}{select('map-city', 'Ville', 'ville', options.villes)}{isSupervisor && <>{select('map-formation', 'Formation', 'formation', options.formations)}{select('map-promotion', 'Promotion', 'promotion', options.promotions)}{select('map-domain', 'Domaine', 'domaine', options.domaines)}</>}<div className="filter-group"><label className="filter-label" htmlFor="map-status">Statut</label><select id="map-status" value={filters.statut} onChange={updateFilter('statut')} className="filter-select"><option value="">Tous les statuts</option>{Object.entries(stageStatuses).map(([value, status]) => <option key={value} value={value}>{status.label}</option>)}</select></div></div><div className="card-emit"><h4 className="filter-title">Légende</h4>{Object.values(stageStatuses).map((status) => <div key={status.label} className="legend-item"><span className="legend-dot" style={{ backgroundColor: status.color }} /><span className="legend-label">{status.label}</span></div>)}</div></aside><div className="map-container"><MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%', borderRadius: '12px' }}><ChangeView center={center} zoom={7} /><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />{!isLoading && filteredMarkers.map((marker) => { const status = stageStatuses[marker.statut] || stageStatuses.A_VENIR; return <Marker key={marker.id} position={[marker.latitude, marker.longitude]} icon={L.divIcon({ className: 'stage-marker-icon', html: `<span style="background:${status.color}"></span>`, iconSize: [22, 22], iconAnchor: [11, 11] })}><Popup><div className="popup-content"><h4>{marker.nomEntreprise || 'Entreprise'}</h4>{isSupervisor && <p><strong>Étudiant :</strong> {[marker.prenomEtudiant, marker.nomEtudiant].filter(Boolean).join(' ') || 'Non renseigné'}</p>}<p><strong>Ville :</strong> {marker.ville || 'Non renseignée'}</p><p><strong>Domaine :</strong> {marker.domaine || 'Non renseigné'}</p>{isSupervisor && <><p><strong>Date de début :</strong> {formatDate(marker.dateDebut)}</p><p><strong>Date de fin :</strong> {formatDate(marker.dateFin)}</p></>}<span className={status.badge}>{status.label}</span></div></Popup></Marker>; })}</MapContainer>{isLoading && <div className="map-loading">Chargement des emplacements...</div>}{!isLoading && filteredMarkers.length === 0 && <div className="map-empty">Aucun lieu ne correspond à ces filtres.</div>}</div></div></div>;
}

export default CarteStages;
