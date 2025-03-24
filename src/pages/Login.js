import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger animation after component mount
    setTimeout(() => setAnimate(true), 300);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError('Error al iniciar sesión: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="f1-login-container bg-dark text-white">
      {/* Racing Stripes */}
      <div className="hero-section position-relative overflow-hidden">
        <div className="racing-stripe-red"></div>
        <div className="racing-stripe-white"></div>
        
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className={`col-md-8 col-lg-6 ${animate ? 'slide-in-left' : ''}`}>
              <div className="login-card">
                <div className="text-center mb-4">
                  <h1 className="display-5 fw-bold text-gradient">F1 PENCA</h1>
                  <h2 className="h3 mb-3 text-warning">INICIAR SESIÓN</h2>
                  <div className="racing-line mx-auto my-4"></div>
                </div>
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="p-2">
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control form-control-lg bg-dark text-white border-danger"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="tu@email.com"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">Contraseña</label>
                    <input
                      type="password"
                      className="form-control form-control-lg bg-dark text-white border-danger"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="d-grid mb-4">
                    <button 
                      type="submit" 
                      className="btn btn-danger btn-lg shadow-red" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          PROCESANDO...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>INICIAR SESIÓN
                        </>
                      )}
                    </button>
                  </div>
                </form>
                
                <div className="text-center mt-4 border-top border-secondary pt-4">
                  <p className="mb-3">
                    ¿No tienes una cuenta? 
                  </p>
                  <Link to="/register" className="btn btn-outline-light btn-lg px-5">
                    <i className="bi bi-person-plus me-2"></i>REGISTRARSE
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS Styles */}
      <style jsx>{`
        .f1-login-container {
          background-color: #121212;
          color: white;
          position: relative;
          overflow-x: hidden;
          min-height: 100vh;
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
        
        @keyframes slideInLeft {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        /* Login card */
        .login-card {
          background-color: #1e1e1e;
          border-radius: 10px;
          padding: 2.5rem;
          position: relative;
          border-left: 4px solid #e10600;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
          margin-top: 2rem;
        }
        
        /* Button styles */
        .shadow-red {
          box-shadow: 0 4px 15px rgba(225, 6, 0, 0.4);
        }
        
        /* Form controls */
        .form-control {
          border-width: 2px;
          transition: all 0.3s ease;
        }
        
        .form-control:focus {
          border-color: #ff0000;
          box-shadow: 0 0 0 0.25rem rgba(225, 6, 0, 0.25);
        }
      `}</style>
    </div>
  );
}

export default Login;