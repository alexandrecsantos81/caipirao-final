// /frontend/src/services/reports.service.ts

import api from './api';

// --- Interfaces de Dados para os Relatórios ---

// Interface para os dados do relatório de vendas diárias
export interface VendasPorPeriodoData {
  dia: string;
  total_vendas: string;
  peso_total: string;
  transacoes: string;
}

// Interface para os dados do ranking de produtos
export interface RankingProdutoData {
  produto_nome: string;
  faturamento_total: string;
  peso_total: string;
  transacoes: string;
}

// Interface para os dados do ranking de clientes
export interface RankingClienteData {
  cliente_nome: string;
  faturamento_total: string;
  peso_total: string;
  transacoes: string;
}

// Interface para os dados de atividade de clientes (ativos vs. inativos)
export interface AtividadeClientesData {
  ativos: string;
  inativos: string;
}

// NOVA INTERFACE: Define a estrutura dos dados de produtividade do vendedor
export interface SellerProductivityData {
  vendedor_id: number;
  vendedor_nome: string; // << ALTERAÇÃO DE 'vendedor_email' PARA 'vendedor_nome'
  total_vendas: string;
  numero_vendas: string;
  ticket_medio: string;
}


// --- Funções de Chamada à API ---

/**
 * Busca os dados de vendas consolidados por dia dentro de um período.
 * @param params - Objeto com data_inicio e data_fim.
 * @returns Uma promessa que resolve para um array de dados de vendas por período.
 */
export const getVendasPorPeriodo = async ({ data_inicio, data_fim }: { data_inicio: string, data_fim: string }): Promise<VendasPorPeriodoData[]> => {
  const response = await api.get('/api/reports/vendas-por-periodo', { params: { data_inicio, data_fim } });
  return response.data;
};

/**
 * Busca o ranking de produtos mais vendidos por faturamento em um período.
 * @param params - Objeto com data_inicio e data_fim.
 * @returns Uma promessa que resolve para um array com o ranking de produtos.
 */
export const getRankingProdutos = async ({ data_inicio, data_fim }: { data_inicio: string, data_fim: string }): Promise<RankingProdutoData[]> => {
  const response = await api.get('/api/reports/ranking-produtos', { params: { data_inicio, data_fim } });
  return response.data;
};

/**
 * Busca o ranking de clientes que mais compraram em um período.
 * @param params - Objeto com data_inicio e data_fim.
 * @returns Uma promessa que resolve para um array com o ranking de clientes.
 */
export const getRankingClientes = async ({ data_inicio, data_fim }: { data_inicio: string, data_fim: string }): Promise<RankingClienteData[]> => {
  const response = await api.get('/api/reports/ranking-clientes', { params: { data_inicio, data_fim } });
  return response.data;
};

/**
 * Busca a contagem de clientes ativos e inativos da API.
 * @returns Uma promessa que resolve para um objeto com as contagens.
 */
export const getAtividadeClientes = async (): Promise<AtividadeClientesData> => {
  const response = await api.get('/api/reports/atividade-clientes');
  return response.data;
};

/**
 * NOVA FUNÇÃO: Busca os dados de produtividade dos vendedores em um período.
 * @param params - Objeto com data_inicio e data_fim.
 * @returns Uma promessa que resolve para um array com os dados de produtividade de cada vendedor.
 */
export const getSellerProductivity = async ({ data_inicio, data_fim }: { data_inicio: string, data_fim: string }): Promise<SellerProductivityData[]> => {
  const response = await api.get('/api/reports/seller-productivity', { params: { data_inicio, data_fim } });
  return response.data;
};
