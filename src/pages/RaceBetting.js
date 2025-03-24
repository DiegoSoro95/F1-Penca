import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import betService from '../services/apuestaService';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';

function RaceBetting() {
  const { raceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [race, setRace] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasExistingBet, setHasExistingBet] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Verificar si el usuario ya realizó una apuesta para esta carrera
        const existingBet = await betService.checkExistingBet(user.id, raceId);
        if (existingBet) {
          setHasExistingBet(true);
          setError('Ya has realizado una apuesta para esta carrera');
        }

        // Obtener detalles de la carrera
        const raceData = await betService.fetchRaceById(raceId);
        setRace(raceData);
        
        // Verificar si todavía se puede apostar (antes de la clasificación)
        const now = new Date();
        const qualifyingDate = new Date(raceData.qualifying_datetime);
        if (now >= qualifyingDate) {
          setError('Las apuestas para esta carrera ya están cerradas');
        }
        
        // Obtener lista de pilotos
        const driversData = await betService.fetchDrivers();
        setDrivers(driversData);
      } catch (err) {
        setError('Error al cargar los datos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [raceId, user.id]);

  const handleDriverSelect = (driverId) => {
    betService.setSelectedDriver(driverId);
  };

  const handleSubmitBet = async () => {
    if (!selectedDriver) {
      setError('Debes seleccionar un piloto');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      // Crear la apuesta en la base de datos
      await betService.createBet({
        user_id: user.id,
        race_id: raceId,
        driver_id: selectedDriver,
        created_at: new Date().toISOString()
      });
      
      setSuccess('¡Apuesta realizada con éxito!');
      
      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Error al realizar la apuesta: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  if (hasExistingBet) {
    return (
      <Container className="my-4">
        <Alert variant="warning">
          <Alert.Heading>Ya has realizado una apuesta</Alert.Heading>
          <p>Ya has realizado una apuesta para esta carrera.</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-secondary" onClick={() => navigate('/dashboard')}>
              Volver al Dashboard
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (error && error.includes('cerradas')) {
    return (
      <Container className="my-4">
        <Alert variant="danger">
          <Alert.Heading>Apuestas cerradas</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-secondary" onClick={() => navigate('/dashboard')}>
              Volver al Dashboard
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      {race && (
        <Card className="mb-4 bg-light">
          <Card.Body>
            <Card.Title className="fs-2">{race.name}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">{race.circuit}</Card.Subtitle>
            <Card.Text>
              <strong>Fecha de carrera:</strong> {new Date(race.race_date).toLocaleDateString()}
              <br />
              <strong>Las apuestas se cierran:</strong> {new Date(race.qualifying_datetime).toLocaleString()}
            </Card.Text>
          </Card.Body>
        </Card>
      )}
      
      <h3 className="mb-3">Selecciona tu piloto ganador</h3>
      
      <Row xs={1} md={2} lg={3} className="g-4 mb-4">
        {drivers.map((driver) => (
          <Col key={driver.id}>
            <Card 
              className={`h-100 driver-card ${selectedDriver === driver.id ? 'border-primary' : ''}`} 
              onClick={() => handleDriverSelect(driver.id)}
              style={{ cursor: 'pointer' }}
            >
              <Card.Img 
                variant="top" 
                src={driver.image_url || `https://via.placeholder.com/300x200?text=${driver.name}`} 
                alt={driver.name}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body>
                <Card.Title>{driver.name}</Card.Title>
                <Card.Text>
                  <span className="text-muted">{driver.team}</span>
                  <br />
                  <small>Número: {driver.number}</small>
                </Card.Text>
              </Card.Body>
              {selectedDriver === driver.id && (
                <div className="position-absolute top-0 end-0 p-2">
                  <span className="badge bg-primary">Seleccionado</span>
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
      
      <div className="d-flex justify-content-between">
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmitBet} 
          disabled={!selectedDriver || submitting}
        >
          {submitting ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">Procesando...</span>
            </>
          ) : (
            'Confirmar apuesta'
          )}
        </Button>
      </div>
    </Container>
  );
}

export default RaceBetting;