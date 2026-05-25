// app.js — Utilitários globais do frontend

const API_URL = 'http://localhost:3001/api';

// ===== CLIENTE HTTP =====
// Centraliza todas as chamadas à API com o token JWT no header
const api = {
  _fetch(method, path, body) {
    const token = localStorage.getItem('token');
    return fetch(API_URL + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }).then(async res => {
      const data = await res.json();
      // Se a resposta não for ok, lança o erro com a mensagem do backend
      if (!res.ok) throw new Error(data.error || 'Erro inesperado.');
      return data;
    });
  },

  get:  (path)        => api._fetch('GET',    path),
  post: (path, body)  => api._fetch('POST',   path, body),
  put:  (path, body)  => api._fetch('PUT',    path, body),
  del:  (path)        => api._fetch('DELETE', path),
};

// ===== AUTENTICAÇÃO =====

// Redireciona para login se não houver token
function requireAuth() {
  if (!localStorage.getItem('token')) {
    location.href = 'login.html';
  }
}

// Remove token e redireciona para login
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  location.href = 'login.html';
}

// ===== FORMATAÇÃO =====

function formatMoney(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// Converte "YYYY-MM-DD" para "DD/MM/YYYY"
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
}
