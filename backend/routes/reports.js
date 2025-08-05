const express = require('express');
const router = express.Router();
const pool = require('../db');

// Rota /atividade-clientes (sem alterações)
router.get('/atividade-clientes', async (req, res) => {
  try {
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

    const { rows } = await pool.query(query);
    const result = {
        ativos: parseInt(rows[0].ativos, 10) || 0,
        inativos: parseInt(rows[0].inativos, 10) || 0
    };
    res.json(result);

  } catch (err) {
    console.error('Erro ao gerar relatório de atividade de clientes:', err.stack);
    res.status(500).json({ error: "Erro no servidor ao gerar o relatório de atividade de clientes." });
  }
});

// Rota /vendas-por-periodo (sem alterações)
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

// ======================= INÍCIO DA ALTERAÇÃO =======================

/**
 * @route   GET /api/reports/ranking-produtos
 * @desc    Obtém o ranking de produtos mais vendidos, agora incluindo a unidade de medida.
 * @access  Private
 */
router.get('/ranking-produtos', async (req, res) => {
  const { data_inicio, data_fim } = req.query;
  if (!data_inicio || !data_fim) {
    return res.status(400).json({ error: "As datas de início e fim são obrigatórias." });
  }
  try {
    // A query foi modificada para:
    // 1. Juntar-se (LEFT JOIN) à tabela 'produtos' usando o nome do produto como chave.
    // 2. Selecionar a coluna 'unidade_medida' da tabela de produtos.
    // 3. Renomear SUM(m.peso) para 'quantidade_vendida' para ter um nome mais genérico.
    // 4. Agrupar também por 'unidade_medida' para garantir a agregação correta.
    const query = `
        SELECT
          m.descricao AS produto_nome,
          SUM(m.valor) AS faturamento_total,
          SUM(m.peso) AS quantidade_vendida, -- Renomeado para clareza
          p.unidade_medida, -- << ADICIONAR ESTA LINHA
          COUNT(m.id) AS transacoes
        FROM movimentacoes AS m
        LEFT JOIN produtos AS p ON m.descricao = p.nome -- << ADICIONAR ESTA LINHA
        WHERE m.tipo = 'ENTRADA' AND m.data BETWEEN $1 AND $2
        GROUP BY m.descricao, p.unidade_medida -- << ATUALIZAR GROUP BY
        ORDER BY faturamento_total DESC;
    `;
    const { rows } = await pool.query(query, [data_inicio, data_fim]);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao gerar ranking de produtos:', err.stack);
    res.status(500).json({ error: "Erro no servidor ao gerar o relatório." });
  }
});

// ======================== FIM DA ALTERAÇÃO =========================


// Rota /ranking-clientes (sem alterações)
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

// Rota /seller-productivity (sem alterações)
router.get('/seller-productivity', async (req, res) => {
  const { data_inicio, data_fim } = req.query;

  if (!data_inicio || !data_fim) {
    return res.status(400).json({ error: "As datas de início e fim são obrigatórias." });
  }

  try {
    const query = `
      SELECT
        u.id AS vendedor_id,
        COALESCE(u.nickname, u.email) AS vendedor_nome,
        COALESCE(SUM(m.valor), 0) AS total_vendas,
        COALESCE(COUNT(m.id), 0) AS numero_vendas,
        COALESCE(AVG(m.valor), 0) AS ticket_medio
      FROM
        utilizadores u
      LEFT JOIN
        movimentacoes m ON u.id = m.responsavel_venda_id
                       AND m.tipo = 'ENTRADA'
                       AND m.data BETWEEN $1 AND $2
      WHERE
        u.perfil = 'USER' OR u.id IN (
          SELECT DISTINCT responsavel_venda_id FROM movimentacoes WHERE responsavel_venda_id IS NOT NULL AND data BETWEEN $1 AND $2
        )
      GROUP BY
        u.id, u.nickname, u.email
      ORDER BY
        total_vendas DESC, vendedor_nome ASC;
    `;
    const { rows } = await pool.query(query, [data_inicio, data_fim]);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao gerar relatório de produtividade de vendedores:', err.stack);
    res.status(500).json({ error: "Erro no servidor ao gerar o relatório de produtividade." });
  }
});

module.exports = router;
