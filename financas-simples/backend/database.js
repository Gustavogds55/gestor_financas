// database.js — Configuração e inicialização do banco de dados SQLite

const Database = require('better-sqlite3');
const path = require('path');

// O arquivo do banco fica na pasta backend/
const db = new Database(path.join(__dirname, 'financas.db'));

// Ativa suporte a chaves estrangeiras no SQLite
db.pragma('foreign_keys = ON');

// Cria as tabelas se ainda não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    password_hash TEXT  NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    type        TEXT    NOT NULL CHECK(type IN ('entrada', 'saida')),
    amount      REAL    NOT NULL CHECK(amount > 0),
    category    TEXT    NOT NULL,
    description TEXT,
    date        TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

module.exports = db;
