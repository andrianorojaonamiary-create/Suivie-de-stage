import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { 
  FaUsers, FaClipboardList, FaStar, FaFileAlt, 
  FaArrowRight, FaMapMarkerAlt, FaBell
} from 'react-icons/fa';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ============================================================
// CUSTOM TOOLTIP
// ============================================================
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="enseignant-tooltip">
        <p className="tooltip-label">{payload[0].name}</p>
        <p className="tooltip-value">{payload[0].value} stages</p>
      </div>
    );
  }
  return null;
};

// ============================================================
// RENDER LABEL POUR CAMEMBERT
// ============================================================
const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, percent, payload }) => {
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  const color = payload?.color || '#1A3A6B';

  return (
    <text 
      x={x} 
      y={y} 
      fill={color}
      textAnchor="middle" 
      dominantBaseline="central"
      style={{ fontSize: '11px', fontWeight: '600' }}
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

// ============================================================
// LABEL CENTRAL POUR LE CAMEMBERT
// ============================================================
const renderCenterLabel = (totalStages) => {
  return (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: '14px', fontWeight: '700', fill: '#1A3A6B' }}
    >
      {totalStages}
      <tspan x="50%" dy="18" style={{ fontSize: '10px', fontWeight: '400', fill: '#6c7a8a' }}>
        stages
      </tspan>
    </text>
  );
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
function EnseignantDashboard() {
  const { user } = useAuth();

  const stats = {
    etudiants: 18,
    etudiantsChange: '+2 ce mois',
    stagesEnCours: 18,
    stagesActifs: '100%',
    evaluationsEnAttente: 7,
    rapportsRecus: 11,
    rapportsTotal: 18
  };

  const stageStatusData = [
    { name: 'En cours', value: 14, color: '#4A90D9' },
    { name: 'Visite à venir', value: 2, color: '#F39C12' },
    { name: 'Rapport en attente', value: 1, color: '#E74C3C' },
    { name: 'Terminés', value: 1, color: '#27AE60' },
  ];

  const filiereData = [
    { name: 'Informatique', value: 12, color: '#4A90D9' },
    { name: 'Réseaux', value: 9, color: '#5BA3E6' },
    { name: 'Multimédia', value: 6, color: '#7CB8F0' },
    { name: 'Électronique', value: 3, color: '#A0C8F5' },
  ];

  const recentActivities = [
    { 
      id: 1, 
      icon: <FaFileAlt />, 
      text: 'Rapport de Jean R. validé', 
      detail: 'Développement d\'une application web',
      time: 'Il y a 2h',
      color: '#4A90D9',
      bg: '#DBEBF9'
    },
    { 
      id: 2, 
      icon: <FaUsers />, 
      text: 'Nouvel étudiant assigné', 
      detail: 'Andrianirina T. vous a été assigné',
      time: 'Il y a 5h',
      color: '#27AE60',
      bg: '#D1FAE5'
    },
    { 
      id: 3, 
      icon: <FaStar />, 
      text: 'Évaluation soumise', 
      detail: 'Par l\'entreprise ABC Informatique',
      time: 'Il y a 1h',
      color: '#F39C12',
      bg: '#FEF3C7'
    },
    { 
      id: 4, 
      icon: <FaFileAlt />, 
      text: 'Rapport reçu', 
      detail: '11 nouveaux rapports déposés',
      time: 'Il y a 2h',
      color: '#E74C3C',
      bg: '#FEE2E2'
    },
  ];

  const localisation = {
    localises: 12,
    total: 18,
    lieux: 8
  };

  const totalStages = stageStatusData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="enseignant-dashboard">
      {/* HEADER */}
      <div className="enseignant-header">
        <div>
          <h1>Bonjour, {user?.prenom} {user?.nom}</h1>
          <p className="text-muted">Voici un aperçu du suivi des stages.</p>
        </div>
      </div>

      {/* 4 KPI CARDS */}
      <div className="enseignant-kpi">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#DBEBF9', color: '#4A90D9' }}>
            <FaUsers />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.etudiants}</span>
            <span className="kpi-label">Étudiants encadrés</span>
            <span className="kpi-change">{stats.etudiantsChange}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#D1FAE5', color: '#27AE60' }}>
            <FaClipboardList />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.stagesEnCours}</span>
            <span className="kpi-label">Stages en cours</span>
            <span className="kpi-change">{stats.stagesActifs} actifs</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#FEF3C7', color: '#F39C12' }}>
            <FaStar />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.evaluationsEnAttente}</span>
            <span className="kpi-label">Évaluations en attente</span>
            <span className="kpi-change">À évaluer</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#EDE9FE', color: '#7C3AED' }}>
            <FaFileAlt />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.rapportsRecus}</span>
            <span className="kpi-label">Rapports reçus</span>
            <span className="kpi-change">Sur {stats.rapportsTotal} étudiants</span>
          </div>
        </div>
      </div>

      {/* LIGNE 2 */}
      <div className="enseignant-charts">
        {/* Camembert */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Avancement global des stages</h3>
          </div>
          <div className="chart-body pie-chart">
            <div className="pie-container">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={stageStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={renderCustomLabel}
                    labelLine={false}
                  >
                    {stageStatusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  {renderCenterLabel(totalStages)}
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="pie-legend">
              {stageStatusData.map((item, index) => (
                <div key={index} className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: item.color }} />
                  <span className="legend-label">{item.name}</span>
                  <span className="legend-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Histogramme + Nombre d'étudiants */}
        <div className="chart-card bar-chart-card">
          <div className="chart-header">
            <h3>Répartition par filière</h3>
          </div>
          <div className="chart-body bar-chart">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={filiereData}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#6c7a8a' }}
                  axisLine={{ stroke: '#E8EEF4' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#6c7a8a' }}
                  axisLine={{ stroke: '#E8EEF4' }}
                  tickLine={false}
                  domain={[0, 16]}
                />
                <Tooltip 
                  contentStyle={{ 
                    fontSize: 12, 
                    borderRadius: 8, 
                    border: '1px solid #D6E4F0',
                    padding: '8px 12px'
                  }}
                  formatter={(value) => [`${value} étudiants`, '']}
                  cursor={{ fill: '#F5F8FC' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  barSize={36}
                  label={{ position: 'top', fontSize: 11, fontWeight: 600, fill: '#1A3A6B' }}
                >
                  {filiereData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="bar-labels-bottom">
              <span className="bar-label-bottom">Nombre d'étudiants</span>
            </div>
          </div>
        </div>
      </div>

      {/* LIGNE 3 */}
      <div className="enseignant-bottom">
        {/* Activités récentes */}
        <div className="enseignant-activities">
          <div className="activities-header">
            <h3><FaBell /> Activités récentes</h3>
          </div>
          <div className="activities-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon" style={{ backgroundColor: activity.bg, color: activity.color }}>
                  {activity.icon}
                </div>
                <div className="activity-content">
                  <p className="activity-text">{activity.text}</p>
                  <span className="activity-detail">{activity.detail}</span>
                </div>
                <span className="activity-time">{activity.time}</span>
              </div>
            ))}
            <Link to="/notifications" className="activities-view-all">
              Voir toutes les activités <FaArrowRight />
            </Link>
          </div>
        </div>

        {/* Localisation */}
        <div className="localisation-card">
          <div className="localisation-header">
            <h3><FaMapMarkerAlt /> Localisation des stages</h3>
          </div>
          <div className="localisation-body">
            <div className="localisation-map-wrapper">
              <img 
                src="https://via.placeholder.com/400x200/4A90D9/FFFFFF?text=MAP" 
                alt="Carte des stages"
                className="map-image"
              />
              <div className="map-overlay">
                <div className="map-stats">
                  <span className="map-number">{localisation.localises}</span>
                  <span className="map-total">/ {localisation.total} stages localisés</span>
                </div>
                <div className="map-lieux">{localisation.lieux} lieux différents</div>
              </div>
            </div>
            {/* Bouton comme "Voir toutes les activités" avec séparateur */}
            <div className="btn-voir-carte-wrapper">
              <Link to="/enseignant/carte" className="activities-view-all">
                Voir la carte complète <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnseignantDashboard;