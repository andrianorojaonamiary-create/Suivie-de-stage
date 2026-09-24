import { useState, useRef } from 'react';
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

import { useEffect } from 'react';
import statisticsApi from '../../api/statisticsApi';

function Statistiques() {

  const [filterYear, setFilterYear] = useState('2026');
  const [isExporting, setIsExporting] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const statsRef = useRef(null);

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        setLoading(true);
        const [dash, intern, emp, geo] = await Promise.allSettled([
          statisticsApi.getDashboard(),
          statisticsApi.getInternships(),
          statisticsApi.getEmployment(),
          statisticsApi.getGeography()
        ]);
        setStatsData({
          dash: dash.status === 'fulfilled' ? dash.value : null,
          intern: intern.status === 'fulfilled' ? intern.value : null,
          emp: emp.status === 'fulfilled' ? emp.value : null,
          geo: geo.status === 'fulfilled' ? geo.value : null,
        });
      } catch (err) {
        console.error('Erreur chargement statistiques:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, [filterYear]);

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
      pdf.save(`statistiques_${filterYear}.pdf`);
    } catch (error) {
      console.error('Erreur export PDF:', error);
      toast.error('Erreur lors de l\'export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // ===== KPI CARDS =====
  const kpiData = [
    { label: 'Utilisateurs totaux', value: '0', evolution: '—', vs: '', icon: <FaUsers />, color: '#6BA9E6', bg: '#DBEBF9' },
    { label: 'Étudiants', value: '0', evolution: '—', vs: '', icon: <FaUserGraduate />, color: '#7C3AED', bg: '#EDE9FE' },
    { label: 'Entreprises', value: '0', evolution: '—', vs: '', icon: <FaBuilding />, color: '#F59E0B', bg: '#FEF3C7' },
    { label: 'Stages créés', value: '0', evolution: '—', vs: '', icon: <FaBriefcase />, color: '#22C55E', bg: '#D1FAE5' },
  ];

  // ===== STAGES PAR MOIS =====
  const stagesParMois = [];

  // ===== ÉVOLUTION STAGES =====
  const evolutionStages = [];

  // ===== STATUT STAGES =====
  const statutStages = [];

  // ===== STAGES PAR FILIÈRE =====
  const stagesParFiliere = [];

  // ===== TOP 5 ENTREPRISES =====
  const topEntreprises = [];

  // ===== RÉPARTITION PAR NIVEAU =====
  const repartitionNiveau = [];

  // ===== ACTIVITÉS RÉCENTES =====
  const activitesRecentes = [];

  // ===== STATUT STAGES POUR CAMEMBERT =====
  const statutStagesPie = [];

  // ===== ÉVALUATIONS =====
  const evaluationsData = [];

  const COLORS = ['#6BA9E6', '#F59E0B', '#22C55E', '#7C3AED', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6','#162449'];

  // ===== OPTIONS DU FILTRE =====
  const yearOptions = [
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' },
  ];

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

      {/* ===== FILTRE COMME DANS LA PAGE MAP ===== */}
      <div className="admin-stats-filter-section">
        <div className="admin-stats-filter-group">
          <label>
            <FaFilter /> Filtrer par année
          </label>
          <SelectPersonnalise
            value={filterYear}
            onChange={setFilterYear}
            options={yearOptions}
            className="admin-stats-filter-select"
          />
        </div>
        <div className="admin-stats-filter-count">
          <strong>{filterYear}</strong> · Données affichées
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
            <span className="stats-badge">{filterYear}</span>
          </div>
          <div className="stats-card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stagesParMois} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F8FC" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#6c7a8a' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6c7a8a' }} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E1ECFE' }} />
                <Bar dataKey="stages" fill={COLORS[8]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
                {repartitionNiveau.map((item, index) => (
                  <tr key={index} className={item.niveau === 'Total' ? 'stats-table-total' : ''}>
                    <td><strong>{item.niveau}</strong></td>
                    <td>{item.nombre}</td>
                    <td>{item.pourcentage}%</td>
                  </tr>
                ))}
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
                  <span className="stats-filiere-total-value">0</span>
                  <span className="stats-filiere-total-label">Total</span>
                </div>
              </div>
              <div className="stats-filiere-list">
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
                {topEntreprises.map((item, index) => (
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
                ))}
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
                {activitesRecentes.map((item, index) => (
                  <tr key={index}>
                    <td><strong>{item.action}</strong></td>
                    <td>{item.utilisateur}</td>
                    <td>{item.details}</td>
                    <td className="stats-activite-date-cell">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistiques;