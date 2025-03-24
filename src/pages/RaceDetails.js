import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import raceService from '../services/carreraService';
import { Container, Card, Row, Col, Button, Badge, Table, Spinner, Alert } from 'react-bootstrap';

function RaceDetails() {
  const { raceId } = useParams();
  const { user } = useAuth();
  const [race, setRace] = useState(null);
  const [results, setResults] = useState([]);
  const [userBet, setUserBet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Obtener detalles de la carrera
        const raceData = await raceService.fetchRaceById(raceId);
        setRace(raceData);
        
        // Obtener resultados de la carrera si ya ocurrió
        if (new Date(raceData.race_date) < new Date()) {
          const resultsData = await raceService.fetchRaceResults(raceId);
          setResults(resultsData);
        }
        
        // Obtener la apuesta del usuario para esta carrera
        const betData = await raceService.fetchUserBetForRace(user.id, raceId);
        setUserBet(betData);
      } catch (err) {
        setError('Error al cargar los datos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [raceId, user.id]);

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

  if (loading) {
    return (
      <Container className="d-flex justify-content-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!race) {
    return (
      <Container className="my-4">
        <Alert variant="warning">Carrera no encontrada</Alert>
      </Container>
    );
  }

  const raceDate = new Date(race.race_date);
  const isPastRace = raceDate < new Date();
  const isUpcoming = !isPastRace;

  return (
    <Container className="my-4">
      <Card className="mb-4">
        <div className="position-relative">
          <Card.Img 
            variant="top" 
            src={race.circuit_image_url || `https://via.placeholder.com/1200x400?text=${race.circuit}`} 
            alt={race.circuit}
            style={{ height: '250px', objectFit: 'cover' }}
          />
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
               style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <h1 className="text-white text-center">{race.name}</h1>
          </div>
        </div>
        <Card.Body>
          <Row>
            <Col md={8}>
              <h3 className="mb-3">{race.circuit}</h3>
              <p className="mb-1">
                <strong>Carrera:</strong> {formatDate(race.race_date)}
              </p>
              <p className="mb-1">
                <strong>Clasificación:</strong> {formatDate(race.qualifying_datetime)}
              </p>
              <p className="mb-3">
                <strong>Vueltas:</strong> {race.laps || 'No disponible'}
              </p>
              <p>{race.description}</p>
            </Col>
            <Col md={4} className="d-flex flex-column align-items-center justify-content-center">
              {isUpcoming && (
                <>
                  <div className="mb-3 text-center">
                    <Badge bg={canStillBet(race) ? "success" : "danger"} className="p-2 fs-6">
                      {canStillBet(race) ? "Apuestas abiertas" : "Apuestas cerradas"}
                    </Badge>
                  </div>
                  {userBet ? (
                    <Card className="w-100 mb-3">
                      <Card.Body>
                        <Card.Title>Tu apuesta</Card.Title>
                        <Card.Text>
                          Has apostado por: <strong>{userBet.driver_name}</strong>
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  ) : canStillBet(race) ? (
                    <Button as={Link} to={`/bet/${race.id}`} variant="primary" className="w-100">
                      Realizar apuesta
                    </Button>
                  ) : (
                    <Alert variant="warning" className="w-100 text-center">
                      No realizaste ninguna apuesta para esta carrera
                    </Alert>
                  )}
                </>
              )}
              {isPastRace && (
                <div className="text-center w-100">
                  <Badge bg="secondary" className="p-2 fs-6 mb-3">
                    Carrera finalizada
                  </Badge>
                  
                  {userBet && (
                    <Card className={`w-100 mb-3 ${userBet.status === 'won' ? 'border-success' : userBet.status === 'lost' ? 'border-danger' : ''}`}>
                      <Card.Body>
                        <Card.Title>Tu apuesta</Card.Title>
                        <Card.Text>
                          Apostaste por: <strong>{userBet.driver_name}</strong>
                        </Card.Text>
                        {userBet.status === 'won' && (
                          <Badge bg="success">Ganaste +{userBet.points_earned} puntos</Badge>
                        )}
                        {userBet.status === 'lost' && (
                          <Badge bg="danger">Perdiste</Badge>
                        )}
                      </Card.Body>
                    </Card>
                  )}
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {isPastRace && results.length > 0 && (
        <Card>
          <Card.Header as="h5">Resultados de la carrera</Card.Header>
          <Card.Body>
            <Table striped responsive>
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
                  <tr key={result.id} className={result.driver_id === (userBet?.driver_id) ? 'table-primary' : ''}>
                    <td>{result.position}</td>
                    <td>
                      {result.driver_name}
                      {result.position === 1 && <Badge bg="warning" text="dark" className="ms-2">Ganador</Badge>}
                      {result.driver_id === (userBet?.driver_id) && <Badge bg="info" className="ms-2">Tu apuesta</Badge>}
                    </td>
                    <td>{result.team}</td>
                    <td>{result.time || 'N/A'}</td>
                    <td>{result.points}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
      
      <div className="d-flex justify-content-between mt-4">
        <Button variant="secondary" as={Link} to="/dashboard">
          Volver al Dashboard
        </Button>
        {isUpcoming && !userBet && canStillBet(race) && (
          <Button variant="primary" as={Link} to={`/bet/${race.id}`}>
            Realizar apuesta
          </Button>
        )}
      </div>
    </Container>
  );
}

export default RaceDetails;