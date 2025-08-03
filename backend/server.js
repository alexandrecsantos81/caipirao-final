// /backend/server.js

// --- 1. Importações ---
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { verifyToken } = require('./middleware/authMiddleware'); // Middleware de autenticação

// --- 2. Importações das Rotas ---
const clientesRouter = require('./routes/clientes');
const produtosRouter = require('./routes/produtos');
const movimentacoesRouter = require('./routes/movimentacoes');
const despesasRouter = require('./routes/despesas');
const reportsRouter = require('./routes/reports'); // <<< ADICIONE ESTA LINHA

// --- 3. Inicialização do App ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- 4. Middlewares ---
app.use(cors());
app.use(express.json());

// --- 5. Rotas de Autenticação (Públicas) ---
// (As rotas de /auth/login e /auth/register continuam aqui, sem alterações)
const authRouter = require('./routes/auth'); // Supondo que você tenha um arquivo auth.js
app.use('/auth', authRouter);


// --- 6. Rotas da API (Protegidas por Token) ---
app.use('/api/clientes', verifyToken, clientesRouter);
app.use('/api/produtos', verifyToken, produtosRouter);
app.use('/api/movimentacoes', verifyToken, movimentacoesRouter);
app.use('/api/despesas', verifyToken, despesasRouter);
app.use('/api/reports', verifyToken, reportsRouter); // <<< ADICIONE ESTA LINHA

// --- 7. Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`✅ Servidor a correr na porta ${PORT}`);
});
