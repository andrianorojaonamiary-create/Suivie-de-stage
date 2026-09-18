import { createContext, useState, useEffect } from 'react';
import apiClient, { getApiErrorMessage, normalizeUser } from '../api/apiClient';
import { toast } from 'react-toastify';

// Création du contexte (à l'intérieur du fichier)
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data: userData } = await apiClient.get('/auth/me');
        setUser(normalizeUser(userData));
      } catch (error) {
        console.error('Erreur:', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        motDePasse: password
      });
      const { accessToken, user } = response.data;
      
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
      const normalizedUser = normalizeUser(user);
      setUser(normalizedUser);
      
      toast.success(`Bienvenue ${normalizedUser.prenom} !`);
      return normalizedUser;
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erreur de connexion'));
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const payload = {
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        motDePasse: userData.password || userData.motDePasse,
        role: userData.role,
        ...(userData.matricule && { matricule: userData.matricule }),
        ...(userData.niveau && { niveau: userData.niveau }),
        ...(userData.formation && { formation: userData.formation }),
        ...(userData.promotion && { promotion: userData.promotion }),
        ...(userData.grade && { grade: userData.grade }),
        ...(userData.departement && { departement: userData.departement }),
        ...(userData.specialite && { specialite: userData.specialite }),
        ...(userData.entreprise && { entreprise: userData.entreprise }),
        ...(userData.fonction && { fonction: userData.fonction }),
        ...(userData.telephone && { telephone: userData.telephone }),
        ...(userData.adresse && { adresse: userData.adresse }),
      };

      const response = await apiClient.post('/auth/register', payload);
      const { accessToken, user } = response.data;

      localStorage.setItem('token', accessToken);
      setToken(accessToken);
      const normalizedUser = normalizeUser(user);
      setUser(normalizedUser);

      toast.success(`Bienvenue ${normalizedUser.prenom} !`);
      return normalizedUser;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erreur lors de l'inscription"));
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await apiClient.patch('/auth/me', profileData);
      const normalizedUser = normalizeUser(data);
      setUser(normalizedUser);
      toast.success('Profil mis à jour avec succès !');
      return normalizedUser;
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erreur de mise à jour du profil'));
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await apiClient.get('/auth/me');
      const normalizedUser = normalizeUser(data);
      setUser(normalizedUser);
      return normalizedUser;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du profil:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.info('Déconnecté');
  };

  const value = {
    user,
    loading,
    login,
    register,
    updateProfile,
    refreshUser,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Exporter le contexte pour qu'il soit accessible par le hook
export { AuthContext };