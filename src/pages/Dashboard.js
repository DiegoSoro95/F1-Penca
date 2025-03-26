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
        const racesData = await raceService.getUpcomingRaces();
        setUpcomingRaces(racesData);
        
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

  const hasUserBet = (raceId) => {
    if (!Array.isArray(userBets)) {
      return false;
    }
    return userBets.some(bet => bet.raceId === raceId);
  };
  
  const canStillBet = (qualifyingDateTime) => {
    const now = new Date();
    const qualifyingDate = new Date(qualifyingDateTime);
    return now < qualifyingDate;
  };

  const formatBettingDeadline = (deadline) => {
    const date = new Date(deadline);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).toUpperCase();
  };

  if (loading) {
    return (
      <div className="f1-home-container text-center py-5">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3 text-white">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="f1-home-container text-white py-5">
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="container">
        <div className="row mb-4">
          <div className="col-md-8">
            <h1 className="mb-0 text-gradient">Bienvenido, {currentUser?.user.username}</h1>
          </div>
          <div className="col-md-4">
            <div className="card bg-gradient" style={{ background: 'linear-gradient(135deg, #e10600, #990000)' }}>
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title mb-0 text-white">Tus puntos</h5>
                </div>
                <div>
                  <h2 className="mb-0 text-white">{currentUser?.user.points || 0}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="row mb-5">
          <div className="col-12">
            <div className="card" style={{ 
              backgroundColor: '#1e1e1e', 
              border: 'none', 
              borderLeft: '4px solid #e10600' 
            }}>
              <div className="card-header bg-dark d-flex justify-content-between align-items-center">
                <h2 className="h5 mb-0 text-white">Calendario de Carreras</h2>
                <Link to="/leaderboard" className="btn btn-outline-danger btn-sm">
                  Ver tabla de posiciones
                </Link>
              </div>
              <div className="card-body p-4">
                <div className="race-calendar d-flex flex-wrap justify-content-center gap-4">
                  {upcomingRaces.count > 0 ? (
                    upcomingRaces.data.map(race => (
                      <div 
                        key={race.id} 
                        className="race-card position-relative shadow-lg" 
                        style={{
                          width: '250px', 
                          height: '380px', 
                          backgroundColor: '#1e1e1e',
                          color: 'white',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          transition: 'transform 0.3s ease',
                          border: '1px solid rgba(225, 6, 0, 0.2)',
                          borderBottom: '4px solid #e10600'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <div className="race-details h-100 d-flex flex-column">
                          <div className="text-center p-3">
                            <div 
                              className={`race-flag mb-2 mx-auto ${race.country.toLowerCase().replace(/\s/g, '-')}`}
                              style={{
                                width: '40px',
                                height: '30px',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: '4px'
                              }}
                            ></div>
                            <h5 className="mb-1">{race.circuit}</h5>
                            <p className="mb-2 text-white">
                              {new Date(race.date).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long'
                              })}
                            </p>
                          </div>
                          
                          <div className="flex-grow-1 d-flex justify-content-center align-items-center">
                            <img 
                              src={`/imagenes/${race.country.toLowerCase().replace(/\s/g, '-')}-map.png`} 
                              alt={`Mapa de ${race.circuit}`} 
                              className="img-fluid"
                              style={{
                                maxWidth: '80%',
                                maxHeight: '150px',
                                objectFit: 'contain',
                                filter: 'grayscale(30%) brightness(80%)'
                              }}
                            />
                          </div>
                          
                          <div className="p-3 text-center">
                            {canStillBet(race.first_practice) ? (
                              <>
                                <small className="d-block mb-2 text-white">
                                  Límite de apuesta: {formatBettingDeadline(race.first_practice)}
                                </small>
                                {hasUserBet(race.id) ? (
                                  <span className="badge bg-success">Ya apostaste</span>
                                ) : (
                                  <Link 
                                    to={`/race/${race.id}`} 
                                    className="btn btn-danger w-100"
                                  >
                                    Ver Circuito
                                  </Link>
                                )}
                              </>
                            ) : (
                              <Link 
                                  to={`/race/${race.id}`} 
                                  className="btn btn-danger w-100"
                                >
                                  Ver Circuito
                                </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center w-100">
                      <p className="mb-0">No hay carreras próximas programadas</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-12">
            <div className="card" style={{ 
              backgroundColor: '#1e1e1e', 
              border: 'none', 
              borderLeft: '4px solid #e10600' 
            }}>
              <div className="card-header bg-dark">
                <h2 className="h5 mb-0 text-white">Tus apuestas</h2>
              </div>
              <div className="card-body p-0">
                {userBets.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-dark mb-0" style={{ backgroundColor: '#1e1e1e' }}>
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

      {/* Add the same CSS styles as in the Home component */}
      <style jsx>{`
        .f1-home-container {
          background-color: #121212;
          color: white;
          position: relative;
          overflow-x: hidden;
        }
        
        .text-gradient {
          background: linear-gradient(90deg, #ff0000, #ff6b6b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }

        .race-card:hover {
          box-shadow: 0 10px 25px rgba(225, 6, 0, 0.2) !important;
        }
        
        /* Add flag classes from Home component */
        .race-flag.au { background-image: url('https://flagcdn.com/w40/au.png'); }
        .race-flag.jp { background-image: url('https://flagcdn.com/w40/jp.png'); }
        .race-flag.cn { background-image: url('https://flagcdn.com/w40/cn.png'); }
        .race-flag.it { background-image: url('https://flagcdn.com/w40/it.png'); }
        .race-flag.us { background-image: url('https://flagcdn.com/w40/us.png'); }
        .race-flag.mx { background-image: url('https://flagcdn.com/w40/mx.png'); }
        .race-flag.br { background-image: url('https://flagcdn.com/w40/br.png'); }
        .race-flag.ae { background-image: url('https://flagcdn.com/w40/ae.png'); }
        .race-flag.sa { background-image: url('https://flagcdn.com/w40/sa.png'); }
        .race-flag.bh { background-image: url('https://flagcdn.com/w40/bh.png'); }
        .race-flag.ca { background-image: url('https://flagcdn.com/w40/ca.png'); }
        .race-flag.es { background-image: url('https://flagcdn.com/w40/es.png'); }
        .race-flag.mc { background-image: url('https://flagcdn.com/w40/mc.png'); }
        .race-flag.nl { background-image: url('https://flagcdn.com/w40/nl.png'); }
        .race-flag.at { background-image: url('https://flagcdn.com/w40/at.png'); }
        .race-flag.gb { background-image: url('https://flagcdn.com/w40/gb.png'); }
        .race-flag.hu { background-image: url('https://flagcdn.com/w40/hu.png'); }
        .race-flag.be { background-image: url('https://flagcdn.com/w40/be.png'); }
        .race-flag.sg { background-image: url('https://flagcdn.com/w40/sg.png'); }
        .race-flag.az { background-image: url('https://flagcdn.com/w40/az.png'); }
        .race-flag.qa { background-image: url('https://flagcdn.com/w40/qa.png'); }
      `}</style>
    </div>
  );
}

export default Dashboard;