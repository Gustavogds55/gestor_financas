// transactionController.js — CRUD de movimentações financeiras

const db = require('../database');

const VALID_TYPES = ['entrada', 'saida'];

// GET /api/transactions — lista movimentações do usuário logado com filtros opcionais
function list(req, res) {
  const { month, category, type } = req.query;

  let query = 'SELECT * FROM transactions WHERE user_id = ?';
  const params = [req.userId];

  // Filtro por mês no formato YYYY-MM
  if (month) {
    query += " AND strftime('%Y-%m', date) = ?";
    params.push(month);
  }

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  query += ' ORDER BY date DESC, created_at DESC';

  const transactions = db.prepare(query).all(...params);
  return res.json(transactions);
}

// POST /api/transactions — cria nova movimentação
function create(req, res) {
  const { type, amount, category, description, date } = req.body;

  // Validações
  if (!type || !amount || !category || !date) {
    return res.status(400).json({ error: 'Tipo, valor, categoria e data são obrigatórios.' });
  }

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: 'Tipo deve ser "entrada" ou "saida".' });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'O valor deve ser maior que zero.' });
  }

  const result = db
    .prepare(
      'INSERT INTO transactions (user_id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(req.userId, type, parsedAmount, category, description || '', date);

  const created = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json(created);
}

// DELETE /api/transactions/:id — exclui movimentação garantindo que pertence ao usuário
function remove(req, res) {
  const { id } = req.params;

  // Verifica se a transação existe e pertence ao usuário logado
  const transaction = db
    .prepare('SELECT id FROM transactions WHERE id = ? AND user_id = ?')
    .get(id, req.userId);

  if (!transaction) {
    return res.status(404).json({ error: 'Movimentação não encontrada.' });
  }

  db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
  return res.json({ message: 'Movimentação excluída com sucesso.' });
}

// GET /api/transactions/summary — totais para o dashboard
function summary(req, res) {
  const { month } = req.query;

  // Mês padrão: mês atual
  const targetMonth = month || new Date().toISOString().slice(0, 7);

  const rows = db
    .prepare(
      `SELECT type, SUM(amount) as total
       FROM transactions
       WHERE user_id = ? AND strftime('%Y-%m', date) = ?
       GROUP BY type`
    )
    .all(req.userId, targetMonth);

  let totalEntradas = 0;
  let totalSaidas = 0;

  rows.forEach(r => {
    if (r.type === 'entrada') totalEntradas = r.total;
    if (r.type === 'saida') totalSaidas = r.total;
  });

  // Saldo geral (todos os meses)
  const saldoRow = db
    .prepare(
      `SELECT
         SUM(CASE WHEN type = 'entrada' THEN amount ELSE 0 END) -
         SUM(CASE WHEN type = 'saida'   THEN amount ELSE 0 END) AS saldo
       FROM transactions WHERE user_id = ?`
    )
    .get(req.userId);

  // Últimas 5 movimentações
  const recentes = db
    .prepare(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC LIMIT 5'
    )
    .all(req.userId);

  return res.json({
    month: targetMonth,
    totalEntradas,
    totalSaidas,
    balanco: totalEntradas - totalSaidas,
    saldoGeral: saldoRow?.saldo ?? 0,
    recentes,
  });
}

module.exports = { list, create, remove, summary };
