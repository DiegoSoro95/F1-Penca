import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import raceService from '../services/carreraService';

function RaceDetails() {
  const { raceId } = useParams();
  const { currentUser } = useAuth();
  const [race, setRace] = useState(null);
  const [results, setResults] = useState([]);
  const [userBet, setUserBet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation after component mount
    setTimeout(() => setAnimate(true), 300);

    const loadData = async () => {
      try {
        // Obtener detalles de la carrera
        const raceData = await raceService.getRaceById(raceId);
        setRace(raceData.data);
        
        // Obtener resultados de la carrera si ya ocurrió
        if (new Date(raceData.data.date) < new Date()) {
          const resultsData = await raceService.fetchRaceResults(raceId);
          setResults(resultsData.data);
        }
        
        // Obtener la apuesta del usuario para esta carrera
        //const betData = await raceService.fetchUserBetForRace(currentUser.id, raceId);
        setUserBet(null);
      } catch (err) {
        setError('Error al cargar los datos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [raceId, currentUser.id]);

  // Función para verificar si todavía se puede apostar
  const canStillBet = (race) => {
    if (!race) return false;
    const now = new Date();
    const qualifyingDate = new Date(race.qualifying_datetime);
    return now < qualifyingDate;
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Get country code from circuit nationality for flag
  const getCountryCode = (nationality) => {
    const countryMap = {
      'Australia': 'au', 'Austria': 'at', 'Azerbaijan': 'az', 'Bahrain': 'bh',
      'Belgium': 'be', 'Brazil': 'br', 'UK': 'gb', 'Canada': 'ca', 'China': 'cn',
      'Netherlands': 'nl', 'UAE': 'ae', 'French': 'fr', 'Hungary': 'hu',
      'Italy': 'it', 'Japan': 'jp', 'Mexico': 'mx', 'Monaco': 'mc',
      'Portuguese': 'pt', 'Qatar': 'qa', 'Saudi Arabia': 'sa', 'Singapore': 'sg',
      'Spain': 'es', 'US': 'us', 'USA': 'us', 'American': 'us'
    };
    
    // Default to the first two letters of nationality if no mapping exists
    return countryMap[nationality] || nationality.slice(0, 2).toLowerCase();
  };

  if (loading) {
    return (
      <div className="f1-home-container text-white text-center py-5">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando detalles de la carrera...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="f1-home-container text-white py-5">
        <div className="container">
          <div className="alert alert-danger text-center" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="f1-home-container text-white py-5">
        <div className="container">
          <div className="alert alert-warning text-center" role="alert">
            Carrera no encontrada
          </div>
        </div>
      </div>
    );
  }

  const raceDate = new Date(race.date);
  const isPastRace = raceDate < new Date();
  const isUpcoming = !isPastRace;

  return (
    <div className="f1-home-container">
      {/* Racing Stripes */}
      <div className="racing-stripe-red"></div>
      <div className="racing-stripe-white"></div>

      <div className="container py-5">
        {/* Race Header */}
        <div className={`row align-items-center mb-5 ${animate ? 'slide-in-left' : ''}`}>
          <div className="col-lg-8">
            <div className="mb-4">
              <span className="badge bg-danger me-2">TEMPORADA 2025</span>
              <span className="badge bg-light text-dark">DETALLES DE LA CARRERA</span>
            </div>
            <h1 className="display-4 fw-bold text-gradient mb-3">{race.name}</h1>
            <div className="race-flag-large mb-3" 
                 style={{ 
                   backgroundImage: `url('https://flagcdn.com/w320/${getCountryCode(race.country)}.png')`,
                   width: '100px', 
                   height: '60px', 
                   backgroundSize: 'cover',
                   backgroundPosition: 'center',
                   borderRadius: '4px'
                 }}
                 title={race.country}
            ></div>
          </div>
          <div className="col-lg-4 text-end">
            <div className={`race-card ${animate ? 'slide-in-right' : ''}`}>
              <div className="race-date">
                {formatDate(race.date)}
              </div>
              <h3 className="race-title">{race.circuit}</h3>
              <p className="race-location">{race.circuit_location || 'Ubicación no disponible'}</p>
            </div>
          </div>
        </div>

        {/* Race Details Section */}
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="race-details-card">
              <h2 className="mb-4 text-gradient">Información de la Carrera</h2>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <strong>Fecha de Carrera:</strong>
                  <p>{formatDate(race.date)}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Clasificación:</strong>
                  <p>{formatDate(race.qualifying_datetime)}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Número de Vueltas:</strong>
                  <p>{race.laps || 'No disponible'}</p>
                </div>
                <div className="col-12">
                  <p>{race.description}</p>
                </div>
              </div>
            </div>

            {/* Race Results (if past race) */}
            {isPastRace && results.length > 0 && (
              <div className="race-results-card mt-4">
                <h2 className="mb-4 text-gradient">Resultados de la Carrera</h2>
                <div className="table-responsive">
                  <table className="table table-dark table-striped">
                    <thead>
                      <tr>
                        <th>Posición</th>
                        <th>Piloto</th>
                        <th>Equipo</th>
                        <th>Tiempo</th>
                        <th>Puntos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result) => (
                        <tr key={result.id} 
                            className={result.driver_id === (userBet?.driver_id) ? 'table-primary' : ''}>
                          <td>{result.position}</td>
                          <td>
                            {result.driver_name}
                            {result.position === 1 && <span className="badge bg-warning text-dark ms-2">Ganador</span>}
                            {result.driver_id === (userBet?.driver_id) && <span className="badge bg-info ms-2">Tu apuesta</span>}
                          </td>
                          <td>{result.team}</td>
                          <td>{result.time || 'N/A'}</td>
                          <td>{result.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Betting Section */}
          <div className="col-lg-4">
            <div className="betting-card">
              {isUpcoming && (
                <>
                  <div className="mb-3 text-center">
                    <span className={`badge ${canStillBet(race) ? 'bg-success' : 'bg-danger'} p-2 fs-6`}>
                      {canStillBet(race) ? "Apuestas abiertas" : "Apuestas cerradas"}
                    </span>
                  </div>
                  {userBet ? (
                    <div className="user-bet-card">
                      <h3 className="mb-3">Tu apuesta</h3>
                      <p>Has apostado por: <strong>{userBet.driver_name}</strong></p>
                    </div>
                  ) : canStillBet(race) ? (
                    <Link to={`/bet/${race.id}`} className="btn btn-danger w-100">
                      Realizar apuesta
                    </Link>
                  ) : (
                    <div className="alert alert-warning text-center">
                      No realizaste ninguna apuesta para esta carrera
                    </div>
                  )}
                </>
              )}
              {isPastRace && (
                <div className="past-race-results">
                  <span className="badge bg-secondary p-2 fs-6 mb-3">
                    Carrera finalizada
                  </span>
                  
                  {userBet && (
                    <div className={`user-bet-result ${userBet.status === 'won' ? 'border-success' : userBet.status === 'lost' ? 'border-danger' : ''}`}>
                      <h3 className="mb-3">Tu apuesta</h3>
                      <p>Apostaste por: <strong>{userBet.driver_name}</strong></p>
                      {userBet.status === 'won' && (
                        <span className="badge bg-success">Ganaste +{userBet.points_earned} puntos</span>
                      )}
                      {userBet.status === 'lost' && (
                        <span className="badge bg-danger">Perdiste</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="d-flex justify-content-between mt-4">
          <Link to="/dashboard" className="btn btn-outline-light">
            <i className="bi bi-arrow-left me-2"></i>Volver al Dashboard
          </Link>
          {isUpcoming && !userBet && canStillBet(race) && (
            <Link to={`/bet/${race.id}`} className="btn btn-danger">
              Realizar apuesta<i className="bi bi-arrow-right ms-2"></i>
            </Link>
          )}
        </div>
      </div>

      {/* Inline Styles from Home Component */}
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

        .racing-stripe-red {
          position: absolute;
          width: 100%;
          height: 20px;
          background-color: #e10600;
          top: 0;
          transform: skewY(-2deg);
          z-index: 1;
        }

        .racing-stripe-white {
          position: absolute;
          width: 100%;
          height: 10px;
          background-color: white;
          top: 25px;
          transform: skewY(-2deg);
          z-index: 1;
        }

        .slide-in-left {
          animation: slideInLeft 0.8s ease forwards;
        }

        .slide-in-right {
          animation: slideInRight 0.8s ease forwards;
        }

        @keyframes slideInLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideInRight {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .race-card {
          background-color: #1e1e1e;
          border-radius: 10px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          border-bottom: 4px solid #e10600;
          transition: transform 0.3s ease;
        }

        .race-details-card, .race-results-card, .betting-card {
          background-color: #1e1e1e;
          border-radius: 10px;
          padding: 2rem;
          margin-bottom: 1rem;
        }

        .user-bet-card, .past-race-results {
          background-color: #2a2a2a;
          border-radius: 10px;
          padding: 1.5rem;
          text-align: center;
        }

        .table-dark {
          --bs-table-bg: #1e1e1e;
          --bs-table-striped-bg: #2a2a2a;
        }
      `}</style>
    </div>
  );
}

export default RaceDetails;