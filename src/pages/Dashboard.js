// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import raceService from '../services/carreraService';
import betService from '../services/apuestaService';

function Dashboard() {
  const { currentUser } = useAuth();
  const [upcomingRaces, setUpcomingRaces] = useState([]);
  const [userBets, setUserBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar carreras próximas
        const racesData = await raceService.getUpcomingRaces();
        setUpcomingRaces(racesData);
        
        // Cargar apuestas del usuario
        const betsData = await betService.getUserBets();
        setUserBets(betsData);
      } catch (err) {
        setError('Error al cargar los datos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Verificar si el usuario ya apostó en una carrera
  const hasUserBet = (raceId) => {
    return userBets.some(bet => bet.raceId === raceId);
  };
  
  // Verificar si aún está a tiempo de apostar (antes de la clasificación)
  const canStillBet = (qualifyingDateTime) => {
    const now = new Date();
    const qualifyingDate = new Date(qualifyingDateTime);
    return now < qualifyingDate;
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="row mb-4">
        <div className="col-md-8">
          <h1 className="mb-0">Bienvenido, {currentUser?.user.username}</h1>
        </div>
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 className="card-title mb-0">Tus puntos</h5>
              </div>
              <div>
                <h2 className="mb-0">{currentUser?.user.points || 0}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mb-5">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h2 className="h5 mb-0">Próximas carreras</h2>
              <Link to="/leaderboard" className="btn btn-outline-primary btn-sm">
                Ver tabla de posiciones
              </Link>
            </div>
            <div className="card-body p-0">
              {upcomingRaces.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Carrera</th>
                        <th>Circuito</th>
                        <th>Fecha</th>
                        <th>Clasificación</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingRaces.map(race => (
                        <tr key={race.id}>
                          <td>{race.name}</td>
                          <td>{race.circuit}</td>
                          <td>
                            {new Date(race.date).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long'
                            })}
                          </td>
                          <td>
                            {new Date(race.qualifyingDateTime).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Link to={`/race/${race.id}`} className="btn btn-sm btn-outline-secondary">
                                Detalles
                              </Link>
                              
                              {canStillBet(race.qualifyingDateTime) ? (
                                hasUserBet(race.id) ? (
                                  <span className="badge bg-success d-flex align-items-center">Ya apostaste</span>
                                ) : (
                                  <Link to={`/bet/${race.id}`} className="btn btn-sm btn-primary">
                                    Apostar
                                  </Link>
                                )
                              ) : (
                                <span className="badge bg-secondary d-flex align-items-center">Cerrado</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="mb-0">No hay carreras próximas programadas</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h2 className="h5 mb-0">Tus apuestas</h2>
            </div>
            <div className="card-body p-0">
              {userBets.length > 0 ? (
                <div className="table-responsive">
                  <table className="table mb-0">
                    <thead>
                      <tr>
                        <th>Carrera</th>
                        <th>Piloto</th>
                        <th>Fecha de apuesta</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userBets.map(bet => (
                        <tr key={bet.id}>
                          <td>{bet.raceName}</td>
                          <td>{bet.driverName}</td>
                          <td>{new Date(bet.createdAt).toLocaleDateString()}</td>
                          <td>
                            {bet.status === 'pending' && (
                              <span className="badge bg-warning text-dark">Pendiente</span>
                            )}
                            {bet.status === 'won' && (
                              <span className="badge bg-success">Ganada (+{bet.pointsEarned})</span>
                            )}
                            {bet.status === 'lost' && (
                              <span className="badge bg-danger">Perdida</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="mb-0">Aún no has realizado ninguna apuesta</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;