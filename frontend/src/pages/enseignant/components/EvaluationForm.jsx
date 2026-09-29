import { useState } from 'react';
import { 
  FaTimes, FaStar, FaUserGraduate, FaBuilding, 
  FaUserTie, FaSave, FaArrowLeft, FaChartLine,
  FaCode, FaClipboardCheck, FaRocket, FaClock,
  FaUsers, FaComment, FaCalendarCheck
} from 'react-icons/fa';

function EvaluationForm({ student, onClose, onSave }) {
  const [formData, setFormData] = useState({
    competenceTech: 0,
    qualiteTravail: 0,
    autonomie: 0,
    respectDelais: 0,
    espritEquipe: 0,
    communication: 0,
    assiduite: 0,
    appreciation: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'appreciation') {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
      return;
    }

    const numValue = value === '' ? 0 : Number(value);
    
    // Validation immédiate
    if (numValue < 0 || numValue > 20) {
      setErrors(prev => ({ ...prev, [name]: 'Note entre 0 et 20' }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    setFormData(prev => ({ ...prev, [name]: numValue }));
  };

  const getStars = (note) => {
    if (!note && note !== 0) return '';
    const stars = Math.round(note / 4);
    return '★'.repeat(Math.min(stars, 5)) + '☆'.repeat(Math.max(0, 5 - Math.min(stars, 5)));
  };

  const calculateAverage = () => {
    const keys = ['competenceTech', 'qualiteTravail', 'autonomie', 'respectDelais', 'espritEquipe', 'communication', 'assiduite'];
    const total = keys.reduce((sum, key) => sum + (formData[key] || 0), 0);
    return (total / keys.length).toFixed(1);
  };

  const validate = () => {
    const newErrors = {};
    const keys = ['competenceTech', 'qualiteTravail', 'autonomie', 'respectDelais', 'espritEquipe', 'communication', 'assiduite'];
    
    keys.forEach(key => {
      if (formData[key] < 0 || formData[key] > 20) {
        newErrors[key] = 'Note entre 0 et 20';
      }
    });

    if (!formData.appreciation || formData.appreciation.trim() === '') {
      newErrors.appreciation = 'Appréciation obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const average = calculateAverage();
      onSave({ ...formData, moyenne: average });
    }
  };

  const criteria = [
    { key: 'competenceTech', label: 'Compétences techniques', icon: <FaCode /> },
    { key: 'qualiteTravail', label: 'Qualité du travail', icon: <FaClipboardCheck /> },
    { key: 'autonomie', label: 'Autonomie', icon: <FaRocket /> },
    { key: 'respectDelais', label: 'Respect des délais', icon: <FaClock /> },
    { key: 'espritEquipe', label: "Esprit d'équipe", icon: <FaUsers /> },
    { key: 'communication', label: 'Communication', icon: <FaComment /> },
    { key: 'assiduite', label: 'Assiduité et ponctualité', icon: <FaCalendarCheck /> }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-evaluation" onClick={(e) => e.stopPropagation()}>
        {/* ===== HEADER ===== */}
        <div className="modal-header">
          <h2><FaStar className="modal-icon-validate" /> Évaluation du stage</h2>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        {/* ===== BODY ===== */}
        <div className="modal-body eval-form-body">
          {/* ===== INFOS ÉTUDIANT ===== */}
          <div className="eval-info-header">
            <div className="eval-info-row">
              <span className="eval-info-label"><FaUserGraduate /> Étudiant</span>
              <span className="eval-info-value"><strong>{student.nom}</strong></span>
            </div>
            <div className="eval-info-row">
              <span className="eval-info-label"><FaBuilding /> Stage</span>
              <span className="eval-info-value">{student.stage.titre}</span>
            </div>
            <div className="eval-info-row">
              <span className="eval-info-label"><FaBuilding /> Entreprise</span>
              <span className="eval-info-value">{student.stage.entreprise}</span>
            </div>
            <div className="eval-info-row">
              <span className="eval-info-label"><FaUserTie /> Évaluateur</span>
              <span className="eval-info-value">{student.evaluateur}</span>
            </div>
          </div>

          {/* ===== CRITÈRES ===== */}
          <div className="eval-criteres-container">
            <h3 className="eval-section-title"><FaChartLine /> Critères d'évaluation</h3>
            
            {criteria.map((critere) => (
              <div key={critere.key} className="eval-critere-row">
                <div className="eval-critere-label">
                  <span className="eval-critere-icon">{critere.icon}</span>
                  <span>{critere.label}</span>
                  <span className="eval-critere-stars">{getStars(formData[critere.key])}</span>
                </div>
                <div className="eval-critere-input">
                  <input
                    type="number"
                    name={critere.key}
                    value={formData[critere.key] || ''}
                    onChange={handleChange}
                    min="0"
                    max="20"
                    step="1"
                    className={`eval-input-number ${errors[critere.key] ? 'error' : ''}`}
                    placeholder="0"
                  />
                  <span className="eval-input-suffix">/ 20</span>
                </div>
                {errors[critere.key] && (
                  <span className="eval-error">{errors[critere.key]}</span>
                )}
              </div>
            ))}

            {/* ===== MOYENNE ===== */}
            <div className="eval-moyenne-row">
              <span className="eval-moyenne-label"><FaChartLine /> Moyenne</span>
              <span className="eval-moyenne-value">{calculateAverage()} / 20</span>
              <span className="eval-moyenne-stars">{getStars(calculateAverage())}</span>
            </div>
          </div>

          {/* ===== APPRÉCIATION ===== */}
          <div className="eval-appreciation-container">
            <h3 className="eval-section-title"><FaComment /> Appréciation générale</h3>
            <textarea
              name="appreciation"
              value={formData.appreciation}
              onChange={handleChange}
              className={`eval-textarea ${errors.appreciation ? 'error' : ''}`}
              placeholder="Rédigez votre appréciation générale sur l'étudiant..."
              rows="4"
              maxLength="500"
            />
            <div className="eval-textarea-footer">
              <span className="eval-char-count">
                {formData.appreciation.length} / 500 caractères
              </span>
              {errors.appreciation && (
                <span className="eval-error">{errors.appreciation}</span>
              )}
            </div>
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={onClose}>
            <FaArrowLeft /> Annuler
          </button>
          <button className="btn-modal-confirm btn-validate" onClick={handleSubmit}>
            <FaSave /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

export default EvaluationForm;