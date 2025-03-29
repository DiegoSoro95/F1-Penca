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
    
    const [sprint_races] = await pool.query(
      `SELECT d.name,t.name as team ,d.number, d.image,res.driver_id, res.position, res.time, res.points FROM sprint_result res
        inner join drivers d on res.driver_id = d.id
        inner join teams t on d.team_id = t.id
        where res.sprint_race_id = ? order by res.position ASC`,
      [req.params.id]
    );

    const [qualify_result] = await pool.query(
      `SELECT d.name,t.name as team ,d.number, d.image,res.driver_id, res.position, res.time FROM qualify_result res
        inner join drivers d on res.driver_id = d.id
        inner join teams t on d.team_id = t.id
        where res.race_id = ? order by res.position ASC`,
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      data: {
        qualify_result : qualify_result,
        sprint_race : sprint_races,
        races : races
      }
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
  const year = new Date().getFullYear();
  
  try {

    // Obtener todos los resultados de la temporada 2025
    let allRaces = [];
    let offset = 0;
    let totalRaces;

    do {
      // Usar offset para paginar
      const response = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/results/?limit=100&offset=${offset}`);
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

    for (const race of allRaces) {
      const raceResults = race.Results || [];

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
        }
      }
    }
    //Fin Obtener todos los resultados de la temporada 2025
    
    //Resultados Sprint Race
    let allSprintRaces = [];
    let sprintOffset = 0;
    let totalSprintRaces;

    do {
      // Usar offset para paginar
      const response = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/sprint/?limit=100&offset=${sprintOffset}`);
      const data = await response.json();
      
      // Extraer races de la respuesta
      const sprint_races = data.MRData.RaceTable.Races || [];
      allSprintRaces = allSprintRaces.concat(sprint_races);

      // Total de carreras en la primera solicitud
      if (totalSprintRaces === undefined) {
        totalSprintRaces = parseInt(data.MRData.total);
      }

      // Incrementar sprintOffset para la siguiente página
      sprintOffset += 100;

      // Continuar mientras no hayamos recuperado todos los datos
    } while (sprintOffset < totalSprintRaces);

    if (allSprintRaces.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron resultados de carreras'
      });
    }

    for (const sprint_race of allSprintRaces) {
      const sprintRaceResults = sprint_race.SprintResults || [];

      for (const sprint_result of sprintRaceResults) {
        const matchedDriver2 = drivers.find(driver => 
          (driver.name.toLowerCase() === sprint_result.Driver.givenName + ' ' + sprint_result.Driver.familyName.toLowerCase()) ||
          (driver.number && driver.number === parseInt(sprint_result.Driver.permanentNumber))
        );

        if (!matchedDriver2) {
          console.warn(`Driver not found: ${sprint_result.Driver.givenName} ${sprint_result.Driver.familyName}`);
          continue;
        }

        const [existingResults2] = await connection.execute(
          'SELECT id FROM sprint_result WHERE sprint_race_id = ? AND driver_id = ? AND position = ?',
          [
            sprint_race.round, 
            matchedDriver2.id, 
            sprint_result.position
          ]
        );

        if (existingResults2.length === 0) {
          const [insertResult2] = await connection.execute(
            'INSERT INTO sprint_result (driver_id, position, time, points, sprint_race_id) VALUES (?, ?, ?, ?, ?)',
            [
              matchedDriver2.id,
              parseInt(sprint_result.position),
              sprint_result.FastestLap ? sprint_result.FastestLap.Time.time : null,
              parseInt(sprint_result.points),
              sprint_race.round
            ]
          );
        }
      }
    }
    
    //Fin Resultados Sprint Race

    //Resultados Clasificacion carrera
    let allQualifyRaces = [];
    let qualifyOffset = 0;
    let totalQualifyRaces;

    do {
      // Usar offset para paginar
      const response = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/qualifying/?limit=100&offset=${qualifyOffset}`);
      const data = await response.json();
      
      // Extraer races de la respuesta
      const qualify = data.MRData.RaceTable.Races || [];
      allQualifyRaces = allQualifyRaces.concat(qualify);

      // Total de carreras en la primera solicitud
      if (totalQualifyRaces === undefined) {
        totalQualifyRaces = parseInt(data.MRData.total);
      }

      // Incrementar qualifyOffset para la siguiente página
      qualifyOffset += 100;

      // Continuar mientras no hayamos recuperado todos los datos
    } while (qualifyOffset < totalQualifyRaces);

    if (allQualifyRaces.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron resultados de carreras'
      });
    }

    for (const qualify of allQualifyRaces) {
      const qualifyRaceResults = qualify.QualifyingResults || [];

      for (const qualify_result of qualifyRaceResults) {
        const matchedDriver3 = drivers.find(driver => 
          (driver.name.toLowerCase() === qualify_result.Driver.givenName + ' ' + qualify_result.Driver.familyName.toLowerCase()) ||
          (driver.number && driver.number === parseInt(qualify_result.Driver.permanentNumber))
        );

        if (!matchedDriver3) {
          console.warn(`Driver not found: ${qualify_result.Driver.givenName} ${qualify_result.Driver.familyName}`);
          continue;
        }

        const [existingResults3] = await connection.execute(
          'SELECT id FROM qualify_result WHERE race_id = ? AND driver_id = ? AND position = ?',
          [
            qualify.round, 
            matchedDriver3.id, 
            qualify_result.position
          ]
        );

        if (existingResults3.length === 0) {
          const [insertResult3] = await connection.execute(
            'INSERT INTO qualify_result (driver_id, position, time, race_id) VALUES (?, ?, ?, ?)',
            [
              matchedDriver3.id,
              parseInt(qualify_result.position),
              qualify_result.Q3 ? qualify_result.Q3 : (qualify_result.Q2 ? qualify_result.Q2 : (qualify_result.Q1 ? qualify_result.Q1 : null)),
              qualify.round
            ]
          );
        }
      }
    }

    //Fin Resultados Clasificacion carrera

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