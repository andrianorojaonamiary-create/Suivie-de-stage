import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../api/apiClient';
import { 
  FaEye, FaEyeSlash, FaArrowLeft, FaArrowRight, FaCheck,
  FaGraduationCap, FaChalkboardTeacher, FaUserTie
} from 'react-icons/fa';
import logo from '../../assets/logo_emit.jpg';  // ← Import du logo

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [agreed, setAgreed] = useState(false);

  const roleOptions = [
    { 
      value: 'ROLE_ETUDIANT', 
      label: 'Étudiant', 
      desc: 'Déclarez et suivez votre stage',
      Icon: FaGraduationCap,
      color: '#4A90D9', 
      bg: '#E8F0FE' 
    },
    { 
      value: 'ROLE_ENSEIGNANT', 
      label: 'Enseignant', 
      desc: 'Supervisez et évaluez les étudiants',
      Icon: FaChalkboardTeacher,
      color: '#1A3A6B', 
      bg: '#D6E4F0' 
    },
    { 
      value: 'ROLE_ENCADREUR', 
      label: 'Encadreur', 
      desc: 'Accédez au profil du stagiaire',
      Icon: FaUserTie,
      color: '#5BA3E6', 
      bg: '#E8F4FD' 
    },
  ];

  const getFieldsByRole = (role) => {
    const common = [
      { name: 'nom', label: 'Nom', placeholder: 'Votre nom', required: true },
      { name: 'prenom', label: 'Prénom', placeholder: 'Votre prénom', required: true },
      { name: 'email', label: 'Email', placeholder: 'votre.email@exemple.com', type: 'email', required: true },
      { name: 'telephone', label: 'Téléphone', placeholder: '+261 32 00 111 22', type: 'tel' },
    ];

    const roleFields = {
      'ROLE_ETUDIANT': [
        ...common,
        { name: 'matricule', label: 'Numéro étudiant', placeholder: 'ETU-2024-0421', required: true },
        { name: 'niveau', label: 'Niveau', placeholder: 'Master 2', required: true },
        { name: 'filiere', label: 'Filière', placeholder: 'Génie Logiciel', required: true },
      ],
      'ROLE_ENSEIGNANT': [
        ...common,
        { name: 'grade', label: 'Grade', placeholder: 'Professeur / Dr.', required: true },
        { name: 'departement', label: 'Département', placeholder: 'Informatique', required: true },
        { name: 'specialite', label: 'Spécialité', placeholder: 'Génie logiciel', required: true },
      ],
      'ROLE_ENCADREUR': [
        ...common,
        { name: 'entreprise', label: "Nom de l'entreprise", placeholder: 'TechMada SARL', required: true },
        { name: 'poste', label: 'Fonction', placeholder: 'Directeur technique', required: true },
        { name: 'adresse', label: "Adresse de l'entreprise", placeholder: 'Lot II M 77, Antananarivo' },
      ],
    };

    return roleFields[role] || common;
  };

  const selectedRoleMeta = roleOptions.find(r => r.value === selectedRole);
  const fields = selectedRole ? getFieldsByRole(selectedRole) : [];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData({});
    setStep(2);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step !== 2) return;

    const missingField = fields.find((field) => field.required && !formData[field.name]?.trim());
    if (missingField) {
      setError(`Le champ « ${missingField.label} » est obligatoire.`);
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setError('');
    setStep(3);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!agreed) {
      setError('Vous devez accepter les conditions.');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    if (formData.password && formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      setIsLoading(false);
      return;
    }

    try {
      const userData = { ...formData, role: selectedRole };
      await register(userData);
      setSuccess('Inscription réussie ! Redirection...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(getApiErrorMessage(err, "Erreur lors de l'inscription"));
    } finally {
      setIsLoading(false);
    }
  };

  const passwordFields = [
    { name: 'password', label: 'Mot de passe', placeholder: 'Minimum 8 caractères', type: 'password', required: true },
    { name: 'confirmPassword', label: 'Confirmer le mot de passe', placeholder: 'Répéter', type: 'password', required: true },
  ];

  const steps = [
    { id: 1, label: 'Rôle', desc: 'Sélectionner votre rôle dans la plateforme' },
    { id: 2, label: 'Informations', desc: 'Vos informations personnelles' },
    { id: 3, label: 'Confirmation', desc: 'Votre compte sera créé avec succès' },
  ];

  const getProgressWidth = () => {
    if (step === 1) return 33.33;
    if (step === 2) return 66.66;
    return 100;
  };

  const progressWidth = getProgressWidth();

  return (
    <div className="register-page-container">
      {/* GAUCHE */}
      <div className="register-left-panel">
        <div className="register-left-content">
          <div className="register-brand">
            <div className="register-logo-box">
              <img src={logo} alt="EMIT" className="register-logo-img" />  {/* ← Logo à la place du "E" */}
            </div>
            <div>
              <div className="register-brand-name">EMIT</div>
              <div className="register-brand-location">Fianarantsoa</div>
            </div>
          </div>

          <h2 className="register-left-title">Créer un compte</h2>
          <p className="register-left-subtitle">Rejoignez la plateforme de suivi des stages</p>

          <div className="register-steps-container">
            {steps.map((s, index) => {
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <div key={s.id} className="register-step-item">
                  <div className={`register-step-circle ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                    {isDone ? <FaCheck /> : s.id}
                  </div>
                  <div className="register-step-info">
                    <span className={`register-step-label ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                      {s.label}
                    </span>
                    <span className={`register-step-desc ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                      {s.desc}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`register-step-line ${isDone ? 'done' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="register-footer-copyright">
          <p>© 2026 EMIT — Fianarantsoa</p>
        </div>
      </div>

      {/* DROITE */}
      <div className="register-right-panel">
        <div className="register-form-card">
          <button className="register-back-btn" onClick={handleBack}>
            <FaArrowLeft className="back-icon" /> Retour
          </button>

          <div className="register-header-section">
            <div className="register-title-wrapper">
              {/* DROITE <span className="register-title-icon">📝</span>*/}
              <h2 className="register-page-title">Inscription</h2>
            </div>
            <p className="register-page-subtitle">Créez votre compte en quelques étapes</p>
          </div>

          <div className="register-progress-wrapper">
            <div className="register-progress-track">
              <div className="register-progress-fill" style={{ width: `${progressWidth}%` }} />
            </div>
          </div>

          {step === 1 && (
            <>
              <h2 className="register-form-title">Choisissez votre rôle</h2>
              <p className="register-form-subtitle">Sélectionnez le type de compte adapté à votre situation.</p>

              <div className="register-role-list">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className={`role-card ${selectedRole === opt.value ? 'selected' : ''}`}
                    onClick={() => handleRoleSelect(opt.value)}
                  >
                    <span className="role-icon" style={{ backgroundColor: opt.bg, color: opt.color }}>
                      <opt.Icon size={24} />
                    </span>
                    <div className="role-info">
                      <div className="role-label">{opt.label}</div>
                      <div className="role-desc">{opt.desc}</div>
                    </div>
                    <div className={`role-check ${selectedRole === opt.value ? 'checked' : ''}`}>
                      {selectedRole === opt.value && <FaCheck />}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && selectedRole && (
            <>
              <h2 className="register-form-title">{selectedRoleMeta?.label}</h2>
              <p className="register-form-subtitle">Renseignez vos informations</p>

              {error && <div className="alert alert-danger">{error}</div>}

              <form className="register-form">
                {fields.map((field) => (
                  <div key={field.name} className="form-group">
                    <label>{field.label} {field.required && <span className="required">*</span>}</label>
                    <input
                      type={field.type || 'text'}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      required={field.required}
                    />
                  </div>
                ))}
                {passwordFields.map((field) => (
                  <div key={field.name} className="form-group">
                    <label>{field.label} <span className="required">*</span></label>
                    <div className="password-input-wrapper">
                      <input
                        type={field.name === 'password' ? (showPassword ? 'text' : 'password') : (showConfirmPassword ? 'text' : 'password')}
                        name={field.name}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => {
                          if (field.name === 'password') setShowPassword(!showPassword);
                          else setShowConfirmPassword(!showConfirmPassword);
                        }}
                      >
                        {field.name === 'password' ? (showPassword ? <FaEyeSlash /> : <FaEye />) : (showConfirmPassword ? <FaEyeSlash /> : <FaEye />)}
                      </button>
                    </div>
                  </div>
                ))}
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="error-text">Les mots de passe ne correspondent pas.</p>
                )}
                <button type="button" className="register-next-btn" onClick={handleNext}>
                  Continuer <FaArrowRight />
                </button>
              </form>
            </>
          )}

          {step === 3 && selectedRole && (
            <form onSubmit={handleSubmit}>
              <h2 className="register-form-title">Confirmation</h2>
              <p className="register-form-subtitle">Vérifiez vos informations</p>

              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <div className="confirm-card">
                <div className="confirm-header">
                  <span className="confirm-role-icon" style={{ backgroundColor: selectedRoleMeta?.bg, color: selectedRoleMeta?.color }}>
                    {selectedRoleMeta && <selectedRoleMeta.Icon size={18} />}
                  </span>
                  {selectedRoleMeta?.label}
                </div>
                <div className="confirm-body">
                  {fields.filter(f => formData[f.name]).map((field) => (
                    <div key={field.name} className="confirm-item">
                      <span className="confirm-label">{field.label}</span>
                      <span className="confirm-value">{formData[field.name]}</span>
                    </div>
                  ))}
                  <div className="confirm-item">
                    <span className="confirm-label">Mot de passe</span>
                    <span className="confirm-value">••••••••</span>
                  </div>
                </div>
              </div>

              <label className="cgu-label">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <span>J'accepte les conditions d'utilisation</span>
              </label>

              <button type="submit" className="register-submit-btn" disabled={!agreed || isLoading}>
                {isLoading ? 'Création...' : 'Créer mon compte'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;