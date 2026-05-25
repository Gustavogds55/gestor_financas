# 💰 Finanças Simples

Sistema web de controle financeiro pessoal com Node.js, Express, SQLite e frontend em HTML/CSS/JS puro.

---

## Estrutura do projeto

```
financas-simples/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── transactionController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── transactionRoutes.js
│   ├── database.js
│   ├── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── login.html
    ├── register.html
    ├── dashboard.html
    ├── transactions.html
    ├── style.css
    └── app.js
```

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- npm (já vem com o Node)

---

## Instalação e execução

### 1. Instalar dependências do backend

```bash
cd financas-simples/backend
npm install
```

### 2. Configurar variáveis de ambiente

O arquivo `.env` já está criado com valores padrão. Para produção, troque o `JWT_SECRET`:

```bash
# backend/.env
PORT=3001
JWT_SECRET=troque_por_uma_chave_secreta_longa_e_aleatoria
JWT_EXPIRES_IN=7d
```

### 3. Iniciar o backend

```bash
# Modo produção
npm start

# Modo desenvolvimento (reinicia ao salvar)
npm run dev
```

O servidor sobe em: **http://localhost:3001**

### 4. Abrir o frontend

Abra diretamente no navegador — não precisa de servidor:

```bash
# macOS
open financas-simples/frontend/login.html

# Ou arraste o arquivo login.html para o navegador
```

> O banco de dados `financas.db` é criado automaticamente na primeira execução do backend.

---

## Rotas da API

### Autenticação

| Método | Rota                  | Descrição              | Auth |
|--------|-----------------------|------------------------|------|
| POST   | /api/auth/register    | Cadastrar usuário      | Não  |
| POST   | /api/auth/login       | Login                  | Não  |
| GET    | /api/auth/me          | Dados do usuário logado| Sim  |

### Movimentações

| Método | Rota                        | Descrição                    | Auth |
|--------|-----------------------------|------------------------------|------|
| GET    | /api/transactions           | Listar movimentações         | Sim  |
| POST   | /api/transactions           | Criar movimentação           | Sim  |
| DELETE | /api/transactions/:id       | Excluir movimentação         | Sim  |
| GET    | /api/transactions/summary   | Resumo do dashboard          | Sim  |

**Filtros disponíveis no GET /api/transactions:**
- `?month=2025-01` — filtra por mês
- `?type=entrada` ou `?type=saida`
- `?category=Mercado`

---

## Testando com curl

### Cadastro
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Gustavo","email":"gustavo@email.com","password":"minhasenha123"}'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gustavo@email.com","password":"minhasenha123"}'
```

### Criar movimentação (substitua TOKEN pelo token retornado no login)
```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"type":"entrada","amount":3000,"category":"Salário","date":"2025-01-05","description":"Salário janeiro"}'
```

### Listar movimentações
```bash
curl http://localhost:3001/api/transactions?month=2025-01 \
  -H "Authorization: Bearer TOKEN"
```

### Resumo do dashboard
```bash
curl http://localhost:3001/api/transactions/summary?month=2025-01 \
  -H "Authorization: Bearer TOKEN"
```

### Excluir movimentação
```bash
curl -X DELETE http://localhost:3001/api/transactions/1 \
  -H "Authorization: Bearer TOKEN"
```

---

## Segurança implementada

- Senhas criptografadas com **bcrypt** (10 rounds)
- Autenticação via **JWT** com expiração configurável
- Cada usuário acessa apenas os próprios dados
- Variáveis sensíveis em `.env` (nunca commitado)
- Validação de dados no backend em todas as rotas
