// /backend/routes/movimentacoes.js

const express = require('express');
const router = express.Router();
const pool = require('../db');

// ROTA GET (Leitura) - Listar todas as VENDAS (CORREÇÃO FINAL)
router.get('/', async (req, res) => {
    try {
        // A query agora usa COALESCE para priorizar o nickname sobre o email.
        // A junção com utilizadores (vendedores) está correta.
        const query = `
            SELECT
                m.id,
                m.data AS data_venda,
                m.descricao AS produto_nome,
                m.valor AS valor_total,
                m.cliente_id,
                m.peso,
                m.data_pagamento,
                m.data_vencimento,
                m.preco_manual,
                m.responsavel_venda_id,
                c.nome AS cliente_nome,
                COALESCE(u.nickname, u.email) AS responsavel_venda_nome
            FROM movimentacoes AS m
            LEFT JOIN clientes AS c ON m.cliente_id = c.id
            LEFT JOIN utilizadores AS u ON m.responsavel_venda_id = u.id
            WHERE m.tipo = 'ENTRADA'
            ORDER BY m.data DESC, m.id DESC;
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Erro detalhado ao buscar vendas:', err.stack);
        res.status(500).json({ error: "Erro no servidor ao buscar vendas." });
    }
});

// ROTA POST (Criação) - (CORREÇÃO FINAL)
router.post('/', async (req, res) => {
    // Adicionamos responsavel_venda_id à desestruturação
    const { cliente_id, produto_nome, data_venda, valor_total, peso_produto, data_pagamento, data_vencimento, preco_manual, responsavel_venda_id } = req.body;
    
    // Tornamos responsavel_venda_id obrigatório
    if (!cliente_id || !produto_nome || !data_venda || !valor_total || !responsavel_venda_id) {
        return res.status(400).json({ error: "Cliente, produto, data, valor e vendedor responsável são obrigatórios." });
    }
    try {
        const novaVenda = await pool.query(
            `INSERT INTO movimentacoes (tipo, cliente_id, descricao, data, valor, categoria, peso, data_pagamento, data_vencimento, preco_manual, responsavel_venda_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            // Passamos responsavel_venda_id para a query
            ['ENTRADA', cliente_id, produto_nome, data_venda, valor_total, 'VENDA', peso_produto || null, data_pagamento || null, data_vencimento || null, preco_manual || null, responsavel_venda_id]
        );
        res.status(201).json(novaVenda.rows[0]);
    } catch (err) {
        console.error('Erro ao criar venda:', err.stack);
        res.status(500).json({ error: "Erro no servidor ao criar a venda." });
    }
});

// ROTA PUT (Atualização) - (CORREÇÃO FINAL)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Adicionamos responsavel_venda_id à desestruturação
        const { cliente_id, produto_nome, data_venda, valor_total, peso_produto, data_pagamento, data_vencimento, preco_manual, responsavel_venda_id } = req.body;
        
        // Tornamos responsavel_venda_id obrigatório
        if (!cliente_id || !produto_nome || !data_venda || !valor_total || !responsavel_venda_id) {
            return res.status(400).json({ error: "Todos os campos principais são obrigatórios." });
        }
        const vendaAtualizada = await pool.query(
            `UPDATE movimentacoes SET
                cliente_id = $1, descricao = $2, data = $3, valor = $4, peso = $5,
                data_pagamento = $6, data_vencimento = $7, preco_manual = $8, responsavel_venda_id = $9
             WHERE id = $10 AND tipo = 'ENTRADA' RETURNING *`,
            // Passamos responsavel_venda_id para a query de atualização
            [cliente_id, produto_nome, data_venda, valor_total, peso_produto || null, data_pagamento || null, data_vencimento || null, preco_manual || null, responsavel_venda_id, id]
        );
        if (vendaAtualizada.rowCount === 0) {
            return res.status(404).json({ error: "Venda não encontrada para atualização." });
        }
        res.json(vendaAtualizada.rows[0]);
    } catch (err) {
        console.error('Erro ao atualizar venda:', err.stack);
        res.status(500).json({ error: "Erro no servidor ao atualizar a venda." });
    }
});

// Rota DELETE (sem alterações)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultadoDelete = await pool.query("DELETE FROM movimentacoes WHERE id = $1 AND tipo = 'ENTRADA' RETURNING *", [id]);
        if (resultadoDelete.rowCount === 0) {
            return res.status(404).json({ error: "Venda não encontrada para exclusão." });
        }
        res.json({ message: "Venda apagada com sucesso." });
    } catch (err) {
        console.error('Erro ao apagar venda:', err.stack);
        res.status(500).json({ error: "Erro no servidor ao apagar a venda." });
    }
});

module.exports = router;
