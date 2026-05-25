// authMiddleware.js — Verifica se o token JWT é válido antes de liberar a rota

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  // O token deve vir no header: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verifica e decodifica o token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Disponibiliza o id do usuário para os controllers
    req.userId = payload.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

module.exports = authMiddleware;
