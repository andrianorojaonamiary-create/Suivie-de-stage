import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import logo from '../../assets/logo_emit.jpg';
import '../../styles/auth.css';
import '../../styles/auth-transition.css';

/**
 * AuthLayout — Conteneur unifié Login / Register avec animation de bascule horizontale.
 *
 * Architecture visuelle :
 * ┌─────────────────────────────────────────────────────────────┐
 * │  Conteneur : overflow:hidden, display:flex                  │
 * │                                                             │
 * │  Login   : [PANNEAU BLEU    │ FORMULAIRE LOGIN ]            │
 * │  Register: [FORMULAIRE REG  │ PANNEAU BLEU    ]             │
 * └─────────────────────────────────────────────────────────────┘
 *
 * L'animation utilise CSS keyframes pour glisser le panneau bleu
 * et faire apparaître le formulaire (translateX + opacity + scale).
 */
function AuthLayout({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const lockRef = useRef(false);

  const switchTo = useCallback((targetMode) => {
    if (lockRef.current || mode === targetMode) return;
    lockRef.current = true;
    setIsAnimating(true);

    // Changer l'URL (replace pour ne pas empiler l'historique)
    navigate(targetMode === 'login' ? '/login' : '/register', { replace: true });

    // Le changement de classe CSS déclenche immédiatement le keyframe
    setMode(targetMode);

    // Déverrouilage après la durée de l'animation (650ms)
    setTimeout(() => {
      setIsAnimating(false);
      lockRef.current = false;
    }, 700);
  }, [mode, navigate]);

  const isRegister = mode === 'register';

  return (
    <div
      className={[
        'auth-layout-container',
        isRegister ? 'auth-layout--register' : 'auth-layout--login',
      ].join(' ')}
      aria-busy={isAnimating}
    >
      {/* ─── PANNEAU BLEU ───────────────────────────────────────── */}
      <div className="auth-blue-panel">
        <div className="auth-blue-content">
          {/* Marque EMIT */}
          <div className="auth-brand">
            <div className="auth-logo-box">
              <img src={logo} alt="Logo EMIT" className="auth-logo-img" />
            </div>
            <div>
              <div className="auth-brand-name">EMIT</div>
              <div className="auth-brand-location">Fianarantsoa</div>
            </div>
          </div>

          {/* Corps du panneau */}
          {isRegister ? (
            <div className="auth-panel-body">
              <h2 className="auth-panel-title">Créer un compte</h2>
              <p className="auth-panel-subtitle">
                Rejoignez la plateforme de suivi des stages EMIT.
              </p>
              {/* Indicateur d'étapes du formulaire — optionnel, affiché si register */}
              <div className="auth-panel-register-hint">
                <div className="auth-hint-item">
                  <span className="auth-hint-num">1</span>
                  <span>Choisissez votre rôle</span>
                </div>
                <div className="auth-hint-item">
                  <span className="auth-hint-num">2</span>
                  <span>Renseignez vos informations</span>
                </div>
                <div className="auth-hint-item">
                  <span className="auth-hint-num">3</span>
                  <span>Confirmez et créez votre compte</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-panel-body">
              <h2 className="auth-panel-title">
                Bienvenue sur<br />la plateforme
              </h2>
              <p className="auth-panel-subtitle">
                Système de suivi de stages<br />EMIT Fianarantsoa
              </p>
              <ul className="auth-panel-features">
                <li>
                  <span className="auth-feature-dot" />
                  Suivi en temps réel de vos stages
                </li>
                <li>
                  <span className="auth-feature-dot" />
                  Rapports et évaluations centralisés
                </li>
                <li>
                  <span className="auth-feature-dot" />
                  Communication encadreur / étudiant
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="auth-panel-copyright">
          © {new Date().getFullYear()} EMIT — Fianarantsoa
        </div>
      </div>

      {/* ─── PANNEAU FORMULAIRE ─────────────────────────────────── */}
      <div className="auth-form-panel">
        {mode === 'login' ? (
          <LoginForm onSwitchToRegister={() => switchTo('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => switchTo('login')} />
        )}
      </div>
    </div>
  );
}

export default AuthLayout;
