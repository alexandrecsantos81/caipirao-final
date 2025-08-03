// backend/routes/reports.js

const express = require('express');
const router = express.Router();
const pool = require('../db');

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
