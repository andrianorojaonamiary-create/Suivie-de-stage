import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../api/apiClient';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

/**
 * LoginForm — Formulaire de connexion seul (sans panneau bleu).
 * Reçoit `onSwitchToRegister` pour déclencher l'animation de bascule.
 */
function LoginForm({ onSwitchToRegister }) {
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
          <label htmlFor="login-email">Adresse e-mail</label>
          <input
            type="email"
            id="login-email"
            className="form-control"
            placeholder="votre.email@emit.mg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Mot de passe</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="login-password"
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
            <input type="checkbox" id="remember-me" />
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
          Vous n&apos;avez pas encore de compte ?{' '}
          <button
            type="button"
            className="auth-switch-link"
            onClick={onSwitchToRegister}
            id="switch-to-register-btn"
          >
            S&apos;inscrire
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
