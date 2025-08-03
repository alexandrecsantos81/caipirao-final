// /frontend/src/services/reports.service.ts

import api from './api';

// --- Interfaces ---
export interface VendasPorPeriodoData {
  dia: string;
  total_vendas: string;
  peso_total: string;
  transacoes: string;
}

export interface RankingProdutoData {
  produto_nome: string;
  faturamento_total: string;
  peso_total: string;
  transacoes: string;
}

export interface RankingClienteData {
  cliente_nome: string;
  faturamento_total: string;
  peso_total: string;
  transacoes: string;
}

// NOVA INTERFACE: Define a estrutura dos dados de atividade de clientes
export interface AtividadeClientesData {
  ativos: string;   // A query SQL retorna contagens como strings
  inativos: string; // Vamos converter para número no hook
}

// --- Funções de API ---

export const getVendasPorPeriodo = async ({ data_inicio, data_fim }: { data_inicio: string, data_fim: string }): Promise<VendasPorPeriodoData[]> => {
  const response = await api.get('/api/reports/vendas-por-periodo', { params: { data_inicio, data_fim } });
  return response.data;
};

export const getRankingProdutos = async ({ data_inicio, data_fim }: { data_inicio: string, data_fim: string }): Promise<RankingProdutoData[]> => {
  const response = await api.get('/api/reports/ranking-produtos', { params: { data_inicio, data_fim } });
  return response.data;
};

export const getRankingClientes = async ({ data_inicio, data_fim }: { data_inicio: string, data_fim: string }): Promise<RankingClienteData[]> => {
  const response = await api.get('/api/reports/ranking-clientes', { params: { data_inicio, data_fim } });
  return response.data;
};

/**
 * NOVA FUNÇÃO: Busca a contagem de clientes ativos e inativos da API.
 * @returns Uma promessa que resolve para um objeto com as contagens.
 */
export const getAtividadeClientes = async (): Promise<AtividadeClientesData> => {
  const response = await api.get('/api/reports/atividade-clientes');
  return response.data;
};
