import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { isAuthenticated } = useAuth();
  const [animate, setAnimate] = useState(false);
  const [upcomingRaces, setUpcomingRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Trigger animation after component mount
    setTimeout(() => setAnimate(true), 300);
    
    // Fetch upcoming races from Ergast API
    fetchUpcomingRaces();
  }, []);
  
  const fetchUpcomingRaces = async () => {
    try {
      setLoading(true);
      
      // Get current date in format YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch races from current date onwards
      const response = await fetch(`https://api.jolpi.ca/ergast/f1/2025/races/`);
      const data = await response.json();
      
      // Filter races that haven't happened yet
      const allRaces = data.MRData.RaceTable.Races;
      const upcoming = allRaces
        .filter(race => new Date(race.date) >= new Date())
        .slice(0, 3); // Get only the next 3 races
      
      setUpcomingRaces(upcoming);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching F1 races:", err);
      setError("No se pudieron cargar las carreras. Inténtalo de nuevo más tarde.");
      setLoading(false);
    }
  };
  
  // Helper function to format date range
  const formatDateRange = (raceDate, firstPracticeDate) => {
    const practice = new Date(firstPracticeDate || raceDate);
    const race = new Date(raceDate);
    
    const practiceDay = practice.getDate();
    const raceDay = race.getDate();
    const month = race.toLocaleString('es-ES', { month: 'short' }).toUpperCase();
    
    return `${practiceDay}-${raceDay} ${month}`;
  };
  
  // Get country code from circuit nationality for flag
  const getCountryCode = (nationality) => {
    const countryMap = {
      'Australia': 'au',
      'Austria': 'at',
      'Azerbaijan': 'az',
      'Bahrain': 'bh',
      'Belgium': 'be',
      'Brazil': 'br',
      'UK': 'gb',
      'Canada': 'ca',
      'China': 'cn',
      'Netherlands': 'nl',
      'UAE': 'ae',
      'French': 'fr',
      'Hungary': 'hu',
      'Italy': 'it',
      'Japan': 'jp',
      'Mexico': 'mx',
      'Monaco': 'mc',
      'Portuguese': 'pt',
      'Qatar': 'qa',
      'Saudi Arabia': 'sa',
      'Singapore': 'sg',
      'Spain': 'es',
      'US': 'us',
      'USA': 'us',
      'American': 'us',
    };
    
    // Default to the first two letters of nationality if no mapping exists
    return countryMap[nationality] || nationality.slice(0, 2).toLowerCase();
  };

  const translateGrandPrixName = (raceName) => {
    // Diccionario de traducción para los nombres de los Grandes Premios
    const translations = {
      'Australian Grand Prix': 'Gran Premio de Australia',
      'Bahrain Grand Prix': 'Gran Premio de Baréin',
      'Saudi Arabian Grand Prix': 'Gran Premio de Arabia Saudita',
      'Japanese Grand Prix': 'Gran Premio de Japón',
      'Chinese Grand Prix': 'Gran Premio de China',
      'Miami Grand Prix': 'Gran Premio de Miami',
      'Emilia Romagna Grand Prix': 'Gran Premio de Emilia-Romaña',
      'Monaco Grand Prix': 'Gran Premio de Mónaco',
      'Canadian Grand Prix': 'Gran Premio de Canadá',
      'Spanish Grand Prix': 'Gran Premio de España',
      'Austrian Grand Prix': 'Gran Premio de Austria',
      'British Grand Prix': 'Gran Premio de Gran Bretaña',
      'Hungarian Grand Prix': 'Gran Premio de Hungría',
      'Belgian Grand Prix': 'Gran Premio de Bélgica',
      'Dutch Grand Prix': 'Gran Premio de los Países Bajos',
      'Italian Grand Prix': 'Gran Premio de Italia',
      'Azerbaijan Grand Prix': 'Gran Premio de Azerbaiyán',
      'Singapore Grand Prix': 'Gran Premio de Singapur',
      'United States Grand Prix': 'Gran Premio de Estados Unidos',
      'Mexico City Grand Prix': 'Gran Premio de la Ciudad de México',
      'São Paulo Grand Prix': 'Gran Premio de São Paulo',
      'Las Vegas Grand Prix': 'Gran Premio de Las Vegas',
      'Qatar Grand Prix': 'Gran Premio de Catar',
      'Abu Dhabi Grand Prix': 'Gran Premio de Abu Dabi'
    };
    
    // Retornar traducción o el nombre original si no existe traducción
    return translations[raceName] || raceName;
  };

  return (
    <div className="f1-home-container bg-dark text-white">
      {/* Hero Section with Racing Stripes */}
      <div className="hero-section position-relative overflow-hidden">
        <div className="racing-stripe-red"></div>
        <div className="racing-stripe-white"></div>
        
        <div className="container py-5">
          <div className="row align-items-center">
            <div className={`col-lg-6 hero-content ${animate ? 'slide-in-left' : ''}`}>
              <div className="mb-4">
                <span className="badge bg-danger me-2">TEMPORADA 2025</span>
                <span className="badge bg-light text-dark">PREDICCIONES EN VIVO</span>
              </div>
              <h1 className="display-3 fw-bold mb-3 text-gradient">F1 PENCA</h1>
              <h2 className="h2 mb-4 text-warning">¡LA COMPETICIÓN DEFINITIVA PARA FANS DE F1!</h2>
              <p className="lead mb-4">
                Demuestra quién sabe más de F1. Predice resultados, suma puntos y compite
                por ser el campeón de la temporada entre tus amigos.
              </p>
              
              <div className="cta-buttons">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn btn-danger btn-lg px-5 shadow-red">
                    <i className="bi bi-speedometer2 me-2"></i>IR AL DASHBOARD
                  </Link>
                ) : (
                  <div className="d-grid gap-3 d-md-flex">
                    <Link to="/login" className="btn btn-danger btn-lg px-5 shadow-red">
                      <i className="bi bi-box-arrow-in-right me-2"></i>INICIAR SESIÓN
                    </Link>
                    <Link to="/register" className="btn btn-outline-light btn-lg px-5">
                      <i className="bi bi-person-plus me-2"></i>REGISTRARSE
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <div className={`col-lg-6 mt-5 mt-lg-0 hero-image ${animate ? 'slide-in-right' : ''}`}>
              <div className="position-relative">
                <img 
                  src={`${process.env.PUBLIC_URL}/imagenes/f1-hero.jpg`}
                  alt="Fórmula 1" 
                  className="img-fluid rounded shadow-lg" 
                  style={{ 
                    filter: 'contrast(1.1) saturate(1.2)',
                    maxHeight: '700px',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="how-it-works py-5 position-relative">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-gradient">CÓMO PARTICIPAR</h2>
            <div className="racing-line mx-auto my-4"></div>
          </div>
          
          <div className="row g-4">
            <div className="col-md-3">
              <div className="step-card h-100">
                <div className="card-number">01</div>
                <div className="card-icon">
                  <i className="bi bi-person-plus-fill"></i>
                </div>
                <h3 className="step-title">REGÍSTRATE</h3>
                <p>Crea tu cuenta y únete a la parrilla de salida. Es rápido y gratuito.</p>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="step-card h-100">
                <div className="card-number">02</div>
                <div className="card-icon">
                  <i className="bi bi-check2-circle"></i>
                </div>
                <h3 className="step-title">PREDICE</h3>
                <p>Analiza a los pilotos y elige al ganador de cada Gran Premio.</p>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="step-card h-100">
                <div className="card-number">03</div>
                <div className="card-icon">
                  <i className="bi bi-star-fill"></i>
                </div>
                <h3 className="step-title">PUNTÚA</h3>
                <p>Acumula puntos con cada predicción correcta y estrategias ganadoras.</p>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="step-card h-100">
                <div className="card-number">04</div>
                <div className="card-icon">
                  <i className="bi bi-trophy-fill"></i>
                </div>
                <h3 className="step-title">GANA</h3>
                <p>Compite con amigos y compañeros por el podio y la gloria.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Upcoming Races Section */}
      <div className="upcoming-races py-5 bg-gradient">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">PRÓXIMAS CARRERAS</h2>
            <div className="racing-line mx-auto my-4"></div>
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-3">Cargando próximas carreras...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger text-center" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          ) : (
            <div className="row g-4">
              {upcomingRaces.length > 0 ? (
                upcomingRaces.map((race) => (
                  <div className="col-md-4" key={race.round}>
                    <div className="race-card">
                      <div className="race-date">
                        {formatDateRange(race.date, race.FirstPractice?.date)}
                      </div>
                      <div 
                        className={`race-flag ${getCountryCode(race.Circuit.Location.country)}`}
                        title={race.Circuit.Location.country}
                      ></div>
                      <h3 className="race-title">
                        {translateGrandPrixName(race.raceName)}
                      </h3>
                      <p className="race-location">{race.Circuit.Location.locality}</p>
                      <Link to="/predictions" className="btn btn-outline-danger w-100">HACER PREDICCIÓN</Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center">
                  <div className="alert alert-warning" role="alert">
                    No hay próximas carreras disponibles en este momento.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* CSS to be added to your global styles or a CSS module */}
      <style jsx>{`
        .f1-home-container {
          background-color: #121212;
          color: white;
          position: relative;
          overflow-x: hidden;
        }
        
        /* Text gradient effect */
        .text-gradient {
          background: linear-gradient(90deg, #ff0000, #ff6b6b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
        
        /* Racing stripes */
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
        
        /* Racing line divider */
        .racing-line {
          height: 4px;
          width: 150px;
          background: linear-gradient(90deg, #e10600, transparent);
          position: relative;
        }
        
        .racing-line::after {
          content: '';
          position: absolute;
          right: 0;
          top: -3px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #e10600;
        }
        
        /* Animation classes */
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
        
        /* Step cards */
        .step-card {
          background-color: #1e1e1e;
          border-radius: 10px;
          padding: 2rem;
          position: relative;
          border-left: 4px solid #e10600;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .step-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 25px rgba(225, 6, 0, 0.2);
        }
        
        .card-number {
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 2.5rem;
          font-weight: 800;
          opacity: 0.2;
          color: #e10600;
        }
        
        .card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 70px;
          height: 70px;
          background-color: rgba(225, 6, 0, 0.1);
          border-radius: 50%;
          margin-bottom: 1.5rem;
          color: #e10600;
          font-size: 2rem;
        }
        
        .step-title {
          font-weight: 700;
          margin-bottom: 1rem;
          font-size: 1.25rem;
        }
        
        /* Race cards */
        .race-card {
          background-color: #1e1e1e;
          border-radius: 10px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          border-bottom: 4px solid #e10600;
          transition: transform 0.3s ease;
        }
        
        .race-card:hover {
          transform: translateY(-10px);
        }
        
        .race-date {
          font-size: 0.9rem;
          font-weight: 700;
          color: #999;
          margin-bottom: 1rem;
        }
        
        .race-flag {
          width: 30px;
          height: 20px;
          margin-bottom: 1rem;
          background-size: cover;
          border-radius: 2px;
          background-position: center;
          background-color: #333;
        }
        
        /* Flag backgrounds - for real implementation, you'd use images */
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
        
        .race-title {
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        
        .race-location {
          color: #999;
          margin-bottom: 1.5rem;
        }
        
        /* Button styles */
        .shadow-red {
          box-shadow: 0 4px 15px rgba(225, 6, 0, 0.4);
        }
        
        .checkered-flag-overlay {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 100px;
          height: 100px;
          background-image: 
            linear-gradient(45deg, 
              rgba(0,0,0,0.8) 25%, 
              rgba(255,255,255,0.8) 25%, 
              rgba(255,255,255,0.8) 50%, 
              rgba(0,0,0,0.8) 50%, 
              rgba(0,0,0,0.8) 75%,
              rgba(255,255,255,0.8) 75%);
          background-size: 20px 20px;
          transform: rotate(15deg);
          z-index: 2;
          opacity: 0.5;
        }
        
        /* Background gradient */
        .bg-gradient {
          background: linear-gradient(180deg, #121212 0%, #1e1e1e 100%);
        }
      `}</style>
    </div>
  );
}

export default Home;