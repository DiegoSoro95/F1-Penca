const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

exports.protect = async (req, res, next) => {
  let token;
  
  // Verificar si existe el token en los headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado, token no proporcionado'
    });
  }
  
  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar si el usuario existe
    const [users] = await pool.query(
      'SELECT id, username, email FROM users WHERE id = ?',
      [decoded.id]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Añadir usuario a la request
    req.user = users[0];
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(401).json({
      success: false,
      message: 'No autorizado, token inválido',
      error: error.message
    });
  }
};