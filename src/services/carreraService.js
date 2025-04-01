import axios from 'axios';
import authService from './authService';

const API_URL = 'http://f1-penca.ddns.net:5000/api/races';

// Obtener carreras próximas
const getUpcomingRaces = async () => {
  const response = await axios.get(`${API_URL}/upcoming`, { 
    headers: authService.authHeader() 
  });
  return response.data;
};

// Obtener carrera por ID
const getRaceById = async (raceId) => {
  const response = await axios.get(`${API_URL}/${raceId}`, { 
    headers: authService.authHeader() 
  });
  return response.data;
};


const fetchRaceResults = async (raceId) => {
  const response = await axios.get(`${API_URL}/results/${raceId}`, { 
    headers: authService.authHeader() 
  });
  return response.data;
};

const fetchUserBetForRace = async (raceId) => {
  const response = await axios.get(`${API_URL}/${raceId}`, { 
    headers: authService.authHeader() 
  });
  return response.data;
};


const raceService = {
  getUpcomingRaces,
  getRaceById,
  fetchRaceResults,
  fetchUserBetForRace
};

export default raceService;