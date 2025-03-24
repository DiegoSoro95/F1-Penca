import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Registrar usuario
const register = async (username, email, password) => {

  const userData = { username, email, password };
  const response = await axios.post(`${API_URL}/register`, userData);
  
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// Login de usuario
const login = async (email, password) => {
  const userData = { email, password };
  const response = await axios.post(`${API_URL}/login`, userData);
  
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

const updatePassword = async (currentPassword, newPassword) => {
  const response = await axios.post(`${API_URL}/updatePassword`, 
    { 
      currentPassword, 
      newPassword 
    },{ 
      headers: authService.authHeader() 
    });
  
  return response.data;
};

// Cerrar sesión
const logout = () => {
  localStorage.removeItem('user');
};

// Obtener usuario actual del almacenamiento local
const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

// Configurar token para las solicitudes
const authHeader = () => {
  const user = getCurrentUser();
  
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  } else {
    return {};
  }
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  authHeader,
  updatePassword
};

export default authService;