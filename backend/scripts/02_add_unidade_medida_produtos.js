require('dotenv').config({ path: '../.env' });
const pool = require('../db');

async function runMigration() {
  console.log('🚀 Iniciando migração: Adicionar unidade_medida...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Adiciona a coluna com um valor padrão 'kg' para os produtos existentes
    await client.query(`
      ALTER TABLE produtos
      ADD COLUMN IF NOT EXISTS unidade_medida VARCHAR(10) NOT NULL DEFAULT 'kg';
    `);
    await client.query('COMMIT');
    console.log('✅ Migração concluída: Coluna "unidade_medida" adicionada.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('💥 Erro na migração:', error);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

runMigration();
