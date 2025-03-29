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
  const [activeTab, setActiveTab] = useState('race'); // 'race', 'sprint', 'qualify', 'sprint_qualify'

  // Function to get circuit image URL
  const getCircuitImage = (circuitName) => {
    const translations = {
      'Gran Premio de Australia':'Australian_Grand_Prix',
      'Gran Premio de Baréin':'Bahrain_Grand_Prix' ,
      'Gran Premio de Arabia Saudita':'Saudi_Arabian_Grand_Prix',
      'Gran Premio de Japón':'Japanese_Grand_Prix',
      'Gran Premio de China':'Chinese_Grand_Prix',
      'Gran Premio de Miami':'Miami_Grand_Prix' ,
      'Gran Premio de Emilia Romaña':'Emilia_Romagna_Grand_Prix',
      'Gran Premio de Mónaco':'Monaco_Grand_Prix',
      'Gran Premio de Canadá':'Canadian_Grand_Prix' ,
      'Gran Premio de España':'Spanish_Grand_Prix',
      'Gran Premio de Austria':'Austrian_Grand_Prix',
      'Gran Premio de Gran Bretaña':'British_Grand_Prix' ,
      'Gran Premio de Hungría':'Hungarian_Grand_Prix',
      'Gran Premio de Bélgica':'Belgian_Grand_Prix',
      'Gran Premio de los Países Bajos':'Dutch_Grand_Prix',
      'Gran Premio de Italia':'Italian_Grand_Prix',
      'Gran Premio de Azerbaiyán':'Azerbaijan_Grand_Prix',
      'Gran Premio de Singapur':'Singapore_Grand_Prix',
      'Gran Premio de Estados Unidos':'United_States_Grand_Prix',
      'Gran Premio de la Ciudad de México':'Mexico_City_Grand_Prix',
      'Gran Premio de São Paulo':'São_Paulo_Grand_Prix',
      'Gran Premio de Las Vegas':'Las_Vegas_Grand_Prix',
      'Gran Premio de Catar':'Qatar_Grand_Prix',
      'Gran Premio de Abu Dhabi':'Abu_Dhabi_Grand_Prix'
    };

    const normalizedName = translations[circuitName] || circuitName;

    console.log(normalizedName);
    // Generate the image URL
    return `https://media.formula1.com/content/dam/fom-website/races/2025/${normalizedName}.png`;
  };

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
    const qualifyingDate = new Date(race.first_practice);
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

  // Verificar si hay resultados de diferentes tipos
  const hasSprintResults = results?.sprint_race && results.sprint_race.length > 0;
  const hasQualifyResults = results?.qualify_result && results.qualify_result.length > 0;

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
        <div className={`row align-items-end mb-5 ${animate ? 'slide-in-left' : ''}`}>
          {/* Columna Izquierda */}
          <div className="col-lg-8 d-flex flex-column alineacion">
            <div className="mb-4">
              <span className="badge bg-danger me-2">TEMPORADA 2025</span>
              <span className="badge bg-light text-dark">DETALLES DE LA CARRERA</span>
            </div>
            <div className="d-flex align-items-center mb-1">
              <h1 className="fw-bold text-gradient mb-0 me-3" 
                  style={{ 
                    fontSize: "calc(1.5rem + 1.5vw)", // Tamaño más pequeño que display-4
                    lineHeight: "1.2",
                    wordBreak: "break-word", // Permite romper palabras muy largas si es necesario
                    hyphens: "auto"
                  }}>
                {race.name}
              </h1>
              <div className="race-flag"
                style={{
                  backgroundImage: `url('https://flagcdn.com/w320/${getCountryCode(race.country)}.png')`,
                  width: '60px',
                  height: '36px',
                  flexShrink: "0", // Evita que la bandera se encoja
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
                title={race.country}
              ></div>
            </div>
            <div className="race-details-card d-flex flex-column flex-grow-1 p-3">
              <h2 className="mb-4 text-gradient">Información de la Carrera</h2>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <strong>Fecha de Carrera:</strong>
                  <p>{formatDate(race.date)}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Clasificación:</strong>
                  <p>{formatDate(race.qualifying)}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Número de Vueltas:</strong>
                  <p>{race.laps || 'No disponible'}</p>
                </div>
                {/* Contenido que se empuja hacia abajo */}
                <div className="col-12 mt-auto">
                  <p>{race.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="col-lg-4 d-flex flex-column h-100">
            <div className={`race-card d-flex flex-column flex-grow-1 p-3 ${animate ? 'slide-in-right' : ''}`}>
              <div className="circuit-image-container mb-3">
                <img 
                  src={getCircuitImage(race.name)} 
                  alt={race.circuit} 
                  className="img-fluid circuit-image" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/300x200?text=No+Disponible';
                  }}
                />
              </div>
              <div className="race-date">{formatDate(race.date)}</div>
              <h3 className="race-title">{race.circuit}</h3>
              {/* Contenido empujado hacia abajo */}
              <p className="race-location mt-auto">{race.circuit_location || 'Ubicación no disponible'}</p>
            </div>
          </div>
        </div>

        {/* Race Details Section */}
        <div className="row g-4">
          <div className="col-lg-8">
            {/* Race Results (if past race) */}
            {isPastRace && (
              results.races?.length > 0 || 
              hasSprintResults || 
              hasQualifyResults
            ) && (
              <div className="race-results-card">
                <h2 className="mb-4 text-gradient">Resultados</h2>
                
                {/* Tabs para elegir entre los diferentes tipos de resultados */}
                <ul className="nav nav-tabs custom-tabs mb-4">                  
                  {hasSprintResults && (
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === 'sprint' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sprint')}
                      >
                        <i className="bi bi-lightning-fill me-2"></i>
                        Sprint
                      </button>
                    </li>
                  )}
                  
                  {hasQualifyResults && (
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === 'qualify' ? 'active' : ''}`}
                        onClick={() => setActiveTab('qualify')}
                      >
                        <i className="bi bi-stopwatch me-2"></i>
                        Clasificación
                      </button>
                    </li>
                  )}
                  
                  {results.races && results.races.length > 0 && (
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === 'race' ? 'active' : ''}`}
                        onClick={() => setActiveTab('race')}
                      >
                        <i className="bi bi-flag-fill me-2"></i>
                        Carrera Principal
                      </button>
                    </li>
                  )}
                </ul>
                
                {/* Resultados de la sprint race */}
                {activeTab === 'sprint' && hasSprintResults && (
                  <div className="results-container">
                    <div className="sprint-header mb-3">
                      <h5 className="text-white-50">
                        <i className="bi bi-lightning-fill text-warning me-2"></i>
                        Sprint Race - {formatDate(race.sprint || race.date)}
                      </h5>
                    </div>
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
                          {results.sprint_race.map((result) => (
                            <tr key={`sprint-${result.id}`}>
                              <td>{result.position}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  {result.image && (
                                    <img 
                                      src={result.image} 
                                      alt={result.name} 
                                      className="driver-image me-3" 
                                      style={{
                                        width: '50px', 
                                        height: '50px', 
                                        objectFit: 'cover', 
                                        borderRadius: '50%'
                                      }}
                                    />
                                  )}
                                  <div>{result.name}</div>
                                </div>
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
                
                {/* Resultados de la clasificación principal */}
                {activeTab === 'qualify' && hasQualifyResults && (
                  <div className="results-container">
                    <div className="quali-header mb-3">
                      <h5 className="text-white-50">
                        <i className="bi bi-stopwatch text-info me-2"></i>
                        Clasificación - {formatDate(race.qualifying)}
                      </h5>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-dark table-striped">
                        <thead>
                          <tr>
                            <th>Posición</th>
                            <th>Piloto</th>
                            <th>Equipo</th>
                            <th>Tiempo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.qualify_result.map((result) => (
                            <tr key={`quali-${result.id}`}>
                              <td>{result.position}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  {result.image && (
                                    <img 
                                      src={result.image} 
                                      alt={result.name} 
                                      className="driver-image me-3" 
                                      style={{
                                        width: '50px', 
                                        height: '50px', 
                                        objectFit: 'cover', 
                                        borderRadius: '50%'
                                      }}
                                    />
                                  )}
                                  <div>{result.name}</div>
                                </div>
                              </td>
                              <td>{result.team}</td>
                              <td>{result.time || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Resultados de la carrera principal */}
                {activeTab === 'race' && results.races && results.races.length > 0 && (
                  <div className="results-container">
                    <div className="race-header mb-3">
                      <h5 className="text-white-50">
                        <i className="bi bi-flag-fill text-danger me-2"></i>
                        Carrera Principal - {formatDate(race.date)}
                      </h5>
                    </div>
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
                          {results.races.map((result) => (
                            <tr key={result.id} 
                                className={result.driver_id === (userBet?.driver_id) ? 'table-primary' : ''}>
                              <td>{result.position}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  {result.image && (
                                    <img 
                                      src={result.image} 
                                      alt={result.name} 
                                      className="driver-image me-3" 
                                      style={{
                                        width: '50px', 
                                        height: '50px', 
                                        objectFit: 'cover', 
                                        borderRadius: '50%'
                                      }}
                                    />
                                  )}
                                  <div>
                                    {result.name}
                                    {result.driver_id === (userBet?.driver_id) && <span className="badge bg-info ms-2">Tu apuesta</span>}
                                  </div>
                                </div>
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
            )}

            {/* Media Section - Video de carrera */}
            {isPastRace && race.media !== null && (
              <div className="media-card mt-4">
                <h2 className="mb-4 text-gradient">
                  <i className="bi bi-camera-video-fill me-2"></i>
                  Media
                </h2>
                <div className="youtube-container">
                  <iframe
                    className="youtube-iframe"
                    src={`${race.media}`}
                    title={`Resumen: ${race.name}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="video-caption mt-2">
                  <p className="text-muted">
                    <i className="bi bi-info-circle me-2"></i>
                    Resumen oficial de la carrera {race.name} - Temporada 2025
                  </p>
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
                      <p>Has apostado por: <strong>{userBet.name}</strong></p>
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
                      <p>Apostaste por: <strong>{userBet.name}</strong></p>
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
              
              {/* Stats card - solamente visible cuando hay resultados */}
              {isPastRace && (
                results.races?.length > 0 || 
                hasSprintResults || 
                hasQualifyResults
              ) && (
                <div className="stats-card mt-4">
                  <h3 className="text-gradient mb-3">Estadísticas</h3>
                  
                  {results.races && results.races.length > 0 && (
                    <div className="stat-item mb-3">
                      <div className="stat-label">Ganador GP</div>
                      <div className="stat-value">
                        {results.races[0]?.name || 'N/A'}
                        <span className="team-badge">{results.races[0]?.team}</span>
                      </div>
                    </div>
                  )}
                  
                  {hasSprintResults && (
                    <div className="stat-item mb-3">
                      <div className="stat-label">Ganador Sprint</div>
                      <div className="stat-value">
                        {results.sprint_race[0]?.name || 'N/A'}
                        <span className="team-badge">{results.sprint_race[0]?.team}</span>
                      </div>
                    </div>
                  )}
                  
                  {hasQualifyResults && (
                    <div className="stat-item mb-3">
                      <div className="stat-label">Pole Position</div>
                      <div className="stat-value">
                        {results.qualify_result[0]?.name || 'N/A'}
                        <span className="team-badge">{results.qualify_result[0]?.team}</span>
                      </div>
                    </div>
                  )}
                  
                  {results.fastest_lap && (
                    <div className="stat-item">
                      <div className="stat-label">Vuelta Rápida</div>
                      <div className="stat-value">
                        {results.fastest_lap.name}
                        <span className="lap-time">{results.fastest_lap.time}</span>
                      </div>
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

        .race-details-card, .race-results-card, .betting-card, .stats-card {
          background-color: #1e1e1e;
          border-radius: 10px;
          padding: 2rem;
          border-bottom: 4px solid #e10600;
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

        .circuit-image-container {
          width: 100%;
          height: 200px;
          overflow: hidden;
          border-radius: 10px;
          margin-bottom: 15px;
          background-color: #2a2a2a;
        }

        .circuit-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .race-card:hover .circuit-image {
          transform: scale(1.05);
        }
        
        /* Tabs personalizados */
        .custom-tabs {
          border-bottom: 1px solid #333;
        }

        .custom-tabs .nav-link {
          color: #ccc;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0;
          margin-right: 0.5rem;
          position: relative;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .custom-tabs .nav-link.active {
          color: white;
          background-color: transparent;
          border-bottom: 3px solid #e10600;
        }

        .custom-tabs .nav-link:hover:not(.active) {
          background-color: rgba(255, 255, 255, 0.05);
        }

        /* Estilos para las estadísticas */
        .stats-card {
          border-left: 4px solid #e10600;
        }

        .stat-item {
          margin-bottom: 1rem;
          padding: 0.8rem;
          background-color: #2a2a2a;
          border-radius: 8px;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #aaa;
          margin-bottom: 0.3rem;
        }

        .stat-value {
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .team-badge {
          font-size: 0.75rem;
          padding: 0.2rem 0.5rem;
          background-color: #333;
          border-radius: 4px;
          color: #ddd;
        }

        .lap-time {
          font-family: monospace;
          font-size: 0.9rem;
          color: #00ff00;
        }
        
        .alineacion {
          padding-top: 2rem !important;
        }
        /* Estilo para sprint header */
        .sprint-header {
          border-left: 4px solid #ffc107;
          padding-left: 1rem;
        }
        
        /* Animación de carga para los resultados */
        .results-container {
          animation: fadeIn 0.4s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .youtube-container {
        position: relative;
        width: 100%;
        padding-bottom: 56.25%; /* Para mantener proporción 16:9 */
        height: 0;
        overflow: hidden;
      }

      .youtube-iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 8px;
      }

      .media-card {
        background-color: #1e1e1e;
        border-radius: 10px;
        padding: 2rem;
        border-bottom: 4px solid #e10600;
        margin-top: 2rem;
      }

      .video-caption {
        font-size: 0.9rem;
      }
      `}</style>
    </div>
  );
}

export default RaceDetails;