import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../../api/apiClient';
import { authApi } from '../../api/authApi';
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import logo from '../../assets/logo_emit.jpg';
import '../../styles/auth.css';

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(Array(6).fill(''));
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmMotDePasse, setConfirmMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const codeRefs = useRef([]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setIsLoading(true);
    try {
      const data = await authApi.forgotPassword(email);
      setSuccess(
        data.message ||
          'Si un compte existe avec cet email, un email de réinitialisation a été envoyé.'
      );
      setError('');
      setStep(2);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Impossible d’envoyer l’email de réinitialisation.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const codeValue = code.join('');
    if (!/^\d{6}$/.test(codeValue)) {
      setError('Le code doit contenir exactement 6 chiffres.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.verifyResetCode(email, codeValue);
      setError('');
      setStep(3);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Code invalide ou expiré.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeCellChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeCellKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      e.preventDefault();
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!digits) return;

    setCode((prev) => {
      const next = [...prev];
      digits.split('').forEach((d, i) => {
        next[i] = d;
      });
      return next;
    });

    if (digits.length < 6) {
      const last = digits.length - 1;
      window.requestAnimationFrame(() => codeRefs.current[last]?.focus());
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (motDePasse.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (motDePasse !== confirmMotDePasse) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authApi.resetPassword(email, code.join(''), motDePasse);
      setSuccess(data.message || 'Mot de passe réinitialisé avec succès.');
      setStep(4);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Impossible de réinitialiser le mot de passe.'));
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToEmail = () => {
    setStep(1);
    setCode(Array(6).fill(''));
    setError('');
    setSuccess('');
  };

  const goBackToCode = () => {
    setStep(2);
    setError('');
  };

  return (
    <div className="auth-mini-page">
      <div className="login-form-card">
        <div className="login-header-section">
          <div className="login-title-wrapper">
            <h2 className="login-page-title">
              {step === 1 && 'Mot de passe oublié'}
              {step === 2 && 'Code de vérification'}
              {step === 3 && 'Nouveau mot de passe'}
              {step === 4 && 'Mot de passe réinitialisé'}
            </h2>
          </div>
          <p className="login-page-subtitle">
            {step === 1 && 'Saisissez votre adresse e-mail pour recevoir un code de réinitialisation.'}
            {step === 2 && 'Entrez le code à 6 chiffres envoyé à votre adresse e-mail.'}
            {step === 3 && 'Choisissez un nouveau mot de passe pour votre compte.'}
            {step === 4 && 'Votre mot de passe a été mis à jour.'}
          </p>
        </div>

        {step === 4 ? (
          <div className="forgot-success">
            <div className="forgot-success-icon">✓</div>
            <p className="forgot-success-text">{success}</p>
            <Link to="/login" className="btn-login forgot-success-link">
              Se connecter
            </Link>
          </div>
        ) : (
          <>
            {step === 1 && success && (
              <div className="alert alert-success">{success}</div>
            )}
            {error && <div className="alert alert-danger">{error}</div>}

            {step === 1 && (
              <form onSubmit={handleSendCode} className="login-form">
                <div className="form-group">
                  <label htmlFor="forgot-email">Adresse e-mail</label>
                  <input
                    type="email"
                    id="forgot-email"
                    className="form-control"
                    placeholder="votre.email@emit.mg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-login" disabled={isLoading}>
                  {isLoading ? (
                    <span className="btn-loader">
                      <span className="spinner"></span> Envoi...
                    </span>
                  ) : (
                    'Envoyer le code de réinitialisation'
                  )}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyCode} className="login-form">
                <div className="form-group">
                  <label htmlFor="forgot-code-0">Code à 6 chiffres</label>
                  <div className="code-input-row">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        id={index === 0 ? 'forgot-code-0' : undefined}
                        ref={(el) => {
                          codeRefs.current[index] = el;
                        }}
                        type="text"
                        className="form-control code-box"
                        inputMode="numeric"
                        autoComplete={index === 0 ? 'one-time-code' : undefined}
                        maxLength={1}
                        value={code[index]}
                        onChange={(e) => handleCodeCellChange(index, e.target.value)}
                        onKeyDown={(e) => handleCodeCellKeyDown(index, e)}
                        onPaste={handleCodePaste}
                        aria-label={`Chiffre ${index + 1} du code`}
                        autoFocus={index === 0}
                        required
                      />
                    ))}
                  </div>
                  <p className="forgot-success-hint code-hint">
                    Le code est valable 15 minutes.
                  </p>
                </div>

                <button type="submit" className="btn-login" disabled={isLoading}>
                  {isLoading ? (
                    <span className="btn-loader">
                      <span className="spinner"></span> Vérification...
                    </span>
                  ) : (
                    'Vérifier le code'
                  )}
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleReset} className="login-form">
                <div className="form-group">
                  <label htmlFor="reset-password">Nouveau mot de passe</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="reset-password"
                      className="form-control"
                      placeholder="Minimum 8 caractères"
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
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

                <div className="form-group">
                  <label htmlFor="reset-confirm">Confirmer le mot de passe</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="reset-confirm"
                      className="form-control"
                      placeholder="Répéter le mot de passe"
                      value={confirmMotDePasse}
                      onChange={(e) => setConfirmMotDePasse(e.target.value)}
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Afficher le mot de passe"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {motDePasse && confirmMotDePasse && motDePasse !== confirmMotDePasse && (
                  <p className="error-text">Les mots de passe ne correspondent pas.</p>
                )}

                <button type="submit" className="btn-login" disabled={isLoading}>
                  {isLoading ? (
                    <span className="btn-loader">
                      <span className="spinner"></span> Réinitialisation...
                    </span>
                  ) : (
                    'Réinitialiser mon mot de passe'
                  )}
                </button>
              </form>
            )}

            <div className="login-divider">
              <span>ou</span>
            </div>

            <div className="login-footer">
              <p>
                {step === 1 ? (
                  <>
                    Vous vous souvenez de votre mot de passe ?{' '}
                    <Link to="/login" className="auth-switch-link">
                      Se connecter
                    </Link>
                  </>
                ) : (
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={step === 2 ? goBackToEmail : goBackToCode}
                  >
                    <FaArrowLeft /> Retour{step === 2 ? ' à l’e-mail' : ' au code'}
                  </button>
                )}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="auth-mini-brand">
        <img src={logo} alt="Logo EMIT" className="auth-mini-logo" />
        <span>EMIT — Fianarantsoa</span>
      </div>
    </div>
  );
}

export default ForgotPassword;