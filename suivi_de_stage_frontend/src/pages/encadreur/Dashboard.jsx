import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { 
  FaUsers, FaClipboardList, FaStar, FaFileAlt, 
  FaArrowRight, FaBell, FaComment, FaBuilding,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe
} from 'react-icons/fa';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { internshipsApi, evaluationsApi } from '../../api';

// ============================================================
// CUSTOM TOOLTIP
// ============================================================
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="encadreur-tooltip">
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
  const color = payload?.color || '#162449';

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
      style={{ fontSize: '14px', fontWeight: '700', fill: '#162449' }}
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
function EncadreurDashboard() {
  const { user } = useAuth();
  const [encadreurStages, setEncadreurStages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await internshipsApi.getAll();
        const list = Array.isArray(res) ? res : res?.items || [];
        setEncadreurStages(list.map(s => ({
          id: s.id,
          etudiant: s.etudiant ? `${s.etudiant.prenom || ''} ${s.etudiant.nom || ''}`.trim() : (s.studentName || 'Étudiant'),
          entreprise: s.entreprise?.nom || s.companyName || 'Entreprise',
          ville: s.entreprise?.ville || s.city || 'Non renseignée',
          statut: s.statut || s.status || 'En cours',
          progression: s.progression || 50,
          filiere: s.etudiant?.filiere || s.filiere || 'Informatique'
        })));
      } catch (err) {
        console.error('Erreur chargement dashboard encadreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ===== STATISTIQUES =====
  const stats = {
    etudiants: encadreurStages.length,
    etudiantsChange: '+2 ce mois',
    stagesEnCours: encadreurStages.filter(s => s.statut === 'En cours').length,
    stagesActifs: `${Math.round((encadreurStages.filter(s => s.statut === 'En cours').length / encadreurStages.length) * 100)}%`,
    evaluationsEnAttente: 3,
    rapportsRecus: 4,
    rapportsTotal: encadreurStages.length,
    observations: 5
  };

  // ===== DONNÉES CAMEMBERT =====
  const stageStatusData = [
    { name: 'En cours', value: encadreurStages.filter(s => s.statut === 'En cours').length, color: '#6BA9E6' },
    { name: 'En attente', value: encadreurStages.filter(s => s.statut === 'En attente').length, color: '#F39C12' },
    { name: 'Terminés', value: encadreurStages.filter(s => s.statut === 'Terminé' || s.statut === 'Validé').length, color: '#27AE60' },
    { name: 'Refusés', value: encadreurStages.filter(s => s.statut === 'Refusé').length, color: '#E74C3C' },
  ].filter(item => item.value > 0);

  // ===== DONNÉES HISTOGRAMME =====
  const filiereMap = {};
  encadreurStages.forEach(s => {
    filiereMap[s.filiere] = (filiereMap[s.filiere] || 0) + 1;
  });
  const filiereData = Object.keys(filiereMap).map((key, index) => ({
    name: key,
    value: filiereMap[key],
    color: ['#6BA9E6', '#5BA3E6', '#7CB8F0', '#A0C8F5'][index % 4]
  }));

  // ===== INFORMATIONS DE L'ENTREPRISE =====
  const entrepriseInfo = {
    nom: 'TechMada SARL',
    adresse: 'Lot II M 77, Antananarivo',
    ville: 'Antananarivo',
    telephone: '+261 34 12 345 67',
    email: 'contact@techmada.mg',
    site: 'www.techmada.mg',
    description: 'Entreprise spécialisée dans le développement de solutions logicielles.'
  };

  // ===== ACTIVITÉS RÉCENTES =====
  const recentActivities = [
    { 
      id: 1, 
      icon: <FaFileAlt />, 
      text: 'Rapport de Miora Rakoto déposé', 
      detail: 'Rapport intermédiaire à commenter',
      time: 'Il y a 2h',
      color: '#6BA9E6',
      bg: '#E1ECFE'
    },
    { 
      id: 2, 
      icon: <FaUsers />, 
      text: 'Nouvel étudiant assigné', 
      detail: 'Razafindramary Fy vous a été assigné',
      time: 'Il y a 5h',
      color: '#27AE60',
      bg: '#D1FAE5'
    },
    { 
      id: 3, 
      icon: <FaStar />, 
      text: 'Évaluation à réaliser', 
      detail: 'Pour Ramanantsoa Tojo',
      time: 'Il y a 1h',
      color: '#F39C12',
      bg: '#FEF3C7'
    },
    { 
      id: 4, 
      icon: <FaComment />, 
      text: 'Observation ajoutée', 
      detail: 'Vous avez ajouté une observation sur Miora Rakoto',
      time: 'Il y a 3h',
      color: '#7C3AED',
      bg: '#EDE9FE'
    },
  ];

  const totalStages = stageStatusData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="encadreur-dashboard">
      {/* ===== HEADER ===== */}
      <div className="encadreur-header">
        <div>
          <h1>Bonjour, {user?.prenom} {user?.nom}</h1>
          <p className="text-muted">Voici un aperçu du suivi des stages que vous encadrez.</p>
        </div>
      </div>

      {/* ===== 4 KPI CARDS ===== */}
      <div className="encadreur-kpi">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#E1ECFE', color: '#6BA9E6' }}>
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

      {/* ===== LIGNE 2 : CAMEMBERT + HISTOGRAMME ===== */}
      <div className="encadreur-charts">
        {/* ===== CAMEMBERT AVEC LÉGENDE À DROITE ===== */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Avancement des stages</h3>
          </div>
          <div className="chart-body pie-chart">
            <div className="pie-chart-wrapper">
              {/* ===== CAMEMBERT À GAUCHE ===== */}
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

              {/* ===== LÉGENDE À DROITE ===== */}
              <div className="pie-legend-right">
                {stageStatusData.map((item, index) => (
                  <div key={index} className="legend-item-right">
                    <span className="legend-dot-right" style={{ backgroundColor: item.color }} />
                    <span className="legend-label-right">{item.name}</span>
                    <span className="legend-value-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== HISTOGRAMME ===== */}
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
                  domain={[0, Math.max(...filiereData.map(d => d.value)) + 1]}
                />
                <Tooltip 
                  contentStyle={{ 
                    fontSize: 12, 
                    borderRadius: 8, 
                    border: '1px solid #E1ECFE',
                    padding: '8px 12px'
                  }}
                  formatter={(value) => [`${value} étudiants`, '']}
                  cursor={{ fill: '#FAFBFF' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  barSize={36}
                  label={{ position: 'top', fontSize: 11, fontWeight: 600, fill: '#162449' }}
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

      {/* ===== LIGNE 3 : ACTIVITÉS + ENTREPRISE ===== */}
      <div className="encadreur-bottom">
        <div className="encadreur-activities">
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

        {/* ===== INFORMATIONS ENTREPRISE ===== */}
        <div className="entreprise-info-card">
          <div className="entreprise-info-header">
            <h3><FaBuilding /> Mon entreprise</h3>
          </div>
          <div className="entreprise-info-body">
            <div className="entreprise-name">
              <FaBuilding className="entreprise-icon" />
              <span className="name">{entrepriseInfo.nom}</span>
            </div>
            <div className="entreprise-detail">
              <FaMapMarkerAlt className="detail-icon" />
              <span>{entrepriseInfo.adresse}</span>
            </div>
            <div className="entreprise-detail">
              <FaPhone className="detail-icon" />
              <span>{entrepriseInfo.telephone}</span>
            </div>
            <div className="entreprise-detail">
              <FaEnvelope className="detail-icon" />
              <span>{entrepriseInfo.email}</span>
            </div>
            <div className="entreprise-detail">
              <FaGlobe className="detail-icon" />
              <span>{entrepriseInfo.site}</span>
            </div>
            <div className="entreprise-description">
              <p>{entrepriseInfo.description}</p>
            </div>
            <div className="entreprise-stats">
              <div className="stat-item">
                <span className="stat-number">{encadreurStages.length}</span>
                <span className="stat-label">Étudiants encadrés</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.stagesEnCours}</span>
                <span className="stat-label">Stages en cours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EncadreurDashboard;