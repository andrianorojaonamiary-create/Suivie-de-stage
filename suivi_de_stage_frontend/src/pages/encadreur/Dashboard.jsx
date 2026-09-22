import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { 
  FaUsers, FaClipboardList, FaStar, FaFileAlt, 
  FaArrowRight, FaBell, FaBuilding,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe
} from 'react-icons/fa';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { internshipsApi, reportsApi, notificationsApi, companiesApi, evaluationsApi } from '../../api';
import mapInternship from '../../utils/internshipMapping';

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
  const [stats, setStats] = useState({
    etudiants: 0,
    stagesEnCours: 0,
    evaluationsEnAttente: 0,
    rapportsRecus: 0,
    rapportsAttendus: 0,
    totalStages: 0,
  });
  const [entrepriseInfo, setEntrepriseInfo] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [stagesRes, reportsRes, notifsRes, companyRes] = await Promise.allSettled([
          internshipsApi.getAll({ limit: 100 }),
          reportsApi.getAll({ limit: 100 }),
          notificationsApi.getAll(),
          companiesApi.getMe(),
        ]);

      // ===== STAGES (scopés à l'encadreur) =====
      const stages = stagesRes.status === 'fulfilled'
        ? (stagesRes.value?.data || (Array.isArray(stagesRes.value) ? stagesRes.value : []))
        : [];
      const rapports = reportsRes.status === 'fulfilled'
        ? (reportsRes.value?.items || reportsRes.value?.data || (Array.isArray(reportsRes.value) ? reportsRes.value : []))
        : [];

      const mappedStages = stages.map((s) => {
        const m = mapInternship(s);
        return {
          id: m.id,
          etudiantId: s.student?.id || null,
          etudiant: m.etudiant,
          entreprise: m.entreprise,
          ville: m.ville,
          statut: m.statut,
          statutApi: m.statutApi,
          progression: m.progression,
          filiere: s.student?.formation || 'Non renseigné',
        };
      });
      setEncadreurStages(mappedStages);

      const enCours = mappedStages.filter((s) => s.statutApi === 'EN_COURS').length;

      const evalByStageRes = await Promise.allSettled(
        mappedStages.map((s) => evaluationsApi.getByInternship(s.id)),
      );
      const evalByStage = new Map(
        mappedStages.map((s, i) => [
          s.id,
          evalByStageRes[i].status === 'fulfilled'
            ? (Array.isArray(evalByStageRes[i].value) ? evalByStageRes[i].value : evalByStageRes[i].value?.data) || []
            : [],
        ]),
      );
      const activeStages = mappedStages.filter(
        (s) => s.statutApi === 'EN_COURS' || s.statutApi === 'TERMINE',
      );
      const evaluationsEnAttente = activeStages.filter(
        (s) => !(evalByStage.get(s.id) || []).some((e) => e.validee),
      ).length;

      const rapportsByStage = new Map();
      rapports.forEach((r) => {
        const sid = r.stage?.id;
        if (!sid) return;
        if (!rapportsByStage.has(sid)) rapportsByStage.set(sid, new Set());
        if (r.type) rapportsByStage.get(sid).add(r.type);
      });
      const rapportsAttendus = activeStages.reduce(
        (acc, s) => acc + Math.max(0, 3 - (rapportsByStage.get(s.id)?.size || 0)),
        0,
      );

      setStats({
        etudiants: new Set(mappedStages.map((s) => s.etudiantId).filter(Boolean)).size,
        stagesEnCours: enCours,
        evaluationsEnAttente,
        rapportsRecus: rapports.length,
        rapportsAttendus,
        totalStages: mappedStages.length,
      });

      // ===== MON ENTREPRISE =====
      if (companyRes.status === 'fulfilled' && companyRes.value) {
        const c = companyRes.value;
        setEntrepriseInfo({
          nom: c.nom || '',
          adresse: [c.adresse, c.ville].filter(Boolean).join(', '),
          telephone: c.telephone || '',
          email: c.email || '',
          site: c.siteWeb || c.site_web || '',
          description: c.description || '',
        });
      }

      // ===== ACTIVITÉS RÉCENTES =====
      const notifsValue = notifsRes.status === 'fulfilled' ? notifsRes.value : null;
      const notifs = Array.isArray(notifsValue) ? notifsValue : notifsValue?.data || notifsValue?.items || [];
      if (notifs.length > 0) {
        setRecentActivities(
          notifs.slice(0, 4).map((n, idx) => {
            const date = n.date_creation ?? n.dateCreation ?? n.createdAt;
            return {
              id: n.id || idx,
              icon: <FaBell />,
              text: n.titre || n.title || 'Notification',
              detail: n.message || n.content || '',
              time: date ? new Date(date).toLocaleDateString('fr-FR') : '',
              color: '#6BA9E6',
              bg: '#E1ECFE',
            };
          }),
        );
      }
    };

    fetchData();
  }, []);

  // ===== STATISTIQUES =====
  // ===== DONNÉES CAMEMBERT =====
  const stageStatusData = [
    { name: 'En cours', value: encadreurStages.filter(s => s.statutApi === 'EN_COURS').length, color: '#162449' },
    { name: 'Terminés', value: encadreurStages.filter(s => s.statutApi === 'TERMINE').length, color: '#27AE60' },
    { name: 'À venir', value: encadreurStages.filter(s => s.statutApi === 'EN_ATTENTE' || s.statutApi === 'A_VENIR').length, color: '#F39C12' },
  ];

  // ===== DONNÉES HISTOGRAMME =====
  const filiereMap = {};
  encadreurStages.forEach(s => {
    filiereMap[s.filiere] = (filiereMap[s.filiere] || 0) + 1;
  });
  const colors = ['#162449', '#6BA9E6', '#27AE60', '#F39C12', '#E53E3E', '#7C3AED', '#6c7a8a'];
  const filiereData = Object.keys(filiereMap).map((key, index) => ({
    name: key,
    value: filiereMap[key],
    color: colors[index % colors.length],
  }));

  const totalStages = stageStatusData.reduce((acc, item) => acc + item.value, 0);

  const stagesActifsPct = stats.totalStages > 0
    ? Math.min(100, Math.round((stats.stagesEnCours / stats.totalStages) * 100)) : 0;
  const evaluationsPct = stats.totalStages > 0
    ? Math.min(100, Math.round((stats.evaluationsEnAttente / stats.totalStages) * 100)) : 0;
  const rapportsAttendus = stats.rapportsAttendus;
  const rapportsPct = rapportsAttendus > 0
    ? Math.min(100, Math.round((stats.rapportsRecus / rapportsAttendus) * 100)) : 0;

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
          <div className="kpi-card-top">
            <div className="kpi-icon" style={{ backgroundColor: '#E1ECFE', color: '#6BA9E6' }}>
              <FaUsers />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.etudiants}</span>
              <span className="kpi-label">Étudiants encadrés</span>
            </div>
          </div>
          <div className="kpi-change" style={{ color: '#6BA9E6' }}>
            Cette période
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <div className="kpi-icon" style={{ backgroundColor: '#D1FAE5', color: '#27AE60' }}>
              <FaClipboardList />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.stagesEnCours}</span>
              <span className="kpi-label">Stages en cours</span>
            </div>
          </div>
          <div className="kpi-change" style={{ color: '#27AE60' }}>
            {stagesActifsPct}% <span className="kpi-vs">des stages</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <div className="kpi-icon" style={{ backgroundColor: '#FEF3C7', color: '#F39C12' }}>
              <FaStar />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.evaluationsEnAttente}</span>
              <span className="kpi-label">Évaluations en attente</span>
            </div>
          </div>
          <div className="kpi-change" style={{ color: '#F39C12' }}>
            {evaluationsPct}% <span className="kpi-vs">des stages encadrés</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <div className="kpi-icon" style={{ backgroundColor: '#EDE9FE', color: '#7C3AED' }}>
              <FaFileAlt />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.rapportsRecus}</span>
              <span className="kpi-label">Rapports reçus</span>
            </div>
          </div>
          <div className="kpi-change" style={{ color: '#7C3AED' }}>
            {rapportsPct}% <span className="kpi-vs">des rapports attendus</span>
          </div>
        </div>
      </div>

      {/* ===== LIGNE 2 : CAMEMBERT + HISTOGRAMME ===== */}
      <div className="encadreur-charts">
        {/* ===== CAMEMBERT AVEC LÉGENDE À DROITE ===== */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Avancement global des stages</h3>
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
                  domain={[0, 'auto']}
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
            {entrepriseInfo ? (
              <>
                <div className="entreprise-name">
                  <span className="entreprise-icon-container">
                    <FaBuilding className="entreprise-icon" />
                  </span>
                  <span className="name">{entrepriseInfo.nom}</span>
                </div>
                {entrepriseInfo.adresse && (
                  <div className="entreprise-detail">
                    <FaMapMarkerAlt className="detail-icon" />
                    <span>{entrepriseInfo.adresse}</span>
                  </div>
                )}
                {entrepriseInfo.telephone && (
                  <div className="entreprise-detail">
                    <FaPhone className="detail-icon" />
                    <span>{entrepriseInfo.telephone}</span>
                  </div>
                )}
                {entrepriseInfo.email && (
                  <div className="entreprise-detail">
                    <FaEnvelope className="detail-icon" />
                    <span>{entrepriseInfo.email}</span>
                  </div>
                )}
                {entrepriseInfo.site && (
                  <div className="entreprise-detail">
                    <FaGlobe className="detail-icon" />
                    <span>{entrepriseInfo.site}</span>
                  </div>
                )}
                {entrepriseInfo.description && (
                  <div className="entreprise-description">
                    <p>{entrepriseInfo.description}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="detail-empty">
                Aucune information sur votre entreprise n'est encore disponible sur la plateforme.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EncadreurDashboard;