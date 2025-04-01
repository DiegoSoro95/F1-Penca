import express, { json } from 'express';
import cors from 'cors';
import { initializeDatabase } from './config/db.js';
import dotenv from 'dotenv';
import fs from 'fs';
import https from 'https';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Obtener el directorio actual (es necesario al usar módulos ES)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const HTTP_PORT = process.env.HTTP_PORT || 80;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;

// Configuración de certificados SSL
// Asegúrate de que estos archivos existan y tengan las rutas correctas
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certificates', 'privkey.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certificates', 'fullchain.pem'))
};

// Crear servidores HTTP y HTTPS
const httpServer = http.createServer(app);
const httpsServer = https.createServer(sslOptions, app);

// Iniciar servidores
httpServer.listen(HTTP_PORT, () => {
  console.log(`Servidor HTTP corriendo en puerto ${HTTP_PORT}`);
});

httpsServer.listen(HTTPS_PORT, () => {
  console.log(`Servidor HTTPS corriendo en puerto ${HTTPS_PORT}`);
});