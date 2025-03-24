import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario en localStorage al cargar
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    setLoading(false);

    // Añadir listener para sincronizar logout entre pestañas
    const handleStorageChange = (event) => {
      if (event.key === 'logout') {
        // Realizar logout local cuando se detecta el evento
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Limpiar listener al desmontar
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const userData = await authService.login(email, password);
      setCurrentUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const userData = await authService.register(username, email, password);
      setCurrentUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authService.updatePassword(currentPassword, newPassword);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar contraseña:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    // Eliminar usuario del localStorage
    localStorage.removeItem('user');
    
    // Disparar evento de logout para otras pestañas
    localStorage.setItem('logout', Date.now().toString());
    
    // Actualizar estado local
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    login,
    register,
    logout,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}