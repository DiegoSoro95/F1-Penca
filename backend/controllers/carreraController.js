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