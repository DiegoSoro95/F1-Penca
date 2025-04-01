import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useInactivityLogout } from './hooks/useInactivityLogout'; // Nuevo hook
import { useBackgroundRaceCheck } from './hooks/useBackgroundRaceCheck';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RaceBetting from './pages/RaceBetting';
import RaceDetails from './pages/RaceDetails';
import Leaderboard from './pages/Leaderboard';
import EditProfile from './pages/EditProfile';
import Footer from './components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// Hook de inactividad
const InactivityHandler = () => {
  const { isAuthenticated } = useAuth();
  
  // Solo aplicar hook si está autenticado
  useInactivityLogout(isAuthenticated);
  
  return null;
};

const UseBackgroundHandler = () => {
  const { isAuthenticated } = useAuth();
  
  // Solo aplicar hook si está autenticado
  useBackgroundRaceCheck(isAuthenticated);
  
  return null;
};

// Componente ProtectedRoute para rutas que requieren autenticación
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {

  return (
    <AuthProvider>
      <Router basename="/F1-Penca">
        <div className="d-flex flex-column min-vh-100">
          <InactivityHandler />
          <UseBackgroundHandler />
          
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/race/:raceId" 
                element={
                  <ProtectedRoute>
                    <RaceDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bet/:raceId" 
                element={
                  <ProtectedRoute>
                    <RaceBetting />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/leaderboard" 
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit-profile" 
                element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;