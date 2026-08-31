import { useEffect, useState } from 'react';
import { FaBriefcase, FaBuilding, FaEnvelope, FaPhone, FaSave, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import apiClient, { getApiErrorMessage } from '../../api/apiClient';
import { useAuth } from '../../hooks/useAuth';

const emptyProfile = { nom: '', prenom: '', email: '', telephone: '', fonction: '', specialite: '' };

function EncadreurProfil() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const [{ data: currentUser }, { data: supervisor }] = await Promise.all([
          apiClient.get('/auth/me'),
          apiClient.get('/supervisors/me'),
        ]);
        setProfile({
          nom: currentUser.nom || '',
          prenom: currentUser.prenom || '',
          email: currentUser.email || '',
          telephone: supervisor.telephone || '',
          fonction: supervisor.fonction || '',
          specialite: supervisor.specialite || '',
        });
        setError('');
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Impossible de charger votre profil encadreur.'));
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'ROLE_ENCADREUR') void loadProfile();
  }, [user]);

  const update = (event) => setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const { data: supervisor } = await apiClient.get('/supervisors/me');
      await Promise.all([
        apiClient.patch('/auth/me', { nom: profile.nom, prenom: profile.prenom, email: profile.email }),
        apiClient.patch(`/supervisors/${supervisor.id}`, { telephone: profile.telephone || null, fonction: profile.fonction, specialite: profile.specialite }),
      ]);
      toast.success('Profil encadreur mis à jour.');
      setError('');
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, 'Impossible de mettre à jour votre profil.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="profil-page-container"><div className="empty-state"><p>Chargement du profil…</p></div></div>;

  return <div className="profil-page-container">
    <div className="profil-header"><h2>Mon profil encadreur</h2><p className="text-muted">Gérez vos informations de contact et de suivi.</p></div>
    {error && <div className="alert alert-danger">{error}</div>}
    <form className="profil-card" onSubmit={save}>
      <div className="profil-avatar-section"><div className="profil-avatar" style={{ backgroundColor: '#4A90D9' }}><FaBriefcase /></div><div className="profil-avatar-info"><span className="profil-name">{profile.prenom} {profile.nom}</span><span className="profil-role-badge" style={{ backgroundColor: '#F5F8FC', color: '#4A90D9' }}>Encadreur</span></div></div>
      <div className="profil-form-container"><div className="profil-form-grid">
        <label className="profil-form-group"><span><FaUser /> Nom</span><input className="profil-input" name="nom" value={profile.nom} onChange={update} minLength="2" maxLength="100" required /></label>
        <label className="profil-form-group"><span><FaUser /> Prénom</span><input className="profil-input" name="prenom" value={profile.prenom} onChange={update} minLength="2" maxLength="100" required /></label>
        <label className="profil-form-group full-width"><span><FaEnvelope /> E-mail</span><input className="profil-input" name="email" type="email" value={profile.email} onChange={update} required /></label>
        <label className="profil-form-group"><span><FaPhone /> Téléphone</span><input className="profil-input" name="telephone" type="tel" value={profile.telephone} onChange={update} maxLength="30" /></label>
        <label className="profil-form-group"><span><FaBriefcase /> Fonction</span><input className="profil-input" name="fonction" value={profile.fonction} onChange={update} minLength="2" maxLength="150" required /></label>
        <label className="profil-form-group full-width"><span><FaBuilding /> Spécialité</span><input className="profil-input" name="specialite" value={profile.specialite} onChange={update} minLength="2" maxLength="150" required /></label>
      </div><button className="profil-save-btn" type="submit" disabled={saving}><FaSave /> {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}</button></div>
    </form>
  </div>;
}

export default EncadreurProfil;
