import { Component } from 'react';

/**
 * Filet de sécurité autour de l'arbre React.
 *
 * Sans lui, une exception de rendu dans une page lazy vide tout l'écran : les
 * routes sont chargées via React.lazy et le seul error boundary existant
 * (<PrivateRoute>) ne couvre que le chargement de session.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erreur de rendu non interceptée:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    const { children } = this.props;

    if (!error) return children;

    return (
      <div className="error-boundary">
        <div className="error-boundary-card">
          <h1 className="error-boundary-title">Une erreur est survenue</h1>
          <p className="error-boundary-text">
            L&apos;application a rencontré un problème inattendu. Vous pouvez
            recharger la page ou revenir à l&apos;accueil.
          </p>
          <pre className="error-boundary-details">{error.message}</pre>
          <div className="error-boundary-actions">
            <button type="button" className="btn btn-primary" onClick={this.handleReload}>
              Recharger la page
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                this.setState({ error: null });
                window.location.href = '/';
              }}
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
