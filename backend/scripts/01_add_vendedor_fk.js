// backend/scripts/01_add_vendedor_fk.js

require('dotenv').config({ path: '../.env' }); // Garante que o .env na raiz do backend seja lido
const pool = require('../db'); // Reutiliza nossa conexão com o banco

async function runMigration() {
  console.log('🚀 Iniciando migração: Adicionar coluna e chave estrangeira para vendedor...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Inicia uma transação

    // 1. Adiciona a coluna, se ela não existir.
    console.log('   - Adicionando coluna "responsavel_venda_id"...');
    await client.query('ALTER TABLE movimentacoes ADD COLUMN IF NOT EXISTS responsavel_venda_id INTEGER;');

    // 2. Remove a constraint antiga para evitar conflitos.
    console.log('   - Removendo constraint "fk_responsavel_venda" antiga (se existir)...');
    await client.query('ALTER TABLE movimentacoes DROP CONSTRAINT IF EXISTS fk_responsavel_venda;');

    // 3. Adiciona a nova constraint de chave estrangeira.
    console.log('   - Adicionando nova constraint "fk_responsavel_venda"...');
    await client.query(`
      ALTER TABLE movimentacoes
      ADD CONSTRAINT fk_responsavel_venda
      FOREIGN KEY (responsavel_venda_id)
      REFERENCES utilizadores(id)
      ON DELETE SET NULL;
    `);
    
    // 4. (Opcional, mas recomendado) Remove a coluna de texto antiga.
    console.log('   - Removendo coluna de texto antiga "responsavel"...');
    await client.query('ALTER TABLE movimentacoes DROP COLUMN IF EXISTS responsavel;');

    await client.query('COMMIT'); // Confirma todas as alterações
    console.log('✅ Migração concluída com sucesso!');

  } catch (error) {
    await client.query('ROLLBACK'); // Desfaz tudo em caso de erro
    console.error('💥 Erro crítico durante a migração. Nenhuma alteração foi salva.');
    console.error(error);
    process.exit(1); // Encerra o script com um código de erro
  } finally {
    client.release(); // Libera a conexão
    pool.end(); // Fecha o pool de conexões
    console.log('🔌 Conexão com o banco de dados encerrada.');
  }
}

runMigration();
