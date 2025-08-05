// /backend/server.js

// --- 1. Importações ---
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Pacote CORS já importado
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { verifyToken, checkAdmin } = require('./middleware/authMiddleware');

// --- 2. Importações das Rotas ---
const clientesRouter = require('./routes/clientes');
const produtosRouter = require('./routes/produtos');
const movimentacoesRouter = require('./routes/movimentacoes');
const despesasRouter = require('./routes/despesas');
const reportsRouter = require('./routes/reports');
const usersRouter = require('./routes/users');

// --- 3. Inicialização do App ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- 4. Middlewares ---

// ======================= INÍCIO DA CORREÇÃO DE CORS =======================
// Lista de origens (domínios) que têm permissão para acessar esta API.
const allowedOrigins = [
  'https://caipirao.netlify.app', // URL do seu frontend em produção na Netlify
  'http://localhost:5173'       // URL do seu frontend para desenvolvimento local
];

const corsOptions = {
  origin: function (origin, callback ) {
    // Permite requisições sem 'origin' (como apps mobile ou Postman) 
    // ou se a origem estiver na nossa lista de permissões.
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Acesso não permitido pela política de CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos HTTP que permitimos
  credentials: true, // Permite o envio de cookies (se necessário no futuro)
  optionsSuccessStatus: 204 // Necessário para algumas versões de navegadores
};

// Aplica as opções de CORS a todas as rotas da nossa API.
app.use(cors(corsOptions));
app.use(express.json());
// ======================== FIM DA CORREÇÃO DE CORS =========================


// --- 5. Rotas de Autenticação (Públicas) ---
// ... (o restante do arquivo continua exatamente o mesmo)
// Rota para REGISTRAR um novo usuário
app.post('/auth/register', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha são obrigatórios." });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);
    
    const { rowCount } = await pool.query('SELECT id FROM utilizadores');
    const perfil = rowCount === 0 ? 'ADMIN' : 'USER';

    const novoUtilizador = await pool.query(
      "INSERT INTO utilizadores (email, senha_hash, perfil) VALUES ($1, $2, $3) RETURNING id, email, perfil",
      [email, senhaHash, perfil]
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
  const { identificador, senha } = req.body;
  if (!identificador || !senha) {
    return res.status(400).json({ error: "O identificador e a senha são obrigatórios." });
  }
  try {
    const query = "SELECT * FROM utilizadores WHERE email = $1 OR nickname = $1 OR telefone = $1";
    const result = await pool.query(query, [identificador]);
    const utilizador = result.rows[0];

    if (!utilizador) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const senhaCorreta = await bcrypt.compare(senha, utilizador.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const tokenPayload = {
      id: utilizador.id,
      email: utilizador.email,
      perfil: utilizador.perfil,
      nickname: utilizador.nickname
    };

    const token = jwt.sign(
      tokenPayload,
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
app.use('/api/users', verifyToken, checkAdmin, usersRouter);


// --- 7. Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`✅ Servidor a correr na porta ${PORT}`);
});
