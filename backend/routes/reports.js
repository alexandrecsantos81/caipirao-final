// /backend/routes/reports.js

const express = require('express');
const router = express.Router();
const pool = require('../db'); // Importa a configuração de conexão com o banco de dados

/**
 * @route   GET /api/reports/atividade-clientes
 * @desc    Obtém a contagem de clientes ativos e inativos.
 *          - Ativos: Clientes que realizaram pelo menos uma compra nos últimos 90 dias.
 *          - Inativos: Clientes que não compram há mais de 90 dias ou nunca compraram.
 * @access  Private (protegido por middleware de autenticação no server.js)
 */
router.get('/atividade-clientes', async (req, res) => {
  try {
    // Esta query é o coração da lógica.
    // 1. A subquery (dentro do FROM) primeiro agrupa todos os clientes.
    // 2. Para cada cliente, ela encontra a data da última compra (MAX(m.data)).
    // 3. O CASE classifica cada cliente como 'ativo' ou 'inativo' baseado na data da última compra em relação à data atual.
    // 4. A query principal então conta quantos clientes caem em cada categoria.
    const query = `
      SELECT
        -- Conta quantos resultados na subquery foram classificados como 'ativo'
        COUNT(CASE WHEN status = 'ativo' THEN 1 END) AS ativos,
        -- Conta quantos resultados na subquery foram classificados como 'inativo'
        COUNT(CASE WHEN status = 'inativo' THEN 1 END) AS inativos
      FROM (
        SELECT
          c.id,
          CASE
            -- Se a data da última compra for maior ou igual a 90 dias atrás, o cliente é 'ativo'
            WHEN MAX(m.data) >= (CURRENT_DATE - INTERVAL '90 days') THEN 'ativo'
            -- Caso contrário (incluindo clientes que nunca compraram, onde MAX(m.data) será NULL), é 'inativo'
            ELSE 'inativo'
          END AS status
        FROM 
          clientes c
        LEFT JOIN 
          movimentacoes m ON c.id = m.cliente_id AND m.tipo = 'ENTRADA'
        GROUP BY 
          c.id
      ) AS subquery;
    `;

    const { rows } = await pool.query(query);

    // A query retorna uma única linha com as contagens. Ex: { ativos: '15', inativos: '8' }
    // Retornamos este objeto diretamente como JSON.
    res.json(rows[0]);

  } catch (err) {
    // Em caso de erro no banco de dados, loga o erro no console do servidor e envia uma resposta de erro 500.
    console.error('Erro ao gerar relatório de atividade de clientes:', err.stack);
    res.status(500).json({ error: "Erro no servidor ao gerar o relatório de atividade de clientes." });
  }
});

// Adicionamos aqui outras rotas de relatórios que já existiam para manter o arquivo completo.
// Se este arquivo for novo, estas rotas podem ser adicionadas posteriormente.

/**
 * @route   GET /api/reports/vendas-por-periodo
 * @desc    Obtém um relatório de vendas agregadas por dia dentro de um período.
 * @access  Private
 */
router.get('/vendas-por-periodo', async (req, res) => {
  const { data_inicio, data_fim } = req.query;
  if (!data_inicio || !data_fim) {
    return res.status(400).json({ error: "As datas de início e fim são obrigatórias." });
  }
  try {
    const query = `
      SELECT
        DATE(data) AS dia,
        SUM(valor) AS total_vendas,
        SUM(peso) AS peso_total,
        COUNT(id) AS transacoes
      FROM movimentacoes
      WHERE tipo = 'ENTRADA' AND data BETWEEN $1 AND $2
      GROUP BY DATE(data)
      ORDER BY dia ASC;
    `;
    const { rows } = await pool.query(query, [data_inicio, data_fim]);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao gerar relatório de vendas por período:', err.stack);
    res.status(500).json({ error: "Erro no servidor ao gerar o relatório." });
  }
});

/**
 * @route   GET /api/reports/ranking-produtos
 * @desc    Obtém um ranking de produtos mais vendidos por faturamento em um período.
 * @access  Private
 */
router.get('/ranking-produtos', async (req, res) => {
  const { data_inicio, data_fim } = req.query;
  if (!data_inicio || !data_fim) {
    return res.status(400).json({ error: "As datas de início e fim são obrigatórias." });
  }
  try {
    const query = `
      SELECT
        descricao AS produto_nome,
        SUM(valor) AS faturamento_total,
        SUM(peso) AS peso_total,
        COUNT(id) AS transacoes
      FROM movimentacoes
      WHERE tipo = 'ENTRADA' AND data BETWEEN $1 AND $2
      GROUP BY produto_nome
      ORDER BY faturamento_total DESC;
    `;
    const { rows } = await pool.query(query, [data_inicio, data_fim]);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao gerar ranking de produtos:', err.stack);
    res.status(500).json({ error: "Erro no servidor ao gerar o relatório." });
  }
});

/**
 * @route   GET /api/reports/ranking-clientes
 * @desc    Obtém um ranking de clientes por valor total de compras em um período.
 * @access  Private
 */
router.get('/ranking-clientes', async (req, res) => {
  const { data_inicio, data_fim } = req.query;
  if (!data_inicio || !data_fim) {
    return res.status(400).json({ error: "As datas de início e fim são obrigatórias." });
  }
  try {
    const query = `
      SELECT
        c.nome AS cliente_nome,
        SUM(m.valor) AS faturamento_total,
        SUM(m.peso) AS peso_total,
        COUNT(m.id) AS transacoes
      FROM movimentacoes AS m
      JOIN clientes AS c ON m.cliente_id = c.id
      WHERE m.tipo = 'ENTRADA' AND m.data BETWEEN $1 AND $2
      GROUP BY c.nome
      ORDER BY faturamento_total DESC;
    `;
    const { rows } = await pool.query(query, [data_inicio, data_fim]);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao gerar ranking de clientes:', err.stack);
    res.status(500).json({ error: "Erro no servidor ao gerar o relatório." });
  }
});


module.exports = router;
