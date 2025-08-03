// /backend/routes/reports.js

const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * @route   GET /api/reports/atividade-clientes
 * @desc    Obtém a contagem de clientes ativos e inativos.
 * @access  Private
 */
router.get('/atividade-clientes', async (req, res) => {
  try {
    // ======================= INÍCIO DA CORREÇÃO =======================
    // A query foi reestruturada para ser mais precisa.
    // 1. A subquery `ultimas_compras` filtra APENAS as movimentações de 'ENTRADA'
    //    e encontra a data da última compra para cada cliente que já comprou.
    // 2. A query principal faz um LEFT JOIN da tabela `clientes` com esta subquery.
    //    - Clientes que nunca compraram terão `uc.ultima_compra` como NULL.
    //    - Clientes que já compraram terão a data da sua última compra.
    // 3. O CASE então classifica corretamente com base na data ou na sua ausência.
    const query = `
      WITH ultimas_compras AS (
        SELECT
          cliente_id,
          MAX(data) AS ultima_compra
        FROM
          movimentacoes
        WHERE
          tipo = 'ENTRADA'
        GROUP BY
          cliente_id
      )
      SELECT
        COUNT(CASE WHEN c.status = 'ativo' THEN 1 END) AS ativos,
        COUNT(CASE WHEN c.status = 'inativo' THEN 1 END) AS inativos
      FROM (
        SELECT
          c.id,
          CASE
            WHEN uc.ultima_compra >= (CURRENT_DATE - INTERVAL '90 days') THEN 'ativo'
            ELSE 'inativo'
          END AS status
        FROM
          clientes c
        LEFT JOIN
          ultimas_compras uc ON c.id = uc.cliente_id
      ) AS c;
    `;
    // ======================== FIM DA CORREÇÃO =========================

    const { rows } = await pool.query(query);
    res.json(rows[0]);

  } catch (err) {
    console.error('Erro ao gerar relatório de atividade de clientes:', err.stack);
    res.status(500).json({ error: "Erro no servidor ao gerar o relatório de atividade de clientes." });
  }
});


// --- DEMAIS ROTAS (sem alteração) ---

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
