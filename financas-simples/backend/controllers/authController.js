// authController.js — Lógica de cadastro e login

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');

// Número de rounds do bcrypt (custo computacional)
const SALT_ROUNDS = 10;

// POST /api/auth/register
async function register(req, res) {
  const { name, email, password } = req.body;

  // Validações básicas
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'E-mail inválido.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'A senha deve ter no mínimo 8 caracteres.' });
  }

  // Verifica se o e-mail já está cadastrado
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'E-mail já cadastrado.' });
  }

  // Criptografa a senha antes de salvar
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name, email.toLowerCase(), password_hash);

  return res.status(201).json({ message: 'Usuário criado com sucesso.', id: result.lastInsertRowid });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  // Busca o usuário pelo e-mail
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }

  // Compara a senha enviada com o hash salvo
  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }

  // Gera o token JWT com o id do usuário no payload
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // Retorna o token e dados básicos — nunca retorna a senha
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
}

// GET /api/auth/me — retorna dados do usuário logado
function me(req, res) {
  const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  return res.json(user);
}

module.exports = { register, login, me };
