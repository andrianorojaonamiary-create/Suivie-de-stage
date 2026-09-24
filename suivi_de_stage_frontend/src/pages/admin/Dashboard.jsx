import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  FaUsers, FaClock, FaPlayCircle, FaCheckCircle,
  FaBuilding, FaUserTie, FaBell, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { useState, useEffect } from 'react';
import statisticsApi from '../../api/statisticsApi';
import { notificationsApi, internshipsApi, reportsApi } from '../../api';

const getAnneeScolaire = () => {
  const year = new Date().getFullYear();
  return `${year - 1}-${year}`;
};

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [attentionStages, setAttentionStages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [statsRes, notifsRes, stagesRes, reportsRes] = await Promise.allSettled([
        statisticsApi.getDashboard(),
        notificationsApi.getAll(),
        internshipsApi.getAll({ limit: 100 }),
        reportsApi.getAll({ limit: 100 }),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setDashboardData(statsRes.value);
      }

      const notifsValue = notifsRes.status === 'fulfilled' ? notifsRes.value : null;
      const notifs = Array.isArray(notifsValue)
        ? notifsValue
        : notifsValue?.data || notifsValue?.items || [];
      if (notifs.length > 0) {
        setRecentActivities(
          notifs.slice(0, 5).map((n, idx) => {
            const date = n.date_creation ?? n.dateCreation ?? n.createdAt;
            return {
              id: n.id || idx,
              icon: <FaBell />,
              text: n.titre || n.title || 'Notification',
              detail: n.message || n.content || '',
              time: date ? new Date(date).toLocaleDateString('fr-FR') : '',
              bg: '#E1ECFE',
              color: '#6BA9E6',
            };
          }),
        );
      }

      const stages = stagesRes.status === 'fulfilled'
        ? (stagesRes.value?.data || (Array.isArray(stagesRes.value) ? stagesRes.value : []))
        : [];
      const reports = reportsRes.status === 'fulfilled'
        ? (reportsRes.value?.items || reportsRes.value?.data || (Array.isArray(reportsRes.value) ? reportsRes.value : []))
        : [];

      const typesParStage = new Map();
      reports.forEach((r) => {
        const sid = r.stage?.id;
        if (!sid || !r.type) return;
        if (!typesParStage.has(sid)) typesParStage.set(sid, new Set());
        typesParStage.get(sid).add(r.type);
      });

      const attention = stages
        .filter((s) => s.statut === 'EN_COURS' || s.statut === 'TERMINE')
        .map((s) => ({
          stage: s,
          manquants: Math.max(0, 3 - (typesParStage.get(s.id)?.size || 0)),
        }))
        .filter((x) => x.manquants > 0)
        .sort((a, b) => b.manquants - a.manquants)
        .slice(0, 5)
        .map((x) => ({
          id: x.stage.id,
          student: `${x.stage.student?.prenom ?? ''} ${x.stage.student?.nom ?? ''}`.trim() || 'Étudiant',
          company: x.stage.company?.nom || 'Entreprise',
          status: x.stage.statut === 'EN_COURS' ? 'En cours' : 'Terminé',
          issue: `${x.manquants} rapport(s) manquant(s)`,
        }));
      setAttentionStages(attention);
    };
    fetchData();
  }, []);

  const totalEtudiants = dashboardData?.counts?.students ?? 0;
  const totalEnAttente = dashboardData?.internships?.upcoming ?? 0;
  const totalEnCours = dashboardData?.internships?.ongoing ?? 0;
  const totalTermines = dashboardData?.internships?.completed ?? 0;
  const totalEntreprises = dashboardData?.counts?.companies ?? 0;
  const totalEncadreurs = dashboardData?.counts?.supervisors ?? 0;

  const kpis = [
    { label: 'Étudiants total', value: totalEtudiants, up: true, icon: <FaUsers />, color: '#6BA9E6', bg: '#E1ECFE', trendColor: '#6BA9E6' },
    { label: 'Stages en attente', value: totalEnAttente, up: false, icon: <FaClock />, color: '#F59E0B', bg: '#FAF1C6', trendColor: '#F59E0B' },
    { label: 'Stages en cours', value: totalEnCours, up: true, icon: <FaPlayCircle />, color: '#2AA253', bg: '#E0F7E9', trendColor: '#2AA253', featured: true },
    { label: 'Stages terminés', value: totalTermines, up: true, icon: <FaCheckCircle />, color: '#1F2937', bg: '#E1ECFE', trendColor: '#1F2937' },
    { label: 'Entreprises', value: totalEntreprises, up: true, icon: <FaBuilding />, color: '#192543', bg: '#E1E7FE', trendColor: '#192543' },
    { label: 'Encadreurs', value: totalEncadreurs, up: true, icon: <FaUserTie />, color: '#7C3AED', bg: '#EFE7FD', trendColor: '#7C3AED' },
  ];

  const byYear = (dashboardData?.byYear || [])
    .map((row) => ({ year: Number(row.year), count: Number(row.count) }))
    .sort((a, b) => a.year - b.year);

  const statusColors = {
    'En attente': '#F59E0B',
    'En cours': '#162449',
    'Terminé': '#27AE60',
  };
  const statusData = (dashboardData?.statusData || []).map((s) => ({
    name: s.name,
    value: s.value,
    color: statusColors[s.name] || '#6c7a8a',
  }));

  const cityData = (dashboardData?.byCity || []).map((row) => ({
    city: row.city,
    count: Number(row.count),
  }));

  const getStatusBadge = (status) => {
    const classes = {
      'En cours': 'badge-en-cours',
      'Terminé': 'badge-termine',
    };
    return classes[status] || 'badge-en-attente';
  };

  return (
    <div className="admin-dashboard-container">
      {/* ===== HEADER ===== */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h2>Tableau de bord</h2>
          <p className="dashboard-subtitle">Vue générale du suivi des stages — Année universitaire {getAnneeScolaire()}</p>
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
            </div>
          </div>
        ))}
      </div>

      {/* ===== GRILLE 2/3 + 1/3 ===== */}
      <div className="dashboard-grid-2-3">
        {/* Line Chart */}
        <div className="card-emit chart-card chart-line">
          <h3 className="card-title">Nombre de stages par année</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={byYear} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1ECFE" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#192543' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#192543' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E1ECFE', boxShadow: '0 4px 12px rgba(22, 36, 73, 0.08)' }} />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#ffffff' }} name="Stages" />
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
            {recentActivities.length > 0 ? (
              recentActivities.map((act) => (
                <div key={act.id} className="activity-item">
                  <div className="activity-icon" style={{ backgroundColor: act.bg, color: act.color }}>
                    {act.icon}
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">{act.text}</p>
                    <span className="activity-detail">{act.detail}</span>
                    <span className="activity-time">{act.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="detail-empty">Aucune activité récente pour le moment.</p>
            )}
          </div>
        </div>

        <div className="card-emit">
          <h3 className="card-title">
            Stages nécessitant une attention
            <span className="attention-badge">{attentionStages.length} à traiter</span>
          </h3>
          <div className="attention-list">
            {attentionStages.length > 0 ? (
              attentionStages.map((stage, index) => (
                <div key={stage.id || index} className="attention-item">
                  <div className="attention-info">
                    <div className="attention-student">{stage.student}</div>
                    <div className="attention-company">{stage.company}</div>
                  </div>
                  <div className="attention-status">
                    <span className={getStatusBadge(stage.status)}>{stage.status}</span>
                    <span className="attention-issue">{stage.issue}</span>
                  </div>
                  <Link to="/admin/stages" className="attention-action">
                    Voir →
                  </Link>
                </div>
              ))
            ) : (
              <p className="detail-empty">Aucun stage ne nécessite d'attention.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;