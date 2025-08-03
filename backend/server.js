// /backend/server.js

// --- 1. Importações ---
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { verifyToken } = require('./middleware/authMiddleware');

// --- 2. Importações das Rotas ---
const clientesRouter = require('./routes/clientes');
const produtosRouter = require('./routes/produtos');
const movimentacoesRouter = require('./routes/movimentacoes');
const despesasRouter = require('./routes/despesas');
const reportsRouter = require('./routes/reports');

// --- 3. Inicialização do App ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- 4. Middlewares ---
const allowedOrigins = [
  'https://caipirao.netlify.app',
  'http://localhost:5173'
];
const corsOptions = {
  origin: function (origin, callback ) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Acesso não permitido pela política de CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};
app.use(cors(corsOptions));
app.use(express.json());

// --- 5. Rotas de Autenticação (Públicas) ---
// A lógica de autenticação fica diretamente aqui, como estava antes.

// Rota para REGISTRAR um novo usuário
app.post('/auth/register', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha são obrigatórios." });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);
    const novoUtilizador = await pool.query(
      "INSERT INTO utilizadores (email, senha_hash) VALUES ($1, $2) RETURNING id, email",
      [email, senhaHash]
    );
    res.status(201).json({
      message: "Utilizador registrado com sucesso!",
      user: novoUtilizador.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: "Este email já está registrado." });
    }
    console.error('Erro ao registrar utilizador:', err.message);
    res.status(500).json({ error: "Erro no servidor ao registrar utilizador." });
  }
});

// Rota para fazer LOGIN
app.post('/auth/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha são obrigatórios." });
  }
  try {
    const result = await pool.query("SELECT * FROM utilizadores WHERE email = $1", [email]);
    const utilizador = result.rows[0];

    if (!utilizador) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const senhaCorreta = await bcrypt.compare(senha, utilizador.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const token = jwt.sign(
      { email: utilizador.email, id: utilizador.id, perfil: utilizador.perfil },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token });
  } catch (err) {
    console.error('Erro no servidor durante o login:', err.message);
    res.status(500).json({ error: "Erro no servidor durante o login." });
  }
});


// --- 6. Rotas da API (Protegidas por Token) ---
app.use('/api/clientes', verifyToken, clientesRouter);
app.use('/api/produtos', verifyToken, produtosRouter);
app.use('/api/movimentacoes', verifyToken, movimentacoesRouter);
app.use('/api/despesas', verifyToken, despesasRouter);
app.use('/api/reports', verifyToken, reportsRouter);

// --- 7. Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`✅ Servidor a correr na porta ${PORT}`);
});
