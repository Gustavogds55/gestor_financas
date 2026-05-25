// server.js — Ponto de entrada do servidor

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

// Permite requisições do frontend (ajuste a origem em produção)
app.use(cors({ origin: '*' }));

// Interpreta JSON no corpo das requisições
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Rota de health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// Tratamento de rotas não encontradas
app.use((_, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
