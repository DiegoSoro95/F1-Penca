import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import raceService from '../services/carreraService';
import { Container, Row, Col, Card, Table, Badge, Spinner, Alert } from 'react-bootstrap';

function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [seasonStats, setSeasonStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Obtener tabla de posiciones
        const leaderboardData = await raceService.fetchLeaderboard();
        setLeaderboard(leaderboardData);
        
        // Obtener estadísticas de la temporada
        const statsData = await raceService.fetchSeasonStats();
        setSeasonStats(statsData);
      } catch (err) {
        setError('Error al cargar los datos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Encontrar la posición del usuario actual
  const findUserPosition = () => {
    const position = leaderboard.findIndex(item => item.user_id === user.id);
    return position >= 0 ? position + 1 : null;
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

  const userPosition = raceService.findUserPosition();

  return (
    <Container className="my-4">
      <h1 className="mb-4">Tabla de posiciones</h1>
      
      {seasonStats && (
        <Row className="mb-4">
          <Col md={4}>
            <Card className="text-center h-100">
              <Card.Body>
                <Card.Title>Carreras completadas</Card.Title>
                <div className="display-4 my-3">{seasonStats.completed_races}</div>
                <Card.Text>de {seasonStats.total_races} carreras</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center h-100">
              <Card.Body>
                <Card.Title>Participantes</Card.Title>
                <div className="display-4 my-3">{seasonStats.total_participants}</div>
                <Card.Text>jugadores activos</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center h-100">
              <Card.Body>
                <Card.Title>Próxima carrera</Card.Title>
                <div className="h4 my-3">
                  {seasonStats.next_race ? seasonStats.next_race.name : 'No hay carreras programadas'}
                </div>
                {seasonStats.next_race && (
                  <Card.Text>{new Date(seasonStats.next_race.race_date).toLocaleDateString()}</Card.Text>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      
      {userPosition && (
        <Card className="mb-4 bg-light">
          <Card.Body>
            <Row>
              <Col xs={2} md={1} className="text-center">
                <span className="fw-bold fs-4">#{userPosition}</span>
              </Col>
              <Col>
                <h4 className="mb-0">{user.username} <Badge bg="info">Tú</Badge></h4>
                <p className="text-muted mb-0">Puntos: {leaderboard[userPosition - 1].points}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
      
      <Card>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Usuario</th>
                <th className="text-center">Puntos</th>
                <th className="text-center">Apuestas correctas</th>
                <th className="text-center">Total apuestas</th>
                <th className="text-center">Efectividad</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((item, index) => (
                <tr key={item.user_id} className={item.user_id === user.id ? 'table-primary' : ''}>
                  <td>
                    {index === 0 && <Badge bg="warning" text="dark">1</Badge>}
                    {index === 1 && <Badge bg="secondary">2</Badge>}
                    {index === 2 && <Badge bg="danger">3</Badge>}
                    {index > 2 && index + 1}
                  </td>
                  <td>
                    {item.username}
                    {item.user_id === user.id && <Badge bg="info" className="ms-2">Tú</Badge>}
                  </td>
                  <td className="text-center fw-bold">{item.points}</td>
                  <td className="text-center">{item.correct_bets}</td>
                  <td className="text-center">{item.total_bets}</td>
                  <td className="text-center">
                    {item.total_bets > 0 ? `${Math.round((item.correct_bets / item.total_bets) * 100)}%` : '0%'}
                  </td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center">No hay datos disponibles</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      <div className="d-flex justify-content-end mt-4">
        <Link to="/dashboard" className="btn btn-secondary">
          Volver al Dashboard
        </Link>
      </div>
    </Container>
  );
}

export default Leaderboard;