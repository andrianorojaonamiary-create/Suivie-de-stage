import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  FaUserCircle, FaEnvelope, FaPhone, FaBuilding, 
  FaLock, FaSave, FaUser, FaBook, FaGraduationCap, FaBriefcase,
  FaIdCard, FaMapMarkerAlt, FaGlobe,FaChalkboardTeacher ,FaShieldAlt
} from 'react-icons/fa';
import { sanitizePhone } from '../utils/phone';

function Profil() {
  const { user, updateProfile } = useAuth();

  const getProfileData = () => {
    const role = user?.role;
    
    const common = {
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      adresse: user?.adresse || '',
      role: role || 'ROLE_ETUDIANT',
      membreDepuis: 'Stage EMIT 2026',
    };

    const roleData = {
      'ROLE_ADMIN': {
        ...common,
        departement: user?.departement || 'Administration centrale',
        staffId: user?.id?.substring(0, 8) || 'ADM-001',
      },
      'ROLE_ETUDIANT': {
        ...common,
        matricule: user?.studentProfile?.matricule || user?.matricule || 'Non défini',
        niveau: user?.studentProfile?.niveau || user?.niveau || 'L3',
        filiere: user?.studentProfile?.parcours || user?.filiere || 'Informatique',
        ville: user?.adresse || 'Fianarantsoa',
      },
      'ROLE_ENSEIGNANT': {
        ...common,
        grade: user?.supervisorProfile?.grade || user?.grade || 'Enseignant',
        departement: user?.supervisorProfile?.departement || user?.departement || 'Informatique',
        specialite: user?.supervisorProfile?.specialite || user?.specialite || 'Informatique',
        staffId: user?.id?.substring(0, 8) || 'ENS-001',
      },
      'ROLE_ENCADREUR': {
        ...common,
        entreprise: user?.supervisorProfile?.entreprise?.nom || user?.entreprise || 'Entreprise',
        poste: user?.poste || 'Encadreur professionnel',
        adresse: user?.adresse || 'Madagascar',
        secteur: user?.supervisorProfile?.entreprise?.secteur || 'Technologie',
      },
    };

    return roleData[role] || roleData['ROLE_ETUDIANT'];
  };

  const [profile, setProfile] = useState(getProfileData());
  const [showPassForm, setShowPassForm] = useState(false);
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
      { name: 'email', label: 'Email', icon: <FaEnvelope style={{ color: '#A0B8D0' }} />, type: 'email' },
      { name: 'telephone', label: 'Téléphone', icon: <FaPhone style={{ color: '#A0B8D0' }} />, type: 'tel', maxLength: 14, inputMode: 'tel' },
    );

    if (role === 'ROLE_ADMIN') {
      fields.push(
        { name: 'departement', label: 'Service', icon: <FaBuilding style={{ color: '#A0B8D0' }} /> },
        { name: 'staffId', label: 'ID Utilisateur', icon: <FaIdCard style={{ color: '#A0B8D0' }} /> },
      );
    } else if (role === 'ROLE_ETUDIANT') {
      fields.push(
        { name: 'matricule', label: 'Numéro étudiant', icon: <FaIdCard style={{ color: '#A0B8D0' }} /> },
        { name: 'niveau', label: 'Niveau', icon: <FaGraduationCap style={{ color: '#A0B8D0' }} /> },
        { name: 'filiere', label: 'Parcours', icon: <FaBook style={{ color: '#A0B8D0' }} /> },
        { name: 'ville', label: 'Adresse / Ville', icon: <FaMapMarkerAlt style={{ color: '#A0B8D0' }} /> },
      );
    } else if (role === 'ROLE_ENSEIGNANT') {
      fields.push(
        { name: 'grade', label: 'Grade', icon: <FaGraduationCap style={{ color: '#A0B8D0' }} /> },
        { name: 'departement', label: 'Département', icon: <FaBuilding style={{ color: '#A0B8D0' }} /> },
        { name: 'specialite', label: 'Spécialité', icon: <FaBook style={{ color: '#A0B8D0' }} /> },
        { name: 'staffId', label: 'ID Enseignant', icon: <FaIdCard style={{ color: '#A0B8D0' }} /> },
      );
    } else if (role === 'ROLE_ENCADREUR') {
      fields.push(
        { name: 'entreprise', label: "Nom de l'entreprise", icon: <FaBuilding style={{ color: '#A0B8D0' }} /> },
        { name: 'poste', label: 'Fonction', icon: <FaBriefcase style={{ color: '#A0B8D0' }} /> },
        { name: 'adresse', label: "Adresse de l'entreprise", icon: <FaMapMarkerAlt style={{ color: '#A0B8D0' }} /> },
        { name: 'secteur', label: "Secteur d'activité", icon: <FaGlobe style={{ color: '#A0B8D0' }} /> },
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
      await updateProfile({
        nom: profile.nom,
        prenom: profile.prenom,
        telephone: profile.telephone,
        adresse: profile.adresse,
      });
    } catch {
      // toast error standard
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwords.new) {
      alert('Veuillez saisir un nouveau mot de passe');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      await updateProfile({ motDePasse: passwords.new });
      setShowPassForm(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch {
      // toast error
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
              <div key={index} className={`profil-form-group ${field.name === 'email' || field.name === 'telephone' ? 'full-width' : ''}`}>
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
                <div className="profil-security-sub">Dernière modification il y a 3 mois</div>
              </div>
              <button className="profil-password-btn" onClick={() => setShowPassForm(true)}>
                Changer le mot de passe
              </button>
            </div>
          ) : (
            <div className="profil-password-form">
              <div className="profil-form-group">
                <label>Mot de passe actuel</label>
                <input
                  type="password"
                  name="current"
                  placeholder="••••••••"
                  value={passwords.current}
                  onChange={handlePasswordChange}
                  className="profil-input"
                />
              </div>
              <div className="profil-form-group">
                <label>Nouveau mot de passe</label>
                <input
                  type="password"
                  name="new"
                  placeholder="••••••••"
                  value={passwords.new}
                  onChange={handlePasswordChange}
                  className="profil-input"
                />
              </div>
              <div className="profil-form-group">
                <label>Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  name="confirm"
                  placeholder="••••••••"
                  value={passwords.confirm}
                  onChange={handlePasswordChange}
                  className="profil-input"
                />
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
    </div>
  );
}

export default Profil;