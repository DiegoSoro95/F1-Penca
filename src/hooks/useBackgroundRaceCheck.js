import { useEffect } from 'react';

export function useBackgroundRaceCheck(isAuthenticated = true) {
  useEffect(() => {
    // Crear Web Worker en línea

    if (!isAuthenticated) return;

    const user = JSON.parse(localStorage.getItem('user'));
    const token = user.token;
    
    const workerCode = `
      async function checkRaceResults() {
        try {
          const response = await fetch('http://localhost:5000/api/races/check_results', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ${token}'
            }
          });
          
          if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
          }
          
        } catch (error) {
        }
      }

      // Ejecutar inmediatamente y luego cada 10 minutos
      checkRaceResults();
      setInterval(checkRaceResults, 10 * 60 * 1000);
    `;

    // Crear Web Worker
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    // Limpiar
    return () => {
      worker.terminate();
    };
  }, [isAuthenticated]); // Sin dependencias, se ejecuta una vez al montar

  return null;
}