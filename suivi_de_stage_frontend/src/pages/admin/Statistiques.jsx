import { useState, useRef, useEffect } from 'react';
import {
  FaChartBar, FaChartLine, FaUsers, FaBuilding,
  FaGraduationCap,
  FaClock, FaTrophy, FaUserGraduate,
  FaFilter, FaDownload, FaBriefcase,
  FaStar,
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';
import { toast } from 'react-toastify';
import statisticsApi from '../../api/statisticsApi';
import { notificationsApi, getApiErrorMessage } from '../../api';

// ===== TOOLTIP PERSONNALISÉ =====
const EvaluationTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    return (
      <div className="stats-custom-tooltip">
        <p className="stats-tooltip-label">{label}</p>
        <p className="stats-tooltip-value">{payload[0].value} évaluations</p>
        <p className="stats-tooltip-percentage">{data?.pourcentage || ''}</p>
      </div>
    );
  }
  return null;
};

const MOIS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

const formatMois = (mois) => {
  const match = /^(\d{4})-(\d{2})$/.exec(mois || '');
  if (!match) return mois || '';
  return `${MOIS_FR[Number(match[2]) - 1]} ${match[1]}`;
};

// Année scolaire : début novembre, fin octobre de l'année suivante
const anneeScolaireCourante = () => {
  const now = new Date();
  const y = now.getFullYear();
  const start = now.getMonth() + 1 >= 11 ? y : y - 1;
  return `${start}-${start + 1}`;
};

const periodeParams = (annee) => {
  if (!annee || annee === 'Toutes') return {};
  const [start] = String(annee).split('-').map(Number);
  return { debut: `${start}-11-01`, fin: `${start + 1}-10-31`, promotion: String(start) };
};

const optionsAnneeScolaireFromPromos = (promotions) => {
  const starts = new Set();
  (promotions || []).forEach((p) => {
    const n = Number(p);
    if (!Number.isNaN(n)) starts.add(n);
  });
  return [...starts]
    .sort((a, b) => a - b)
    .map((y) => ({ value: `${y}-${y + 1}`, label: `Année ${y}-${y + 1}` }));
};

function Statistiques() {
  const [filterAnneeScolaire, setFilterAnneeScolaire] = useState('Toutes');
  const [anneeOptions, setAnneeOptions] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const statsRef = useRef(null);

  const [dashboard, setDashboard] = useState(null);
  const [internshipStats, setInternshipStats] = useState(null);
  const [overview, setOverview] = useState(null);
  const [activites, setActivites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const COLORS = ['#6BA9E6', '#F59E0B', '#22C55E', '#7C3AED', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6', '#162449'];

  // ===== CHARGEMENT DES DONNÉES BACKEND =====
  // 1) Options des années scolaires (appel sans filtre) + sélection par défaut
  useEffect(() => {
    const buildOptions = async () => {
      try {
        const res = await statisticsApi.getDashboard();
        const promotions = Array.isArray(res) ? res : res?.promotions || [];
        const options = [
          { value: 'Toutes', label: 'Toutes les années' },
          ...optionsAnneeScolaireFromPromos(promotions),
        ];
        setAnneeOptions(options);
        const current = anneeScolaireCourante();
        setFilterAnneeScolaire(
          options.some((o) => o.value === current) ? current : 'Toutes',
        );
      } catch (err) {
        setError(getApiErrorMessage(err, 'Erreur lors du chargement des statistiques'));
      }
    };
    buildOptions();
  }, []);

  // 2) Données filtrées par année scolaire
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const params = periodeParams(filterAnneeScolaire);
        const [dashRes, statsRes, overviewRes, notifsRes] = await Promise.allSettled([
          statisticsApi.getDashboard(params),
          statisticsApi.getInternships(params),
          statisticsApi.getOverview(params),
          notificationsApi.getAll({ limit: 5 }),
        ]);
        if (dashRes.status === 'fulfilled' && dashRes.value) setDashboard(dashRes.value);
        if (statsRes.status === 'fulfilled' && statsRes.value) setInternshipStats(statsRes.value);
        if (overviewRes.status === 'fulfilled' && overviewRes.value) setOverview(overviewRes.value);
        const notifsValue = notifsRes.status === 'fulfilled' ? notifsRes.value : null;
        const notifs = Array.isArray(notifsValue)
          ? notifsValue
          : notifsValue?.data || notifsValue?.items || [];
        setActivites(
          notifs.slice(0, 5).map((n, idx) => {
            const date = n.date_creation ?? n.dateCreation ?? n.createdAt;
            return {
              id: n.id || idx,
              action: n.titre || n.title || 'Notification',
              utilisateur: '—',
              details: n.message || n.content || '',
              date: date ? new Date(date).toLocaleDateString('fr-FR') : '—',
            };
          }),
        );
      } catch (err) {
        setError(getApiErrorMessage(err, 'Erreur lors du chargement des statistiques'));
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [filterAnneeScolaire]);

  // ===== FONCTION EXPORT PDF =====
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = statsRef.current;
      if (!element) return;

      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`statistiques_${filterAnneeScolaire}.pdf`);
    } catch (error) {
      console.error('Erreur export PDF:', error);
      toast.error('Erreur lors de l\'export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // ===== DONNÉES DÉRIVÉES =====
  const counts = dashboard?.counts || {};
  const utilisateursTotal = (counts.students || 0) + (counts.supervisors || 0);

  const kpiData = [
    { label: 'Utilisateurs totaux', value: String(utilisateursTotal), evolution: '—', vs: '', icon: <FaUsers />, color: '#6BA9E6', bg: '#DBEBF9' },
    { label: 'Étudiants', value: String(counts.students || 0), evolution: '—', vs: '', icon: <FaUserGraduate />, color: '#7C3AED', bg: '#EDE9FE' },
    { label: 'Entreprises', value: String(counts.companies || 0), evolution: '—', vs: '', icon: <FaBuilding />, color: '#F59E0B', bg: '#FEF3C7' },
    { label: 'Stages créés', value: String(counts.internships || 0), evolution: '—', vs: '', icon: <FaBriefcase />, color: '#22C55E', bg: '#D1FAE5' },
  ];

  const months = overview?.byMonth || [];

  const stagesParMois = months.map((m) => ({
    mois: formatMois(m.mois),
    stages: m.crees,
  }));

  const evolutionStages = months.map((m) => ({
    mois: formatMois(m.mois),
    crees: m.crees,
    termines: m.termines,
  }));

  const rawStatus = dashboard?.statusData || [];
  const totalStatutStages = rawStatus.reduce(
    (acc, s) => acc + (Number(s.value) || 0),
    0,
  );
  const statutStages = [
    { name: 'Total', value: totalStatutStages, pourcentage: '100%' },
    ...rawStatus.map((s) => {
      const value = Number(s.value) || 0;
      return {
        name: s.name,
        value,
        pourcentage: totalStatutStages > 0 ? `${Math.round((value / totalStatutStages) * 100)}%` : '0%',
      };
    }),
  ];
  const statusColorsMap = {
    'En attente': '#F59E0B',
    'En cours': '#162449',
    'Terminé': '#27AE60',
  };
  const statutStagesPie = rawStatus.map((s, index) => ({
    name: s.name,
    value: Number(s.value) || 0,
    color: statusColorsMap[s.name] || COLORS[index % COLORS.length],
  }));

  const byDomain = internshipStats?.byDomain || [];
  const totalDomaines = byDomain.reduce((acc, d) => acc + Number(d.count), 0);
  const stagesParFiliere = byDomain.map((d, index) => ({
    filiere: d.domain,
    valeur: Number(d.count),
    pourcentage: totalDomaines > 0 ? `${Math.round((Number(d.count) / totalDomaines) * 100)}%` : '0%',
    color: COLORS[index % COLORS.length],
  }));

  const byNiveau = overview?.byNiveau || [];
  const totalNiveau = byNiveau.reduce((acc, n) => acc + Number(n.count), 0);
  const repartitionNiveau = [
    ...byNiveau.map((n) => ({
      niveau: n.niveau,
      nombre: Number(n.count),
      pourcentage: totalNiveau > 0 ? Math.round((Number(n.count) / totalNiveau) * 100) : 0,
    })),
    { niveau: 'Total', nombre: totalNiveau, pourcentage: 100 },
  ];

  const topEntreprises = (overview?.topCompanies || []).map((c) => ({
    nom: c.nom,
    ville: c.ville,
    secteur: c.secteur,
    stages: Number(c.stages),
  }));

  const evaluationsData = (overview?.evalDist || []).map((e) => ({
    note: e.note,
    count: e.count,
    intervalle: '/20',
  }));

  const activitesRecentes = activites;

  return (
    <div className="admin-stats-page" ref={statsRef}>
      {/* ===== HEADER ===== */}
      <div className="admin-stats-header">
        <div>
          <h1>Statistiques</h1>
          <p className="admin-stats-subtitle">Vue d'ensemble des données de la plateforme</p>
        </div>
        <div className="admin-stats-actions">
          <button
            className="admin-stats-btn-export"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            <FaDownload /> {isExporting ? 'Exportation...' : 'Exporter PDF'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* ===== FILTRE PAR ANNÉE SCOLAIRE ===== */}
      <div className="admin-stats-filter-section">
        <div className="admin-stats-filter-group">
          <label>
            <FaFilter /> Filtrer par année scolaire
          </label>
          <SelectPersonnalise
            value={filterAnneeScolaire}
            onChange={setFilterAnneeScolaire}
            options={anneeOptions}
            className="admin-stats-filter-select"
          />
        </div>
        <div className="admin-stats-filter-count">
          {loading ? (
            <span>Chargement...</span>
          ) : (
            <><strong>{filterAnneeScolaire}</strong> · Données affichées</>
          )}
        </div>
      </div>

      {/* ===== LIGNE 1 : 4 KPI CARDS ===== */}
      <div className="admin-stats-kpi">
        {kpiData.map((item, index) => (
          <div key={index} className="admin-kpi-card">
            <div className="admin-kpi-top">
              <div className="admin-kpi-icon" style={{ backgroundColor: item.bg, color: item.color }}>
                {item.icon}
              </div>
              <div className="admin-kpi-content">
                <span className="admin-kpi-value">{item.value}</span>
                <span className="admin-kpi-label">{item.label}</span>
              </div>
            </div>
            <div className="admin-kpi-evolution" style={{ color: item.color }}>
              {item.evolution} <span className="admin-kpi-vs">{item.vs}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ===== LIGNE 2 : Stages par mois (2/3) + Répartition par niveau (1/3) ===== */}
      <div className="stats-row-2-3">
        <div className="stats-card stats-card-2-3">
          <div className="stats-card-header">
            <h3><FaChartBar /> Stages par mois</h3>
            <span className="stats-badge">{filterAnneeScolaire}</span>
          </div>
          <div className="stats-card-body">
            <div className="stats-diagramme-max">
<ResponsiveContainer width="100%" height={280}>
              <BarChart data={stagesParMois} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F8FC" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#6c7a8a' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6c7a8a' }} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E1ECFE' }} />
                <Bar dataKey="stages" fill={COLORS[8]} radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="stats-card stats-card-1-3">
          <div className="stats-card-header">
            <h3><FaUsers /> Répartition par niveau</h3>
          </div>
          <div className="stats-card-body">
            <table className="stats-table stats-table-small">
              <thead>
                <tr>
                  <th>Niveau</th>
                  <th>Nombre</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {repartitionNiveau.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="admin-rapports-empty">Aucune donnée</td>
                  </tr>
                ) : (
                  repartitionNiveau.map((item, index) => (
                    <tr key={index} className={item.niveau === 'Total' ? 'stats-table-total' : ''}>
                      <td><strong>{item.niveau}</strong></td>
                      <td>{item.nombre}</td>
                      <td>{item.pourcentage}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== LIGNE 3 : Évolution stages (2/3) + Statistiques stages (1/3) ===== */}
      <div className="stats-row-2-3">
        <div className="stats-card stats-card-2-3">
          <div className="stats-card-header">
            <h3><FaChartLine /> Évolution des stages</h3>
            <span className="stats-badge">Créés vs Terminés</span>
          </div>
          <div className="stats-card-body">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={evolutionStages} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F8FC" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#6c7a8a' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6c7a8a' }} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E1ECFE' }} />
                <Legend />
                <Line type="monotone" dataKey="crees" stroke={COLORS[8]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="termines" stroke={COLORS[2]} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stats-card stats-card-1-3">
          <div className="stats-card-header">
            <h3><FaChartBar /> Statistiques stages</h3>
          </div>
          <div className="stats-card-body">
            <div className="stats-statut-container">
              <div className="stats-statut-pie">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={statutStagesPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                      label={false}
                    >
                      {statutStagesPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '10px', border: '1px solid #E1ECFE', zIndex: 9999 }}
                      formatter={(value, name) => [`${value} stages`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="stats-statut-total" style={{ zIndex: 1 }}>
                  <span className="stats-statut-total-value">{statutStages[0]?.value ?? 0}</span>
                  <span className="stats-statut-total-label">Total</span>
                </div>
              </div>
              <div className="stats-statut-list">
                {statutStages.slice(1).map((item, index) => (
                  <div key={index} className="stats-statut-item">
                    <span className="stats-statut-dot" style={{ backgroundColor: statutStagesPie[index].color }} />
                    <span className="stats-statut-name">{item.name}</span>
                    <span className="stats-statut-value">{item.value}</span>
                    <span className="stats-statut-pourcentage">{item.pourcentage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== LIGNE 4 : Stages par filière (1/2) + Répartition évaluations (1/2) ===== */}
      <div className="stats-row-1-2">
        <div className="stats-card">
          <div className="stats-card-header">
            <h3><FaGraduationCap /> Stages par filière</h3>
          </div>
          <div className="stats-card-body">
            <div className="stats-filiere-container">
              <div className="stats-filiere-pie">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stagesParFiliere}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="valeur"
                      label={false}
                    >
                      {stagesParFiliere.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '10px', border: '1px solid #E1ECFE' }}
                      formatter={(value, name) => [`Nombre d'étudiants : ${value}`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="stats-filiere-total" style={{ zIndex: 1 }}>
                  <span className="stats-filiere-total-value">{totalDomaines}</span>
                  <span className="stats-filiere-total-label">Total</span>
                </div>
              </div>
              <div className="stats-filiere-list">
                {stagesParFiliere.length === 0 && (
                  <div className="admin-rapports-empty">Aucune donnée</div>
                )}
                {stagesParFiliere.map((item, index) => (
                  <div key={index} className="stats-filiere-item">
                    <span className="stats-filiere-dot" style={{ backgroundColor: item.color }} />
                    <span className="stats-filiere-name">{item.filiere}</span>
                    <span className="stats-filiere-value">{item.valeur}</span>
                    <span className="stats-filiere-pourcentage">{item.pourcentage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <h3><FaStar /> Répartition évaluations</h3>
          </div>
          <div className="stats-card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={evaluationsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F8FC" />
                <XAxis dataKey="note" tick={{ fontSize: 10, fill: '#6c7a8a' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6c7a8a' }} />
                <Tooltip content={<EvaluationTooltip />} />
                <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="stats-eval-legend">
              {evaluationsData.map((item, index) => (
                <div key={index} className="stats-eval-item">
                  <span className="stats-eval-label">{item.note}</span>
                  <span className="stats-eval-intervalle">{item.intervalle}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== LIGNE 5 : Top 5 entreprises (tableau pleine largeur) ===== */}
      <div className="stats-row-full">
        <div className="stats-card">
          <div className="stats-card-header">
            <h3><FaTrophy /> Top 5 entreprises accueillantes</h3>
            <span className="stats-badge">{topEntreprises.reduce((acc, item) => acc + item.stages, 0)} stages au total</span>
          </div>
          <div className="stats-card-body">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Entreprise</th>
                  <th>Ville</th>
                  <th>Secteur</th>
                  <th>Stages</th>
                </tr>
              </thead>
              <tbody>
                {topEntreprises.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="admin-rapports-empty">Aucune donnée</td>
                  </tr>
                ) : (
                  topEntreprises.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <span
                          className="stats-top-rank"
                          style={{
                            backgroundColor: index === 0 ? '#F59E0B' : index === 1 ? '#9CA3AF' : index === 2 ? '#D97706' : '#6BA9E6'
                          }}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td><strong>{item.nom}</strong></td>
                      <td>{item.ville}</td>
                      <td>{item.secteur}</td>
                      <td><strong>{item.stages}</strong></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== LIGNE 6 : Activités récentes (pleine largeur) ===== */}
      <div className="stats-row-full">
        <div className="stats-card">
          <div className="stats-card-header">
            <h3><FaClock /> Activités récentes</h3>
          </div>
          <div className="stats-card-body">
            <table className="stats-table stats-table-activites">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Utilisateur</th>
                  <th>Détails</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {activitesRecentes.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="admin-rapports-empty">Aucune activité récente</td>
                  </tr>
                ) : (
                  activitesRecentes.map((item, index) => (
                    <tr key={index}>
                      <td><strong>{item.action}</strong></td>
                      <td>{item.utilisateur}</td>
                      <td>{item.details}</td>
                      <td className="stats-activite-date-cell">{item.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistiques;