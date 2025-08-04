// /backend/routes/users.js

const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// ROTA GET - Listar todos os usuários (sem alterações)
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT id, email, perfil, nickname, telefone FROM utilizadores ORDER BY email ASC';
        const todosUtilizadores = await pool.query(query);
        res.json(todosUtilizadores.rows);
    } catch (err) {
        console.error('Erro ao buscar utilizadores:', err.stack);
        res.status(500).json({ error: "Erro no servidor ao buscar utilizadores." });
    }
});

// ROTA POST - Criar um novo usuário (sem alterações)
router.post('/', async (req, res) => {
    const { email, senha, perfil, nickname, telefone } = req.body;

    if (!email || !senha || !perfil) {
        return res.status(400).json({ error: "Email, senha e perfil são obrigatórios." });
    }
    if (!['ADMIN', 'USER'].includes(perfil)) {
        return res.status(400).json({ error: "O perfil deve ser 'ADMIN' ou 'USER'." });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const novoUtilizador = await pool.query(
            "INSERT INTO utilizadores (email, senha_hash, perfil, nickname, telefone) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, perfil, nickname, telefone",
            [email, senhaHash, perfil, nickname || null, telefone || null]
        );

        res.status(201).json(novoUtilizador.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            const constraint = err.constraint || '';
            let campo = 'valor';
            if (constraint.includes('email')) campo = 'e-mail';
            if (constraint.includes('nickname')) campo = 'nickname';
            if (constraint.includes('telefone')) campo = 'telefone';
            return res.status(409).json({ error: `O ${campo} fornecido já está em uso.` });
        }
        console.error('Erro ao criar utilizador:', err.stack);
        res.status(500).json({ error: "Erro no servidor ao criar utilizador." });
    }
});

// ==================================================================
//          INÍCIO DA IMPLEMENTAÇÃO DA NOVA REGRA DE SEGURANÇA
// ==================================================================

// ROTA PUT - Atualizar um usuário existente (MODIFICADA)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { email, perfil, senha, nickname, telefone } = req.body;

    if (!email || !perfil) {
        return res.status(400).json({ error: "Email e perfil são obrigatórios." });
    }
    if (!['ADMIN', 'USER'].includes(perfil)) {
        return res.status(400).json({ error: "O perfil deve ser 'ADMIN' ou 'USER'." });
    }

    try {
        // 1. Verifica se a ação é uma tentativa de rebaixar o último admin
        if (perfil !== 'ADMIN') {
            const userToUpdate = await pool.query('SELECT perfil FROM utilizadores WHERE id = $1', [id]);
            if (userToUpdate.rows.length > 0 && userToUpdate.rows[0].perfil === 'ADMIN') {
                const adminCountResult = await pool.query("SELECT COUNT(*) FROM utilizadores WHERE perfil = 'ADMIN'");
                const adminCount = parseInt(adminCountResult.rows[0].count, 10);

                if (adminCount <= 1) {
                    return res.status(403).json({ error: "Não é possível alterar o perfil do último administrador." });
                }
            }
        }

        // 2. Prossegue com a atualização se a verificação passar
        const fields = ['email = $1', 'perfil = $2', 'nickname = $3', 'telefone = $4'];
        const values = [email, perfil, nickname || null, telefone || null];
        
        if (senha) {
            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(senha, salt);
            fields.push(`senha_hash = $${values.length + 1}`);
            values.push(senhaHash);
        }
        
        values.push(id);

        const query = `UPDATE utilizadores SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING id, email, perfil, nickname, telefone`;
        const utilizadorAtualizado = await pool.query(query, values);

        if (utilizadorAtualizado.rowCount === 0) {
            return res.status(404).json({ error: "Utilizador não encontrado." });
        }
        res.json(utilizadorAtualizado.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            const constraint = err.constraint || '';
            let campo = 'valor';
            if (constraint.includes('email')) campo = 'e-mail';
            if (constraint.includes('nickname')) campo = 'nickname';
            if (constraint.includes('telefone')) campo = 'telefone';
            return res.status(409).json({ error: `O ${campo} fornecido já pertence a outro utilizador.` });
        }
        console.error('Erro ao atualizar utilizador:', err.stack);
        res.status(500).json({ error: "Erro no servidor ao atualizar utilizador." });
    }
});

// ROTA DELETE - Apagar um usuário (MODIFICADA)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    if (parseInt(id, 10) === req.user.id) {
        return res.status(403).json({ error: "Não é permitido apagar o seu próprio utilizador." });
    }

    try {
        // 1. Verifica se o usuário a ser deletado é um administrador
        const userToDelete = await pool.query('SELECT perfil FROM utilizadores WHERE id = $1', [id]);
        if (userToDelete.rows.length > 0 && userToDelete.rows[0].perfil === 'ADMIN') {
            // 2. Se for admin, conta quantos administradores existem
            const adminCountResult = await pool.query("SELECT COUNT(*) FROM utilizadores WHERE perfil = 'ADMIN'");
            const adminCount = parseInt(adminCountResult.rows[0].count, 10);

            // 3. Se for o último, bloqueia a exclusão
            if (adminCount <= 1) {
                return res.status(403).json({ error: "Não é possível remover o último administrador do sistema." });
            }
        }

        // 4. Prossegue com a exclusão se a verificação passar
        const resultadoDelete = await pool.query("DELETE FROM utilizadores WHERE id = $1 RETURNING id, email", [id]);
        if (resultadoDelete.rowCount === 0) {
            return res.status(404).json({ error: "Utilizador não encontrado." });
        }
        res.json({ message: "Utilizador apagado com sucesso." });
    } catch (err) {
        console.error('Erro ao apagar utilizador:', err.stack);
        res.status(500).json({ error: "Erro no servidor ao apagar utilizador." });
    }
});

// ==================================================================
//           FIM DA IMPLEMENTAÇÃO DA NOVA REGRA DE SEGURANÇA
// ==================================================================

module.exports = router;
