import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../api/apiClient';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../../assets/logo_emit.jpg';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ROLE_ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'ROLE_ETUDIANT') navigate('/etudiant/dashboard');
      else if (user.role === 'ROLE_ENSEIGNANT') navigate('/enseignant/dashboard');
      else if (user.role === 'ROLE_ENCADREUR') navigate('/encadreur/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erreur de connexion'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* PANNEAU GAUCHE */}
      <div className="login-left-panel">
        <div className="login-left-content">
          <div className="login-brand">
            <div className="login-logo-box">
              <img src={logo} alt="EMIT" className="login-logo-img" />
            </div>
            <div>
              <div className="login-brand-name">EMIT</div>
              <div className="login-brand-location">Fianarantsoa</div>
            </div>
          </div>
          {/* Le titre a été déplacé à droite selon la demande */}
        </div>
        <div className="login-footer-copyright">
          © {new Date().getFullYear()} EMIT — Fianarantsoa
        </div>
      </div>

      {/* PANNEAU DROITE */}
      <div className="login-right-panel">
        <div className="login-form-card">
          <div className="login-header-section">
            <div className="login-title-wrapper">
              <h2 className="login-page-title">Connexion</h2>
            </div>
            <p className="login-page-subtitle">Accédez à votre espace de suivi des stages</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Adresse e-mail</label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="votre.email@emit.mg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-control"
                  placeholder="Minimum 8 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Afficher le mot de passe"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Se souvenir de moi</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Mot de passe oublié ?
              </Link>
            </div>

            <button type="submit" className="btn-login" disabled={isLoading}>
              {isLoading ? (
                <span className="btn-loader">
                  <span className="spinner"></span> Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>ou</span>
          </div>

          <div className="login-footer">
            <p>
              Vous n'avez pas encore de compte ?{' '}
              <Link to="/register">S'inscrire</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;