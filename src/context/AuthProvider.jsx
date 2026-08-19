import { createContext, useState, useEffect } from 'react';
import { mockApi } from '../api/mockApi';
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
        const userData = await mockApi.getProfile(token);
        setUser(userData);
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
      const response = await mockApi.login(email, password);
      const { token, user } = response;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      toast.success(`Bienvenue ${user.prenom} !`);
      return user;
    } catch (error) {
      toast.error(error.message || 'Erreur de connexion');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await mockApi.register(userData);
      toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      return response.user;
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'inscription");
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