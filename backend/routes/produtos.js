const express = require('express');
const router = express.Router();
const pool = require('../db'); // Reutiliza a conexão com o banco de dados

// ROTA GET (Leitura) - Para buscar todos os produtos com a unidade de medida
// GET /api/produtos/
router.get('/', async (req, res) => {
    try {
        // A query agora também seleciona a coluna 'unidade_medida'.
        const todosProdutos = await pool.query(
            "SELECT id, nome, descricao, preco, unidade_medida FROM produtos ORDER BY nome ASC"
        );

        // Retorna os resultados como JSON
        res.json(todosProdutos.rows);

    } catch (err) {
        console.error('Erro ao buscar produtos:', err.message);
        res.status(500).json({ error: "Erro no servidor ao buscar produtos." });
    }
});

// ROTA POST (Criação) - Para adicionar um novo produto com unidade de medida
// POST /api/produtos/
router.post('/', async (req, res) => {
    try {
        // 1. Extrai 'unidade_medida' do corpo da requisição.
        const { nome, descricao, preco, unidade_medida } = req.body;

        // 2. Validação: verifica se nome, preço e unidade de medida foram fornecidos.
        if (!nome || !preco || !unidade_medida) {
            return res.status(400).json({ error: "Os campos 'nome', 'preco' e 'unidade_medida' são obrigatórios." });
        }

        // 3. Executa a query de inserção, incluindo o novo campo.
        const novoProduto = await pool.query(
            "INSERT INTO produtos (nome, descricao, preco, unidade_medida) VALUES ($1, $2, $3, $4) RETURNING *",
            [nome, descricao, preco, unidade_medida]
        );

        // 4. Retorna o produto recém-criado.
        res.status(201).json(novoProduto.rows[0]);

    } catch (err) {
        console.error('Erro ao criar produto:', err.message);
        res.status(500).json({ error: "Erro no servidor ao criar produto." });
    }
});

// ROTA PUT (Atualização) - Para editar um produto existente com unidade de medida
// PUT /api/produtos/:id
router.put('/:id', async (req, res) => {
    try {
        // 1. Extrai o ID e os novos dados, incluindo 'unidade_medida'.
        const { id } = req.params;
        const { nome, descricao, preco, unidade_medida } = req.body;

        // 2. Validação: verifica se os campos obrigatórios foram fornecidos.
        if (!nome || preco === null || preco === undefined || !unidade_medida) {
            return res.status(400).json({ error: "Os campos 'nome', 'preco' e 'unidade_medida' são obrigatórios." });
        }

        // 3. Executa a query de atualização, incluindo o novo campo.
        const produtoAtualizado = await pool.query(
            "UPDATE produtos SET nome = $1, descricao = $2, preco = $3, unidade_medida = $4 WHERE id = $5 RETURNING *",
            [nome, descricao, preco, unidade_medida, id]
        );

        // 4. Verifica se a atualização realmente aconteceu.
        if (produtoAtualizado.rowCount === 0) {
            return res.status(404).json({ error: "Produto não encontrado." });
        }

        // 5. Retorna o produto com os dados atualizados.
        res.json(produtoAtualizado.rows[0]);

    } catch (err) {
        console.error('Erro ao atualizar produto:', err.message);
        res.status(500).json({ error: "Erro no servidor ao atualizar produto." });
    }
});

// ROTA DELETE (Exclusão) - Não precisa de alterações, continua funcionando como antes.
// DELETE /api/produtos/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultadoDelete = await pool.query(
            "DELETE FROM produtos WHERE id = $1 RETURNING *",
            [id]
        );

        if (resultadoDelete.rowCount === 0) {
            return res.status(404).json({ error: "Produto não encontrado." });
        }

        res.json({ 
            message: "Produto apagado com sucesso.",
            produto: resultadoDelete.rows[0] 
        });

    } catch (err) {
        console.error('Erro ao apagar produto:', err.message);
        res.status(500).json({ error: "Erro no servidor ao apagar produto." });
    }
});

module.exports = router; // Exporta o roteador para ser usado no server.js
