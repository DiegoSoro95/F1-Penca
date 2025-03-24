import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:5000/api/bets';

// Crear apuesta
const createBet = async (betData) => {
  const response = await axios.post(API_URL, betData, {
    headers: authService.authHeader()
  });
  return response.data;
};

// Obtener apuestas del usuario
const getUserBets = async () => {
  const response = await axios.get(`${API_URL}/user`, {
    headers: authService.authHeader()
  });
  return response.data;
};

const betService = {
  createBet,
  getUserBets
};

export default betService;