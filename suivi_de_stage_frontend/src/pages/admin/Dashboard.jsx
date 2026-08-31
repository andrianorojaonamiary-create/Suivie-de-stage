
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  FaUsers, FaClock, FaPlayCircle, FaCheckCircle,
  FaBuilding, FaArrowUp, FaArrowDown,
  FaFileAlt, FaUserPlus
} from 'react-icons/fa';

function AdminDashboard() {
  // ===== DONNÉES =====

  const kpis = [
    { label: 'Étudiants total', value: 312, change: '+18 cette année', up: true, icon: <FaUsers />, color: '#6BA9E6', bg: '#E1ECFE', trendColor: '#6BA9E6' },
    { label: 'Stages en attente', value: 24, change: '+4 nouveaux', up: false, icon: <FaClock />, color: '#F59E0B', bg: '#FAF1C6', trendColor: '#F59E0B' },
    { label: 'Stages en cours', value: 187, change: '+12 ce mois', up: true, icon: <FaPlayCircle />, color: '#2AA253', bg: '#E0F7E9', trendColor: '#2AA253', featured: true },
    { label: 'Stages terminés', value: 89, change: '+23 ce trimestre', up: true, icon: <FaCheckCircle />, color: '#1F2937', bg: '#E1ECFE', trendColor: '#1F2937' },
    { label: 'Entreprises', value: 63, change: '+5 nouvelles', up: true, icon: <FaBuilding />, color: '#192543', bg: '#E1E7FE', trendColor: '#192543' },
  ];

  const monthlyData = [
    { month: 'Jan', stages: 28, valides: 20, termines: 8 },
    { month: 'Fév', stages: 35, valides: 28, termines: 12 },
    { month: 'Mar', stages: 42, valides: 35, termines: 18 },
    { month: 'Avr', stages: 38, valides: 30, termines: 22 },
    { month: 'Mai', stages: 55, valides: 45, termines: 28 },
    { month: 'Juin', stages: 62, valides: 54, termines: 35 },
    { month: 'Juil', stages: 48, valides: 40, termines: 42 },
    { month: 'Août', stages: 31, valides: 25, termines: 38 },
  ];

  const statusData = [
    { name: 'En cours', value: 187, color: '#3B82F6' },
    { name: 'En attente', value: 24, color: '#F59E0B' },
    { name: 'Terminés', value: 89, color: '#1F2937' },
    { name: 'Annulés', value: 12, color: '#EF4444' },
  ];

  const cityData = [
    { city: 'Fianarantsoa', count: 87 },
    { city: 'Antananarivo', count: 64 },
    { city: 'Toamasina', count: 42 },
    { city: 'Antsirabe', count: 31 },
    { city: 'Mahajanga', count: 28 },
    { city: 'Toliara', count: 19 },
  ];

  const attentionStages = [
    { student: 'Miora Rakoto', company: 'TechMada SARL', tutor: 'Prof. Andrianivo', start: '15 Mar 2024', end: '15 Sep 2024', status: 'En cours', issue: 'Rapport en retard' },
    { student: 'Hery Rakotondrabe', company: 'Airtel Madagascar', tutor: 'Dr. Ranaivo', start: '01 Avr 2024', end: '01 Oct 2024', status: 'En attente', issue: 'Validation manquante' },
    { student: 'Fanja Andriantsoa', company: 'BNI Madagascar', tutor: 'Prof. Razafindrakoto', start: '01 Mai 2024', end: '31 Aoû 2024', status: 'En cours', issue: 'Évaluation à planifier' },
    { student: 'Tojo Ramanantsoa', company: 'JIRAMA', tutor: 'Dr. Rasoa', start: '15 Fév 2024', end: '15 Aoû 2024', status: 'En cours', issue: 'Fin de stage proche' },
  ];

  const recentActivities = [
    { text: 'Miora Rakoto a déposé son rapport intermédiaire', time: 'Il y a 12 min', icon: <FaFileAlt />, color: '#162449', bg: '#E1ECFE' },
    { text: 'Nouveau stage validé — TechMada SARL', time: 'Il y a 45 min', icon: <FaCheckCircle />, color: '#6BA9E6', bg: '#E1ECFE' },
    { text: 'Hery Rakotondrabe a rejoint la plateforme', time: 'Il y a 2 h', icon: <FaUserPlus />, color: '#192543', bg: '#E1ECFE' },
    { text: 'Rapport de Fanja en révision', time: 'Il y a 3 h', icon: <FaClock />, color: '#162449', bg: '#E1ECFE' },
    { text: 'Nouvelle entreprise ajoutée — JIRAMA', time: 'Hier à 14:30', icon: <FaBuilding />, color: '#192543', bg: '#E1ECFE' },
  ];

  const getStatusBadge = (status) => {
    const classes = {
      'En cours': 'badge-en-cours',
      'En attente': 'badge-en-attente',
      'Terminé': 'badge-termine',
      'Validé': 'badge-valide',
    };
    return classes[status] || 'badge-en-attente';
  };

  return (
    <div className="admin-dashboard-container">
      {/* ===== HEADER ===== */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h2>Tableau de bord</h2>
          <p className="dashboard-subtitle">Vue générale du suivi des stages — Année universitaire 2023–2024</p>
        </div>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="kpi-grid">
        {kpis.map((kpi, index) => (
          <div key={index} className={`kpi-card${kpi.featured ? ' kpi-card--featured' : ''}`}>
            <div className="kpi-card-top">
              <div className="kpi-icon" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                {kpi.icon}
              </div>
              <div className="kpi-trend-badge" style={{ color: kpi.trendColor || kpi.color, backgroundColor: `${kpi.trendColor || kpi.color}15` }}>
                {kpi.up ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
              </div>
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{kpi.value}</div>
              <div className="kpi-label">{kpi.label}</div>
              <div className="kpi-change" style={{ color: kpi.trendColor || kpi.color }}>
                {kpi.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== GRILLE 2/3 + 1/3 ===== */}
      <div className="dashboard-grid-2-3">
        {/* Line Chart */}
        <div className="card-emit chart-card chart-line">
          <h3 className="card-title">Évolution des stages</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1ECFE" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#192543' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#192543' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E1ECFE', boxShadow: '0 4px 12px rgba(22, 36, 73, 0.08)' }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 15 }} />
              <Line type="monotone" dataKey="stages" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#ffffff' }} name="Déclarés" />
              <Line type="monotone" dataKey="termines" stroke="#6B7280" strokeWidth={3} dot={{ r: 4, fill: '#6B7280', strokeWidth: 2, stroke: '#ffffff' }} name="Terminés" />
              <Line type="monotone" dataKey="valides" stroke="#22C55E" strokeWidth={3} dot={{ r: 4, fill: '#22C55E', strokeWidth: 2, stroke: '#ffffff' }} name="Validés" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card-emit chart-card">
          <h3 className="card-title">Répartition par statut</h3>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={76}
                paddingAngle={4}
                dataKey="value"
                label={false}
              >
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="#ffffff" strokeWidth={3} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E1ECFE', boxShadow: '0 4px 12px rgba(22, 36, 73, 0.08)' }}
                formatter={(value, name) => [`${value} stages`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="status-grid-legend">
            {statusData.map((item, index) => (
              <div key={index} className="status-legend-item">
                <span className="status-dot-bullet" style={{ backgroundColor: item.color }} />
                <span className="status-legend-label">{item.name}</span>
                <span className="status-legend-count">({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== STAGES PAR VILLE ===== */}
      <div className="card-emit chart-card">
        <h3 className="card-title">Stages par ville</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={cityData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E1ECFE" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#192543' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="city" tick={{ fontSize: 12, fill: '#162449', fontWeight: 600 }} width={100} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E1ECFE' }} />
            <Bar dataKey="count" fill="#6BA9E6" radius={[0, 6, 6, 0]} name="Stages" barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ===== ACTIVITÉS RÉCENTES & ATTENTION ===== */}
      <div className="dashboard-grid-2">
        <div className="card-emit">
          <h3 className="card-title">Activités récentes</h3>
          <div className="activity-list">
            {recentActivities.map((act, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon" style={{ backgroundColor: act.bg, color: act.color }}>
                  {act.icon}
                </div>
                <div className="activity-content">
                  <p className="activity-text">{act.text}</p>
                  <span className="activity-time">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-emit">
          <h3 className="card-title">
            Stages nécessitant une attention
            <span className="attention-badge">{attentionStages.length} à traiter</span>
          </h3>
          <div className="attention-list">
            {attentionStages.map((stage, index) => (
              <div key={index} className="attention-item">
                <div className="attention-info">
                  <div className="attention-student">{stage.student}</div>
                  <div className="attention-company">{stage.company}</div>
                </div>
                <div className="attention-status">
                  <span className={getStatusBadge(stage.status)}>{stage.status}</span>
                  <span className="attention-issue">{stage.issue}</span>
                </div>
                <button className="attention-action">Voir →</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;