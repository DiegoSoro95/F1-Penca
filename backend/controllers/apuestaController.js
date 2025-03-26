const { pool } = require('../config/db');

// Crear nueva apuesta
exports.createBet = async (req, res) => {
  try {
    const { race_id, driver_id } = req.body;
    const user_id = req.user.id;
    
    // Verificar si la carrera existe y si aún se puede apostar
    const [races] = await pool.query(
      'SELECT * FROM races WHERE id = ? AND qualifying_datetime > NOW()',
      [race_id]
    );
    
    if (races.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Carrera no encontrada o el período de apuestas ha finalizado'
      });
    }
    
    // Verificar si el usuario ya apostó en esta carrera
    const [existingBets] = await pool.query(
      'SELECT * FROM bets WHERE user_id = ? AND race_id = ?',
      [user_id, race_id]
    );
    
    if (existingBets.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya has realizado una apuesta para esta carrera'
      });
    }
    
    // Verificar si el piloto existe
    const [drivers] = await pool.query(
      'SELECT * FROM drivers WHERE id = ?',
      [driver_id]
    );
    
    if (drivers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Piloto no encontrado'
      });
    }
    
    // Crear la apuesta
    const [result] = await pool.query(
      'INSERT INTO bets (user_id, race_id, driver_id) VALUES (?, ?, ?)',
      [user_id, race_id, driver_id]
    );
    
    res.status(201).json({
      success: true,
      message: 'Apuesta realizada exitosamente',
      data: {
        id: result.insertId,
        user_id,
        race_id,
        driver_id,
        driver_name: drivers[0].name,
        status: 'pending',
        points_earned: 0,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('Error al crear apuesta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al realizar la apuesta',
      error: error.message
    });
  }
};

// Obtener apuestas del usuario
exports.getUserBets = async (req, res) => {
  try {
    const [bets] = await pool.query(
      `SELECT b.*, d.name AS driver_name, t.name AS driver_team, r.name AS race_name, r.date AS race_date 
      FROM bets b
      JOIN drivers d ON b.driver_id = d.id
      JOIN teams t ON d.team_id = t.id
      JOIN races r ON b.race_id = r.id
      WHERE b.user_id = ?
      ORDER BY r.date DESC`,
      [req.user.id]
    );
    
    res.status(200).json({
      success: true,
      count: bets.length,
      data: bets
    });
  } catch (error) {
    console.error('Error al obtener apuestas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener apuestas del usuario',
      error: error.message
    });
  }
};