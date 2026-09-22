import { useState, useRef, useEffect } from 'react';
import {
  FaGraduationCap, FaFilter, FaDownload, FaEye, FaSearch,
  FaUserGraduate, FaBuilding, FaBriefcase, FaCalendarAlt,
  FaChartBar, FaClock, FaMapMarkerAlt,
  FaPrint, FaTimes,
  FaEnvelope, FaPhone, FaChevronLeft, FaChevronRight,
  FaAward
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { professionalSituationsApi } from '../../api';
import SelectPersonnalise from '../../components/Common/SelectPersonnalise';

function AdminDiplomes() {
  // ===== ÉTATS =====
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSituation, setFilterSituation] = useState('Tous');
  const [filterPromotion, setFilterPromotion] = useState('Tous');
  const [selectedDiplome, setSelectedDiplome] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;
  const tableRef = useRef(null);

  // ===== DONNÉES DIPLÔMÉS =====
  const [diplomes, setDiplomes] = useState([
    {
      id: 1,
      nom: 'Rakoto',
      prenom: 'Miora',
      email: 'miora.rakoto@email.mg',
      telephone: '+261 34 12 345 67',
      promotion: '2023',
      filiere: 'Génie Informatique',
      situation: 'En emploi',
      entreprise: 'TechMada SARL',
      poste: 'Développeur Full-Stack',
      localisation: 'Antananarivo',
      dateEmbauche: '2023-11-15',
      secteur: 'Technologies',
      contrat: 'CDI',
      historique: [
        { entreprise: 'ABC Informatique', poste: 'Développeur Junior', dateDebut: '2023-01-01', dateFin: '2023-10-31' },
        { entreprise: 'TechMada SARL', poste: 'Développeur Full-Stack', dateDebut: '2023-11-15', dateFin: 'Présent' }
      ]
    },
    {
      id: 2,
      nom: 'Rakotondrabe',
      prenom: 'Hery',
      email: 'hery.rakotondrabe@email.mg',
      telephone: '+261 34 23 456 78',
      promotion: '2023',
      filiere: 'Management',
      situation: 'En recherche',
      entreprise: '',
      poste: '',
      localisation: 'Fianarantsoa',
      dateEmbauche: null,
      secteur: '',
      contrat: '',
      historique: [
        { entreprise: 'ABC Consulting', poste: 'Assistant Manager', dateDebut: '2023-02-01', dateFin: '2023-08-31' }
      ]
    },
    {
      id: 3,
      nom: 'Andriantsoa',
      prenom: 'Fanja',
      email: 'fanja.andriantsoa@email.mg',
      telephone: '+261 34 34 567 89',
      promotion: '2022',
      filiere: 'Relations publiques & Multimédia',
      situation: 'En emploi',
      entreprise: 'BNI Madagascar',
      poste: 'Chargée de communication',
      localisation: 'Antananarivo',
      dateEmbauche: '2022-07-01',
      secteur: 'Banque',
      contrat: 'CDI',
      historique: [
        { entreprise: 'BNI Madagascar', poste: 'Chargée de communication', dateDebut: '2022-07-01', dateFin: 'Présent' }
      ]
    },
    {
      id: 4,
      nom: 'Ramanantsoa',
      prenom: 'Tojo',
      email: 'tojo.ramanantsoa@email.mg',
      telephone: '+261 34 45 678 90',
      promotion: '2023',
      filiere: 'Génie Informatique',
      situation: 'Études supérieures',
      entreprise: 'Université d\'Antananarivo',
      poste: 'Master en Intelligence Artificielle',
      localisation: 'Antananarivo',
      dateEmbauche: '2023-09-01',
      secteur: 'Éducation',
      contrat: 'Étudiant',
      historique: [
        { entreprise: 'JIRAMA', poste: 'Stagiaire', dateDebut: '2023-01-01', dateFin: '2023-06-30' }
      ]
    }
  ]);

  useEffect(() => {
    const fetchDiplomes = async () => {
      try {
        setLoading(true);
        const res = await professionalSituationsApi.getAll();
        const list = Array.isArray(res) ? res : res?.data || res?.items || [];
        if (list.length > 0) {
          const mapped = list.map((item, idx) => {
            const studentUser = item.student?.user || {};
            let sitLabel = 'En emploi';
            if (item.situation === 'EN_RECHERCHE_EMPLOI' || item.situation === 'RECHERCHE') sitLabel = 'En recherche';
            else if (item.situation === 'POURSUITE_ETUDES') sitLabel = 'Études supérieures';
            else if (item.situation === 'EMPLOYE' || item.situation === 'ENTREPRENEUR') sitLabel = 'En emploi';

            return {
              id: item.id || idx + 1,
              nom: studentUser.nom || item.nom || 'Nom',
              prenom: studentUser.prenom || item.prenom || 'Prénom',
              email: studentUser.email || item.email || '—',
              telephone: item.student?.telephone || '—',
              promotion: item.student?.promotion || '2023',
              filiere: item.student?.formation || item.domaine || 'Informatique',
              situation: sitLabel,
              entreprise: item.entreprise || '—',
              poste: item.poste || '—',
              localisation: item.ville || item.pays || '—',
              dateEmbauche: item.dateDebut || null,
              secteur: item.domaine || '—',
              contrat: 'CDI',
              historique: []
            };
          });
          setDiplomes(mapped);
        } else {
          setDiplomes([]);
        }
      } catch (err) {
        console.error('Erreur chargement diplômés:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiplomes();
  }, []);

  // ===== STATISTIQUES =====
  const stats = {
    total: diplomes.length,
    enEmploi: diplomes.filter(d => d.situation === 'En emploi').length,
    enRecherche: diplomes.filter(d => d.situation === 'En recherche').length,
    etudesSuperieures: diplomes.filter(d => d.situation === 'Études supérieures').length,
    tauxEmploi: Math.round((diplomes.filter(d => d.situation === 'En emploi').length / diplomes.length) * 100)
  };

  // ===== DONNÉES POUR GRAPHIQUES =====
  const situationData = [
    { name: 'En emploi', value: stats.enEmploi, color: '#22C55E' },
    { name: 'En recherche', value: stats.enRecherche, color: '#F59E0B' },
    { name: 'Études supérieures', value: stats.etudesSuperieures, color: '#6BA9E6' },
  ];

  const promotionData = [
    { promotion: '2021', count: diplomes.filter(d => d.promotion === '2021').length },
    { promotion: '2022', count: diplomes.filter(d => d.promotion === '2022').length },
    { promotion: '2023', count: diplomes.filter(d => d.promotion === '2023').length },
  ];

  // ===== FILTRES =====
  const filteredDiplomes = diplomes.filter(d => {
    const matchSearch = d.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        d.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        d.entreprise.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSituation = filterSituation === 'Tous' || d.situation === filterSituation;
    const matchPromotion = filterPromotion === 'Tous' || d.promotion === filterPromotion;
    return matchSearch && matchSituation && matchPromotion;
  });

  // ===== PAGINATION =====
  const totalPages = Math.ceil(filteredDiplomes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDiplomes = filteredDiplomes.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // ===== OPTIONS =====
  const situationOptions = [
    { value: 'Tous', label: 'Tous' },
    { value: 'En emploi', label: 'En emploi' },
    { value: 'En recherche', label: 'En recherche' },
    { value: 'Études supérieures', label: 'Études supérieures' }
  ];
  const promotionOptions = [
    { value: 'Tous', label: 'Tous' },
    { value: '2021', label: '2021' },
    { value: '2022', label: '2022' },
    { value: '2023', label: '2023' }
  ];

  // ===== BADGES =====
  const getSituationBadge = (situation) => {
    const classes = {
      'En emploi': 'admin-diplome-badge-emploi',
      'En recherche': 'admin-diplome-badge-recherche',
      'Études supérieures': 'admin-diplome-badge-etudes',
    };
    return classes[situation] || 'admin-diplome-badge-emploi';
  };

  // ===== FORMAT DATE =====
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    if (dateStr === 'Présent') return 'Présent';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // ===== EXPORT PDF =====
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = tableRef.current;
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
      pdf.save('diplomes.pdf');
    } catch (error) {
      console.error('Erreur export PDF:', error);
      alert('Erreur lors de l\'export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // ===== IMPRIMER =====
  const handlePrint = () => {
    window.print();
  };

  // ===== OUVIR MODAL =====
  const handleViewDetails = (diplome) => {
    setSelectedDiplome(diplome);
    setShowDetailModal(true);
  };

  // ===== FORMAT PERSONNALISÉ POUR LES LABELS DU CAMEMBERT =====
  const renderCustomLabel = ({ cx, cy, midAngle,  outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#162449" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={11}
        fontWeight={500}
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="admin-diplome-page">
      {/* ===== HEADER ===== */}
      <div className="admin-diplome-header">
        <div>
          <h1>Suivi des diplômés</h1>
          <p className="admin-diplome-subtitle">Consultez la situation professionnelle et l'historique d'emploi des diplômés</p>
        </div>
        <div className="admin-diplome-actions">
          <button className="admin-diplome-btn-export" onClick={handleExportPDF} disabled={isExporting}>
            <FaDownload /> {isExporting ? 'Exportation...' : 'Exporter PDF'}
          </button>
        </div>
      </div>

      {/* ===== STATISTIQUES ===== */}
      <div className="admin-diplome-stats">
        <div className="admin-diplome-stat-card">
          <div className="admin-diplome-stat-icon-wrapper" style={{ background: '#E1ECFE', color: '#6BA9E6' }}>
            <FaUserGraduate />
          </div>
          <div className="admin-diplome-stat-content">
            <span className="admin-diplome-stat-value">{stats.total}</span>
            <span className="admin-diplome-stat-label">Total diplômés</span>
          </div>
        </div>
        <div className="admin-diplome-stat-card">
          <div className="admin-diplome-stat-icon-wrapper" style={{ background: '#D1FAE5', color: '#22C55E' }}>
            <FaAward />
          </div>
          <div className="admin-diplome-stat-content">
            <span className="admin-diplome-stat-value" style={{ color: '#22C55E' }}>{stats.enEmploi}</span>
            <span className="admin-diplome-stat-label">En emploi</span>
          </div>
        </div>
        <div className="admin-diplome-stat-card">
          <div className="admin-diplome-stat-icon-wrapper" style={{ background: '#FEF3C7', color: '#F59E0B' }}>
            <FaSearch />
          </div>
          <div className="admin-diplome-stat-content">
            <span className="admin-diplome-stat-value" style={{ color: '#F59E0B' }}>{stats.enRecherche}</span>
            <span className="admin-diplome-stat-label">En recherche</span>
          </div>
        </div>
        <div className="admin-diplome-stat-card">
          <div className="admin-diplome-stat-icon-wrapper" style={{ background: '#DBEAFE', color: '#6BA9E6' }}>
            <FaGraduationCap />
          </div>
          <div className="admin-diplome-stat-content">
            <span className="admin-diplome-stat-value" style={{ color: '#6BA9E6' }}>{stats.etudesSuperieures}</span>
            <span className="admin-diplome-stat-label">Études supérieures</span>
          </div>
        </div>
        <div className="admin-diplome-stat-card admin-diplome-stat-card-featured">
          <div className="admin-diplome-stat-icon-wrapper" style={{ background: '#162449', color: '#fff' }}>
            <FaChartBar />
          </div>
          <div className="admin-diplome-stat-content">
            <span className="admin-diplome-stat-value" style={{ color: '#162449' }}>{stats.tauxEmploi}%</span>
            <span className="admin-diplome-stat-label">Taux d'emploi</span>
          </div>
        </div>
      </div>

      {/* ===== DIAGRAMMES ===== */}
      <div className="admin-diplome-charts">
        <div className="admin-diplome-chart-card">
          <h3><FaChartBar /> Répartition par situation</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={situationData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={{ stroke: '#E1ECFE', strokeWidth: 1 }}
              >
                {situationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: 10, 
                  border: '1px solid #E1ECFE',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="admin-diplome-chart-card">
          <h3><FaChartBar /> Répartition par promotion</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={promotionData} barSize={48} barGap={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F8FC" />
              <XAxis dataKey="promotion" tick={{ fontSize: 11, fill: '#6c7a8a' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6c7a8a' }} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: 10, 
                  border: '1px solid #E1ECFE',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }} 
              />
              <Bar dataKey="count" fill="#162449" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== FILTRES + RECHERCHE ===== */}
      <div className="admin-diplome-filters">
        <div className="admin-diplome-filter-group">
          <label><FaFilter /> Filtres</label>
          <SelectPersonnalise
            value={filterSituation}
            onChange={setFilterSituation}
            options={situationOptions}
            className="admin-diplome-filter-select"
          />
          <SelectPersonnalise
            value={filterPromotion}
            onChange={setFilterPromotion}
            options={promotionOptions}
            className="admin-diplome-filter-select"
          />
        </div>
        <div className="admin-diplome-filter-group admin-diplome-search-group">
          <FaSearch className="admin-diplome-search-icon" />
          <input
            type="text"
            placeholder="Rechercher un diplômé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-diplome-search-input"
          />
        </div>
      </div>

      {/* ===== TABLEAU ===== */}
      <div className="admin-diplome-table-container" ref={tableRef}>
        <table className="admin-diplome-table">
          <thead>
            <tr>
              <th>Diplômé</th>
              <th>Promotion</th>
              <th>Filière</th>
              <th>Situation</th>
              <th>Entreprise</th>
              <th>Poste</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDiplomes.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-diplome-empty">Aucun diplômé trouvé</td>
              </tr>
            ) : (
              paginatedDiplomes.map((diplome) => (
                <tr key={diplome.id}>
                  <td>
                    <div className="admin-diplome-user">
                      <span className="admin-diplome-avatar">
                        {diplome.prenom[0]}{diplome.nom[0]}
                      </span>
                      <div>
                        <div className="admin-diplome-name">{diplome.prenom} {diplome.nom}</div>
                        <div className="admin-diplome-email">{diplome.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="admin-diplome-promotion-badge">{diplome.promotion}</span></td>
                  <td>{diplome.filiere}</td>
                  <td><span className={getSituationBadge(diplome.situation)}>{diplome.situation}</span></td>
                  <td>{diplome.entreprise || '—'}</td>
                  <td>{diplome.poste || '—'}</td>
                  <td>
                    <button className="admin-diplome-btn-view" onClick={() => handleViewDetails(diplome)}>
                      <FaEye /> Voir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ===== PAGINATION ===== */}
        {totalPages > 1 && (
          <div className="admin-diplome-pagination">
            <button 
              className="admin-diplome-pagination-btn" 
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </button>
            <span className="admin-diplome-pagination-info">
              Page {currentPage} sur {totalPages}
            </span>
            <button 
              className="admin-diplome-pagination-btn" 
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>

        {/* ===== MODAL DE DÉTAIL ===== */}
      {showDetailModal && selectedDiplome && (
        <div className="admin-diplome-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="admin-diplome-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-diplome-modal-header">
              <h3><FaUserGraduate /> Détail du diplômé</h3>
              <button className="admin-diplome-modal-close" onClick={() => setShowDetailModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="admin-diplome-modal-body">
              {/* Informations personnelles */}
              <div className="admin-diplome-modal-info">
                <div className="admin-diplome-modal-info-item">
                  <span className="admin-diplome-modal-info-label">Nom complet</span>
                  <span className="admin-diplome-modal-info-value">{selectedDiplome.prenom} {selectedDiplome.nom}</span>
                </div>
                <div className="admin-diplome-modal-info-item">
                  <span className="admin-diplome-modal-info-label">Email</span>
                  <span className="admin-diplome-modal-info-value"><FaEnvelope /> {selectedDiplome.email}</span>
                </div>
                <div className="admin-diplome-modal-info-item">
                  <span className="admin-diplome-modal-info-label">Téléphone</span>
                  <span className="admin-diplome-modal-info-value"><FaPhone /> {selectedDiplome.telephone}</span>
                </div>
                <div className="admin-diplome-modal-info-item">
                  <span className="admin-diplome-modal-info-label">Promotion</span>
                  <span className="admin-diplome-modal-info-value">{selectedDiplome.promotion}</span>
                </div>
                <div className="admin-diplome-modal-info-item">
                  <span className="admin-diplome-modal-info-label">Filière</span>
                  <span className="admin-diplome-modal-info-value">{selectedDiplome.filiere}</span>
                </div>
                <div className="admin-diplome-modal-info-item">
                  <span className="admin-diplome-modal-info-label">Situation</span>
                  <span className={getSituationBadge(selectedDiplome.situation)}>{selectedDiplome.situation}</span>
                </div>
              </div>

              {/* Situation professionnelle actuelle */}
              {selectedDiplome.situation === 'En emploi' && (
                <div className="admin-diplome-modal-emploi">
                  <h4>Situation professionnelle actuelle</h4>
                  <div className="admin-diplome-modal-emploi-grid">
                    <div className="admin-diplome-modal-emploi-item">
                      <span className="admin-diplome-modal-emploi-label">Entreprise</span>
                      <span className="admin-diplome-modal-emploi-value"><FaBuilding /> {selectedDiplome.entreprise}</span>
                    </div>
                    <div className="admin-diplome-modal-emploi-item">
                      <span className="admin-diplome-modal-emploi-label">Poste</span>
                      <span className="admin-diplome-modal-emploi-value"><FaBriefcase /> {selectedDiplome.poste}</span>
                    </div>
                    <div className="admin-diplome-modal-emploi-item">
                      <span className="admin-diplome-modal-emploi-label">Localisation</span>
                      <span className="admin-diplome-modal-emploi-value"><FaMapMarkerAlt /> {selectedDiplome.localisation}</span>
                    </div>
                    <div className="admin-diplome-modal-emploi-item">
                      <span className="admin-diplome-modal-emploi-label">Date d'embauche</span>
                      <span className="admin-diplome-modal-emploi-value"><FaCalendarAlt /> {formatDate(selectedDiplome.dateEmbauche)}</span>
                    </div>
                    <div className="admin-diplome-modal-emploi-item">
                      <span className="admin-diplome-modal-emploi-label">Secteur</span>
                      <span className="admin-diplome-modal-emploi-value">{selectedDiplome.secteur || '—'}</span>
                    </div>
                    <div className="admin-diplome-modal-emploi-item">
                      <span className="admin-diplome-modal-emploi-label">Type de contrat</span>
                      <span className="admin-diplome-modal-emploi-value">{selectedDiplome.contrat || '—'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Historique professionnel */}
              {selectedDiplome.historique && selectedDiplome.historique.length > 0 && (
                <div className="admin-diplome-modal-historique">
                  <h4><FaClock /> Historique professionnel</h4>
                  <div className="admin-diplome-modal-timeline">
                    {selectedDiplome.historique.map((item, index) => (
                      <div key={index} className="admin-diplome-modal-timeline-item">
                        <div className="admin-diplome-modal-timeline-dot"></div>
                        <div className="admin-diplome-modal-timeline-content">
                          <div className="admin-diplome-modal-timeline-header">
                            <span className="admin-diplome-modal-timeline-entreprise">{item.entreprise}</span>
                            <span className="admin-diplome-modal-timeline-poste">{item.poste}</span>
                          </div>
                          <div className="admin-diplome-modal-timeline-date">
                            {formatDate(item.dateDebut)} → {formatDate(item.dateFin)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="admin-diplome-modal-footer">
              <button className="admin-diplome-modal-btn-secondary" onClick={() => setShowDetailModal(false)}>
                Fermer
              </button>
              <button className="admin-diplome-modal-btn-primary" onClick={handlePrint}>
                <FaPrint /> Imprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDiplomes;