import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  FaUserCircle, FaEnvelope, FaPhone, FaBuilding, 
  FaLock, FaSave, FaUser, FaBook, FaGraduationCap, FaBriefcase,
  FaIdCard, FaMapMarkerAlt, FaChalkboardTeacher ,FaShieldAlt, FaTimes,
  FaEye, FaEyeSlash, FaCalendarAlt
} from 'react-icons/fa';
import { sanitizePhone } from '../utils/phone';
import { toast } from 'react-toastify';
import studentsApi from '../api/studentsApi';
import supervisorsApi from '../api/supervisorsApi';
import authApi from '../api/authApi';

const formatLastPasswordChange = (dateStr) => {
  if (!dateStr) return 'Jamais modifié';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'Jamais modifié';

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  const months = Math.floor(diffMs / 2592000000);
  const years = Math.floor(diffMs / 31536000000);

  if (minutes < 1) return 'modifié à l\'instant';
  if (minutes < 60) return `modifié il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  if (hours < 24) return `modifié il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  if (days < 30) return `modifié il y a ${days} jour${days > 1 ? 's' : ''}`;
  if (months < 12) return `modifié il y a ${months} mois`;
  return `modifié il y a ${years} an${years > 1 ? 's' : ''}`;
};

function Profil() {
  const { user, updateProfile, refreshUser } = useAuth();
  const [studentProfile, setStudentProfile] = useState(null);
  const [supervisorProfile, setSupervisorProfile] = useState(null);

  useEffect(() => {
    if (user?.role === 'ROLE_ETUDIANT') {
      const fetchStudentProfile = async () => {
        try {
          const res = await studentsApi.getAll();
          const profile = res?.items?.[0];
          if (profile) setStudentProfile(profile);
        } catch (err) {
          console.error('Erreur chargement profil étudiant:', err);
        }
      };
      fetchStudentProfile();
    } else if (user?.role === 'ROLE_ENCADREUR') {
      const fetchSupervisorProfile = async () => {
        try {
          const profile = await supervisorsApi.getMe();
          if (profile) setSupervisorProfile(profile);
        } catch (err) {
          console.error('Erreur chargement profil encadreur:', err);
        }
      };
      fetchSupervisorProfile();
    }
  }, [user?.role, user?.id]);

  const getProfileData = () => {
    const role = user?.role;
    
    const common = {
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || '',
      telephone: supervisorProfile?.telephone || studentProfile?.telephone || user?.telephone || '',
      role: role || 'ROLE_ETUDIANT',
      membreDepuis: 'Stage EMIT 2026',
    };

    const roleData = {
      'ROLE_ADMIN': {
        ...common,
        staffId: user?.id?.substring(0, 8) || 'ADM-001',
      },
      'ROLE_ETUDIANT': {
        ...common,
        matricule: studentProfile?.matricule || '—',
        niveau: studentProfile?.niveau || '—',
        filiere: studentProfile?.formation || '—',
        promotion: studentProfile?.promotion || '—',
        ville: studentProfile?.adresse || '—',
      },
      'ROLE_ENSEIGNANT': {
        ...common,
        grade: user?.grade || '—',
        departement: user?.departement || '—',
        specialite: user?.specialite || '—',
        matricule: user?.matricule || '—',
      },
      'ROLE_ENCADREUR': {
        ...common,
        poste: supervisorProfile?.fonction || '—',
        specialite: supervisorProfile?.specialite || '—',
        entreprise: supervisorProfile?.entreprise || '—',
      },
    };

    return roleData[role] || roleData['ROLE_ETUDIANT'];
  };

  const [profile, setProfile] = useState(getProfileData());

  useEffect(() => {
    const syncProfile = async () => {
      setProfile(getProfileData());
    };
    syncProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentProfile, supervisorProfile, user]);
  const [showPassForm, setShowPassForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'Administrateur';
      case 'ROLE_ETUDIANT': return 'Étudiant';
      case 'ROLE_ENSEIGNANT': return 'Enseignant';
      case 'ROLE_ENCADREUR': return 'Encadreur';
      default: return role;
    }
  };

  const roleColor = '#6BA9E6';

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return <FaShieldAlt />;
      case 'ROLE_ETUDIANT': return <FaGraduationCap />;
      case 'ROLE_ENSEIGNANT': return <FaChalkboardTeacher />;
      case 'ROLE_ENCADREUR': return <FaBriefcase />;
      default: return <FaUserCircle />;
    }
  };

  const getRoleFields = () => {
    const role = profile.role;
    const fields = [];

    fields.push(
      { name: 'nom', label: 'Nom', icon: <FaUser style={{ color: '#A0B8D0' }} /> },
      { name: 'prenom', label: 'Prénom', icon: <FaUser style={{ color: '#A0B8D0' }} /> },
      { name: 'email', label: 'Email', icon: <FaEnvelope style={{ color: '#A0B8D0' }} />, type: 'email', fullWidth: false },
    );

    if (role === 'ROLE_ADMIN') {
      fields.push(
        { name: 'staffId', label: 'ID Utilisateur', icon: <FaIdCard style={{ color: '#A0B8D0' }} />, readOnly: true },
      );
    } else if (role === 'ROLE_ETUDIANT') {
      fields.push(
        { name: 'telephone', label: 'Téléphone', icon: <FaPhone style={{ color: '#A0B8D0' }} />, type: 'tel', maxLength: 14, inputMode: 'tel', fullWidth: false },
        { name: 'matricule', label: 'Numéro étudiant', icon: <FaIdCard style={{ color: '#A0B8D0' }} />, readOnly: true },
        { name: 'niveau', label: 'Niveau', icon: <FaGraduationCap style={{ color: '#A0B8D0' }} />, readOnly: true },
        { name: 'filiere', label: 'Parcours', icon: <FaBook style={{ color: '#A0B8D0' }} />, readOnly: true },
        { name: 'promotion', label: 'Promotion', icon: <FaCalendarAlt style={{ color: '#A0B8D0' }} />, readOnly: true },
        { name: 'ville', label: 'Adresse / Ville', icon: <FaMapMarkerAlt style={{ color: '#A0B8D0' }} /> },
      );
    } else if (role === 'ROLE_ENSEIGNANT') {
      fields.push(
        { name: 'telephone', label: 'Téléphone', icon: <FaPhone style={{ color: '#A0B8D0' }} />, type: 'tel', maxLength: 14, inputMode: 'tel', fullWidth: false },
        { name: 'matricule', label: 'Matricule', icon: <FaIdCard style={{ color: '#A0B8D0' }} />, readOnly: true },
        { name: 'grade', label: 'Grade', icon: <FaGraduationCap style={{ color: '#A0B8D0' }} /> },
        { name: 'departement', label: 'Département', icon: <FaBuilding style={{ color: '#A0B8D0' }} /> },
        { name: 'specialite', label: 'Spécialité', icon: <FaBook style={{ color: '#A0B8D0' }} /> },
      );
    } else if (role === 'ROLE_ENCADREUR') {
      fields.push(
        { name: 'telephone', label: 'Téléphone', icon: <FaPhone style={{ color: '#A0B8D0' }} />, type: 'tel', maxLength: 14, inputMode: 'tel', fullWidth: false },
        { name: 'poste', label: 'Fonction', icon: <FaBriefcase style={{ color: '#A0B8D0' }} /> },
        { name: 'specialite', label: 'Spécialité', icon: <FaBook style={{ color: '#A0B8D0' }} /> },
        { name: 'entreprise', label: 'Entreprise', icon: <FaBuilding style={{ color: '#A0B8D0' }} /> },
      );
    }

    return fields;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'telephone' ? sanitizePhone(value) : value;
    setProfile(prev => ({ ...prev, [name]: nextValue }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (user?.role === 'ROLE_ETUDIANT') {
        await updateProfile({
          nom: profile.nom,
          prenom: profile.prenom,
        });
        if (studentProfile?.id) {
          await studentsApi.update(studentProfile.id, {
            telephone: profile.telephone || undefined,
            adresse: profile.ville || undefined,
          });
        }
      } else if (user?.role === 'ROLE_ENSEIGNANT') {
        await updateProfile({
          nom: profile.nom,
          prenom: profile.prenom,
          telephone: profile.telephone || undefined,
          grade: profile.grade || undefined,
          departement: profile.departement || undefined,
          specialite: profile.specialite || undefined,
        });
      } else if (user?.role === 'ROLE_ENCADREUR') {
        await updateProfile({
          nom: profile.nom,
          prenom: profile.prenom,
        });
        if (supervisorProfile?.id) {
          await supervisorsApi.update(supervisorProfile.id, {
            fonction: profile.poste || undefined,
            specialite: profile.specialite || undefined,
            telephone: profile.telephone || undefined,
            entreprise: profile.entreprise || undefined,
          });
        }
      } else {
        await updateProfile({
          nom: profile.nom,
          prenom: profile.prenom,
        });
      }
    } catch (err) {
      console.error('Erreur mise à jour du profil:', err);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwords.current) {
      setErrorMessage('Veuillez saisir votre mot de passe actuel');
      return;
    }
    if (!passwords.new) {
      setErrorMessage('Veuillez saisir un nouveau mot de passe');
      return;
    }
    if (passwords.new.length < 8) {
      setErrorMessage('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setErrorMessage('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      await authApi.changePassword({
        ancienMotDePasse: passwords.current,
        nouveauMotDePasse: passwords.new,
      });
      setErrorMessage('');
      setShowPassForm(false);
      setPasswords({ current: '', new: '', confirm: '' });
      toast.success('Mot de passe modifié avec succès !');
      refreshUser();
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du changement du mot de passe';
      setErrorMessage(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  const roleLabel = getRoleLabel(profile.role);
  const roleIcon = getRoleIcon(profile.role);
  const roleFields = getRoleFields();

  return (
    <div className="profil-page-container">
      <div className="profil-header">
        <h2>Mon profil</h2>
        <p className="text-muted">Gérez vos informations personnelles</p>
      </div>

      <div className="profil-card">
        <div className="profil-avatar-section">
          <div className="profil-avatar" style={{ backgroundColor: roleColor }}>
            {roleIcon}
          </div>
          <div className="profil-avatar-info">
            <span className="profil-name">{profile.prenom} {profile.nom}</span>
            <span className="profil-role-badge" style={{ backgroundColor: '#FAFBFF', color: '#6BA9E6' }}>
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="profil-form-container">
          <div className="profil-form-grid">
            {roleFields.map((field, index) => (
              <div key={index} className={`profil-form-group ${(field.name === 'email' || field.name === 'telephone') && field.fullWidth !== false ? 'full-width' : ''}`}>
                <label>
                  <span style={{ color: '#A0B8D0', marginRight: '8px', fontSize: '16px' }}>
                    {field.icon}
                  </span>
                  {field.label}
                </label>
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={profile[field.name] || ''}
                  onChange={handleChange}
                  className="profil-input"
                  placeholder={field.label}
                  maxLength={field.maxLength}
                  inputMode={field.inputMode}
                  readOnly={field.readOnly}
                />
              </div>
            ))}
          </div>

          <button className="profil-save-btn" onClick={handleSave}>
            <FaSave /> Enregistrer les modifications
          </button>
        </div>
      </div>

      <div className="profil-security-card">
        <div className="profil-security-header">
          <h3><FaLock /> Sécurité</h3>
        </div>
        <div className="profil-security-body">
          {!showPassForm ? (
            <div className="profil-security-row">
              <div>
                <div className="profil-security-label">Mot de passe</div>
                <div className="profil-security-sub">{formatLastPasswordChange(user?.motDePasseChangeAt)}</div>
              </div>
              <button className="profil-password-btn" onClick={() => setShowPassForm(true)}>
                Changer le mot de passe
              </button>
            </div>
          ) : (
            <div className="profil-password-form">
              <div className="profil-form-group">
                <label>Mot de passe actuel</label>
                <div className="password-input-wrapper">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    name="current"
                    placeholder="••••••••"
                    value={passwords.current}
                    onChange={handlePasswordChange}
                    className="profil-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowCurrent(!showCurrent)}
                    aria-label="Afficher le mot de passe actuel"
                  >
                    {showCurrent ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="profil-form-group">
                <label>Nouveau mot de passe</label>
                <div className="password-input-wrapper">
                  <input
                    type={showNew ? 'text' : 'password'}
                    name="new"
                    placeholder="••••••••"
                    value={passwords.new}
                    onChange={handlePasswordChange}
                    className="profil-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNew(!showNew)}
                    aria-label="Afficher le nouveau mot de passe"
                  >
                    {showNew ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="profil-form-group">
                <label>Confirmer le nouveau mot de passe</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirm"
                    placeholder="••••••••"
                    value={passwords.confirm}
                    onChange={handlePasswordChange}
                    className="profil-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label="Afficher le mot de passe de confirmation"
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="profil-password-actions">
                <button className="profil-save-btn" onClick={handlePasswordUpdate}>
                  Mettre à jour
                </button>
                <button className="profil-cancel-btn" onClick={() => setShowPassForm(false)}>
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="modal-overlay" onClick={() => setErrorMessage('')}>
          <div className="modal-content modal-delete" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaLock /> Mise à jour du mot de passe</h3>
              <button className="modal-close" onClick={() => setErrorMessage('')}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: '#6c7a8a', fontSize: '15px' }}>{errorMessage}</p>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setErrorMessage('')}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profil;
