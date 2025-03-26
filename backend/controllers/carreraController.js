const { pool } = require('../config/db');

// Obtener todas las carreras próximas
exports.getUpcomingRaces = async (req, res) => {
  try {
    const [races] = await pool.query(
      `SELECT r.*, 
        (SELECT COUNT(*) FROM bets WHERE race_id = r.id AND user_id = ?) as user_bet_count
      FROM races r 
      -- WHERE r.first_practice >= CURDATE() 
      ORDER BY r.first_practice ASC`,
      [req.user.id]
    );
    
    res.status(200).json({
      success: true,
      count: races.length,
      data: races
    });
  } catch (error) {
    console.error('Error al obtener carreras próximas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener carreras próximas',
      error: error.message
    });
  }
};

// Obtener una carrera por ID
exports.getRaceById = async (req, res) => {
  try {
    const [races] = await pool.query(
      `SELECT r.*, 
        (SELECT COUNT(*) FROM bets WHERE race_id = r.id AND user_id = ?) as user_has_bet
      FROM races r 
      WHERE r.id = ?`,
      [req.user.id, req.params.id]
    );
    
    if (races.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Carrera no encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      data: races[0]
    });
  } catch (error) {
    console.error('Error al obtener carrera:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información de la carrera',
      error: error.message
    });
  }
};

exports.fetchRaceResults = async (req, res) => {
  try {
    
    const [races] = await pool.query(
      `SELECT d.name,t.name as team ,d.number, d.image,res.driver_id, res.position, res.time, res.points FROM result res
        inner join drivers d on res.driver_id = d.id
        inner join teams t on d.team_id = t.id
        where res.race_id = ? order by res.position ASC`,
      [req.params.id]
    );
    
    if (races.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Carrera no encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {races : races}
    });

  } catch (error) {
    console.error('Error al obtener resultados carrera:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información de la carrera',
      error: error.message
    });
  }
};

exports.fetchAllRaceResults = async (req, res) => {
  let connection;
  try {
    let allRaces = [];
    let offset = 0;
    let totalRaces;

    do {
      // Usar offset para paginar
      const response = await fetch(`https://api.jolpi.ca/ergast/f1/2025/results/?limit=100&offset=${offset}`);
      const data = await response.json();
      
      // Extraer races de la respuesta
      const races = data.MRData.RaceTable.Races || [];
      allRaces = allRaces.concat(races);

      // Total de carreras en la primera solicitud
      if (totalRaces === undefined) {
        totalRaces = parseInt(data.MRData.total);
      }

      // Incrementar offset para la siguiente página
      offset += 100;

      // Continuar mientras no hayamos recuperado todos los datos
    } while (offset < totalRaces);

    if (allRaces.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron resultados de carreras'
      });
    }

    // Resto del código de inserción de resultados permanece igual
    connection = await pool.getConnection();

    const [drivers] = await connection.execute(`
      SELECT id, name, number 
      FROM drivers 
      WHERE activo = 1
    `);

    const allInsertedResults = [];

    for (const race of allRaces) {
      const raceResults = race.Results || [];
      const insertedResultIds = [];

      for (const result of raceResults) {
        const matchedDriver = drivers.find(driver => 
          (driver.name.toLowerCase() === result.Driver.givenName + ' ' + result.Driver.familyName.toLowerCase()) ||
          (driver.number && driver.number === parseInt(result.Driver.permanentNumber))
        );

        if (!matchedDriver) {
          console.warn(`Driver not found: ${result.Driver.givenName} ${result.Driver.familyName}`);
          continue;
        }

        const [existingResults] = await connection.execute(
          'SELECT id FROM result WHERE race_id = ? AND driver_id = ? AND position = ?',
          [
            race.round, 
            matchedDriver.id, 
            result.position
          ]
        );

        if (existingResults.length === 0) {
          const [insertResult] = await connection.execute(
            'INSERT INTO result (driver_id, position, time, points, race_id) VALUES (?, ?, ?, ?, ?)',
            [
              matchedDriver.id,
              parseInt(result.position),
              result.FastestLap ? result.FastestLap.Time.time : null,
              parseInt(result.points),
              race.round
            ]
          );

          insertedResultIds.push(insertResult.insertId);
        }
      }

      allInsertedResults.push({
        raceRound: race.round,
        raceName: race.raceName,
        insertedResultIds: insertedResultIds
      });
    }

    connection.release();

    res.status(200).json({
      success: true,
    });

  } catch (error) {
    if (connection) connection.release();

    console.error('Error al obtener resultados de carreras:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información de las carreras',
      error: error.message
    });
  }
};