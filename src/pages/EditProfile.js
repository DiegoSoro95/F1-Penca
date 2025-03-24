import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function EditProfile() {
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);

  const { currentUser, updatePassword, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar datos actuales del usuario
    if (currentUser) {
      setUsername(currentUser.user.username);
    }
    
    // Trigger animation after component mount
    setTimeout(() => setAnimate(true), 300);
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (newPassword !== newPasswordConfirm) {
      return setError('Las nuevas contraseñas no coinciden');
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);

      // Actualizar contraseña si se proporcionó
      if (newPassword) {
        await updatePassword(currentPassword, newPassword);
        // Cerrar sesión después de cambiar la contraseña
        await logout();
        navigate('/login');
        return;
      }

      setSuccess('Perfil actualizado exitosamente');
    } catch (error) {
      setError('Error al actualizar el perfil: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="f1-register-container bg-dark text-white">
      {/* Racing Stripes */}
      <div className="hero-section position-relative overflow-hidden">
        <div className="racing-stripe-red"></div>
        <div className="racing-stripe-white"></div>
        
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className={`col-md-8 col-lg-6 ${animate ? 'slide-in-left' : ''}`}>
              <div className="register-card">
                <div className="text-center mb-4">
                  <h1 className="display-5 fw-bold text-gradient">F1 PENCA</h1>
                  <h2 className="h3 mb-3 text-warning">CAMBIAR CONTRASEÑA</h2>
                  <div className="racing-line mx-auto my-4"></div>
                </div>
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    {success}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="p-2">
                  <div className="mb-4">
                    <label htmlFor="username" className="form-label">Nombre de usuario</label>
                    <input
                      type="text"
                      className="form-control form-control-lg bg-dark text-white border-danger"
                      id="username"
                      value={username}
                      disabled
                      readOnly
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="current-password" className="form-label">Contraseña actual</label>
                    <input
                      type="password"
                      className="form-control form-control-lg bg-dark text-white border-danger"
                      id="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="Contraseña actual"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="new-password" className="form-label">Nueva contraseña</label>
                    <input
                      type="password"
                      className="form-control form-control-lg bg-dark text-white border-danger"
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Nueva contraseña"
                    />
                  </div>
                  
                  {newPassword && (
                    <div className="mb-4">
                      <label htmlFor="new-password-confirm" className="form-label">Confirmar nueva contraseña</label>
                      <input
                        type="password"
                        className="form-control form-control-lg bg-dark text-white border-danger"
                        id="new-password-confirm"
                        value={newPasswordConfirm}
                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                        placeholder="Confirmar nueva contraseña"
                      />
                    </div>
                  )}
                  
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
                          <i className="bi bi-person-check me-2"></i>CAMBIAR CONTRASEÑA
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Usar los mismos estilos del componente de registro */}
      <style jsx>{`
        .f1-register-container {
          background-color: #121212;
          color: white;
          position: relative;
          overflow-x: hidden;
          min-height: 100vh;
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
        
        .slide-in-left {
          animation: slideInLeft 0.8s ease forwards;
        }
        
        @keyframes slideInLeft {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .register-card {
          background-color: #1e1e1e;
          border-radius: 10px;
          padding: 2.5rem;
          position: relative;
          border-left: 4px solid #e10600;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
          margin-top: 2rem;
        }
        
        .shadow-red {
          box-shadow: 0 4px 15px rgba(225, 6, 0, 0.4);
        }
        
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

export default EditProfile;