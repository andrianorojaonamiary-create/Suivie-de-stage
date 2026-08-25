
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
    { label: 'Étudiants total', value: 312, change: '+18 cette année', up: true, icon: <FaUsers />, color: '#4A90D9', bg: '#DBEBF9' },
    { label: 'Stages en attente', value: 24, change: '+4 nouveaux', up: false, icon: <FaClock />, color: '#F39C12', bg: '#FEF3C7' },
    { label: 'Stages en cours', value: 187, change: '+12 ce mois', up: true, icon: <FaPlayCircle />, color: '#27AE60', bg: '#D1FAE5' },
    { label: 'Stages terminés', value: 89, change: '+23 ce trimestre', up: true, icon: <FaCheckCircle />, color: '#1A3A6B', bg: '#DBEBF9' },
    { label: 'Entreprises', value: 63, change: '+5 nouvelles', up: true, icon: <FaBuilding />, color: '#5BA3E6', bg: '#EEF5FC' },
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
    { name: 'En cours', value: 187, color: '#4A90D9' },
    { name: 'En attente', value: 24, color: '#F39C12' },
    { name: 'Terminés', value: 89, color: '#1A3A6B' },
    { name: 'Annulés', value: 12, color: '#E74C3C' },
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
    { text: 'Miora Rakoto a déposé son rapport intermédiaire', time: 'Il y a 12 min', icon: <FaFileAlt />, color: '#4A90D9', bg: '#DBEBF9' },
    { text: 'Nouveau stage validé — TechMada SARL', time: 'Il y a 45 min', icon: <FaCheckCircle />, color: '#27AE60', bg: '#D1FAE5' },
    { text: 'Hery Rakotondrabe a rejoint la plateforme', time: 'Il y a 2 h', icon: <FaUserPlus />, color: '#7C3AED', bg: '#EDE9FE' },
    { text: 'Rapport de Fanja en révision', time: 'Il y a 3 h', icon: <FaClock />, color: '#F39C12', bg: '#FEF3C7' },
    { text: 'Nouvelle entreprise ajoutée — JIRAMA', time: 'Hier à 14:30', icon: <FaBuilding />, color: '#4A6285', bg: '#EEF5FC' },
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

  const totalStatus = statusData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="admin-dashboard-container">
      {/* ===== HEADER ===== */}
      <div className="dashboard-header">
        <h2>Tableau de bord</h2>
        <p className="text-muted">Vue générale du suivi des stages — Année universitaire 2023–2024</p>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="kpi-grid">
        {kpis.map((kpi, index) => (
          <div key={index} className="kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
              {kpi.icon}
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{kpi.value}</div>
              <div className="kpi-label">{kpi.label}</div>
              <div className="kpi-change" style={{ color: kpi.color }}>
                {kpi.up ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
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
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF5FC" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7A9BBE' }} />
              <YAxis tick={{ fontSize: 11, fill: '#7A9BBE' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #C8DCF0' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="stages" stroke="#4A90D9" strokeWidth={2} dot={{ r: 3 }} name="Déclarés" />
              <Line type="monotone" dataKey="valides" stroke="#27AE60" strokeWidth={2} dot={{ r: 3 }} name="Validés" />
              <Line type="monotone" dataKey="termines" stroke="#1A3A6B" strokeWidth={2} dot={{ r: 3 }} name="Terminés" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card-emit chart-card">
          <h3 className="card-title">Répartition par statut</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="48%"
                innerRadius={45}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name} ${Math.round((value / totalStatus) * 100)}%`}
                labelLine={false}
                fontSize={10}
                fontWeight={500}
              >
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="white" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
                formatter={(value, name) => [`${value} stages`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="status-list-horizontal">
            {statusData.map((item, index) => (
              <div key={index} className="status-item-small">
                <span className="status-dot-small" style={{ backgroundColor: item.color }} />
                <span className="status-name-small">{item.name}</span>
                <span className="status-value-small">{item.value}</span>
                <span className="status-percent-small">
                  ({Math.round((item.value / totalStatus) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== STAGES PAR VILLE ===== */}
      <div className="card-emit chart-card">
        <h3 className="card-title">Stages par ville</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={cityData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF5FC" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#7A9BBE' }} />
            <YAxis type="category" dataKey="city" tick={{ fontSize: 11, fill: '#4A6285' }} width={90} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #C8DCF0' }} />
            <Bar dataKey="count" fill="#4A90D9" radius={[0, 4, 4, 0]} name="Stages" />
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