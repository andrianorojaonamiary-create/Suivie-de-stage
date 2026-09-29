import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient, {
  getApiErrorMessage,
  normalizeUser,
  UNAUTHORIZED_EVENT
} from '../api/apiClient';
import { authApi } from '../api/authApi';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data: userData } = await apiClient.get('/auth/me');
        if (!cancelled) setUser(normalizeUser(userData));
      } catch (error) {
        // Un 401 est déjà traité par l'intercepteur : pas de trace à polluer.
        if (error.response?.status !== 401) {
          console.error('Erreur:', error);
        }
        if (!cancelled) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUser();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Token refusé par le serveur : on repart d'un état propre et on renvoie
  // vers /login via le router (l'ancien window.location.href rechargeait la
  // page entière et laissait le contexte désynchronisé).
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      setLoading(false);
      if (window.location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [navigate]);

  const login = useCallback(async (email, password) => {
    try {
      const { accessToken, user: rawUser } = await authApi.login({
        email,
        motDePasse: password
      });

      localStorage.setItem('token', accessToken);
      setToken(accessToken);
      const normalizedUser = normalizeUser(rawUser);
      setUser(normalizedUser);

      toast.success(`Bienvenue ${normalizedUser.prenom} !`);
      return normalizedUser;
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erreur de connexion'));
      throw error;
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const response = await authApi.register({
        ...userData,
        motDePasse: userData.password || userData.motDePasse
      });
      toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      return response?.user || response;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erreur lors de l'inscription"));
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const normalizedUser = await authApi.updateMe(profileData);
      setUser(normalizedUser);
      toast.success('Profil mis à jour avec succès !');
      return normalizedUser;
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erreur de mise à jour du profil'));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    // Le token doit encore être présent pour que la requête parte.
    await authApi.logout(true);
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.info('Déconnecté');
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, updateProfile, logout }),
    [user, loading, login, register, updateProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
