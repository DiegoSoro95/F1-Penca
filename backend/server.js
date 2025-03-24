import express, { json } from 'express';
import cors from 'cors';
import { initializeDatabase } from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import raceRoutes from './routes/carreraRoutes.js';
import betRoutes from './routes/apuestaRoutes.js';

// Inicializar la app
const app = express();

// Inicializar la base de datos
initializeDatabase();

// Middleware
app.use(cors());
app.use(json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/races', raceRoutes);
app.use('/api/bets', betRoutes);

// Ruta de inicio
app.get('/', (_req, res) => {
  res.send('API de F1 Penca funcionando');
});

// Puerto
const PORT = process.env.PORT || 5000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});