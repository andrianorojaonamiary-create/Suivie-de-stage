import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';

function Profil() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    password: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setSuccess('✅ Profil mis à jour avec succès !');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="profil-overlay" onClick={handleClose}>
      <div className="profil-modal" onClick={(e) => e.stopPropagation()}>
        <button className="profil-close" onClick={handleClose}>
          <FaTimes />
        </button>

        {/* ===== TITRE UNIQUEMENT ===== */}
        <h2 className="profil-title">Mon profil</h2>
        <p className="profil-subtitle">Gérez vos informations personnelles</p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="profil-form">
          {/* Nom */}
          <div className="form-group">
            <label htmlFor="nom">Nom</label>
            <input
              type="text"
              id="nom"
              name="nom"
              className="form-control"
              value={formData.nom}
              onChange={handleChange}
            />
          </div>

          {/* Prénom */}
          <div className="form-group">
            <label htmlFor="prenom">Prénom</label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              className="form-control"
              value={formData.prenom}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Téléphone */}
          <div className="form-group">
            <label htmlFor="telephone">Téléphone</label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              className="form-control"
              value={formData.telephone}
              onChange={handleChange}
            />
          </div>

          {/* Mot de passe actuel */}
          <div className="form-group">
            <label htmlFor="password">Mot de passe actuel</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-control"
                placeholder="Entrez votre mot de passe actuel"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Nouveau mot de passe */}
          <div className="form-group">
            <label htmlFor="newPassword">Nouveau mot de passe</label>
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                className="form-control"
                placeholder="Nouveau mot de passe"
                value={formData.newPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirmation nouveau mot de passe */}
          <div className="form-group">
            <label htmlFor="confirmNewPassword">Confirmer le mot de passe</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmNewPassword"
                name="confirmNewPassword"
                className="form-control"
                placeholder="Confirmer"
                value={formData.confirmNewPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-save">
            Enregistrer les modifications
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profil;