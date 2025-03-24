import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function useInactivityLogout(isAuthenticated) {
  const { logout } = useAuth();
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    // Solo aplicar si está autenticado
    if (!isAuthenticated) return;

    // Eventos para rastrear actividad del usuario
    const events = [
      'mousemove', 
      'keydown', 
      'wheel', 
      'touchstart', 
      'click'
    ];

    // Tiempo de inactividad (30 minutos)
    const INACTIVITY_TIME = 30 * 60 * 1000;

    // Función para actualizar última actividad
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    // Añadir listeners de eventos
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    // Intervalo de verificación de inactividad
    const inactivityCheck = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastActivity = currentTime - lastActivity;

      if (timeSinceLastActivity > INACTIVITY_TIME) {
        logout(); // Cerrar sesión por inactividad
      }
    }, 60000); // Verificar cada minuto

    // Limpiar listeners y intervalos
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(inactivityCheck);
    };
  }, [isAuthenticated, lastActivity, logout]);
}