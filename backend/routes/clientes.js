// /backend/routes/clientes.js

const express = require("express");
const db = require("../db.js"); // Garante que a conexão com o banco de dados seja importada
const router = express.Router();

// ROTA GET - Listar todos os clientes COM STATUS DE ATIVIDADE
router.get("/", (_, res) => {
  // ======================= INÍCIO DA ALTERAÇÃO =======================
  // Esta query foi modificada para incluir uma coluna 'status' calculada.
  // Para cada cliente, ela executa uma subquery que encontra a data máxima (última compra)
  // na tabela de movimentações onde o tipo é 'ENTRADA'.
  // O CASE então compara essa data com a data atual para definir o status.
  const q = `
    SELECT
      c.id,
      c.nome,
      c.contato,
      c.nome_responsavel,
      c.telefone_whatsapp,
      c.logradouro,
      c.quadra,
      c.lote,
      c.bairro,
      c.cep,
      c.ponto_referencia,
      CASE
        WHEN (
          SELECT MAX(data) 
          FROM movimentacoes 
          WHERE cliente_id = c.id AND tipo = 'ENTRADA'
        ) >= (CURRENT_DATE - INTERVAL '90 days')
        THEN 'Ativo'
        ELSE 'Inativo'
      END AS status
    FROM
      clientes c
    ORDER BY
      c.nome ASC;
  `;
  // ======================== FIM DA ALTERAÇÃO =========================

  db.query(q, (err, data) => {
    // Tratamento de erro padrão
    if (err) {
      console.error("ERRO AO BUSCAR CLIENTES NO BANCO DE DADOS:", err);
      return res.status(500).json({ message: "Erro interno do servidor ao consultar o banco de dados." });
    }
    
    // Retorna a lista de clientes, agora com o campo 'status' em cada objeto
    const clientes = data && data.rows ? data.rows : [];
    return res.status(200).json(clientes);
  });
});

// ROTA POST - Criar um novo cliente (sem alterações)
router.post("/", (req, res) => {
  const q =
    "INSERT INTO clientes(nome, contato, nome_responsavel, telefone_whatsapp, logradouro, quadra, lote, bairro, cep, ponto_referencia) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)";
  const values = [
    req.body.nome, req.body.contato, req.body.nome_responsavel,
    req.body.telefone_whatsapp, req.body.logradouro, req.body.quadra,
    req.body.lote, req.body.bairro, req.body.cep, req.body.ponto_referencia,
  ];
  db.query(q, values, (err) => {
    if (err) {
      console.error("Erro na rota POST /clientes:", err);
      return res.status(500).json("Ocorreu um erro ao cadastrar o cliente.");
    }
    return res.status(201).json("Cliente cadastrado com sucesso.");
  });
});

// ROTA PUT - Atualizar um cliente existente (sem alterações)
router.put("/:id", (req, res) => {
  const q =
    "UPDATE clientes SET nome = $1, contato = $2, nome_responsavel = $3, telefone_whatsapp = $4, logradouro = $5, quadra = $6, lote = $7, bairro = $8, cep = $9, ponto_referencia = $10 WHERE id = $11";
  const values = [
    req.body.nome, req.body.contato, req.body.nome_responsavel,
    req.body.telefone_whatsapp, req.body.logradouro, req.body.quadra,
    req.body.lote, req.body.bairro, req.body.cep, req.body.ponto_referencia,
    req.params.id,
  ];
  db.query(q, values, (err) => {
    if (err) {
      console.error("Erro na rota PUT /clientes:", err);
      return res.status(500).json("Ocorreu um erro ao atualizar o cliente.");
    }
    return res.status(200).json("Cliente atualizado com sucesso.");
  });
});

// ROTA DELETE - Deletar um cliente (sem alterações)
router.delete("/:id", (req, res) => {
  const q = "DELETE FROM clientes WHERE id = $1";
  db.query(q, [req.params.id], (err) => {
    if (err) {
      console.error("Erro na rota DELETE /clientes:", err);
      return res.status(500).json("Ocorreu um erro ao deletar o cliente.");
    }
    return res.status(200).json("Cliente deletado com sucesso.");
  });
});

module.exports = router;
