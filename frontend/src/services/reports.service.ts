// frontend/src/services/reports.service.ts

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

interface ReportParams {
  data_inicio: string;
  data_fim: string;
}

// --- Funções de API ---

export const getVendasPorPeriodo = async ({ data_inicio, data_fim }: ReportParams): Promise<VendasPorPeriodoData[]> => {
  const response = await api.get('/api/reports/vendas-por-periodo', { params: { data_inicio, data_fim } });
  return response.data;
};

export const getRankingProdutos = async ({ data_inicio, data_fim }: ReportParams): Promise<RankingProdutoData[]> => {
  const response = await api.get('/api/reports/ranking-produtos', { params: { data_inicio, data_fim } });
  return response.data;
};

export const getRankingClientes = async ({ data_inicio, data_fim }: ReportParams): Promise<RankingClienteData[]> => {
  const response = await api.get('/api/reports/ranking-clientes', { params: { data_inicio, data_fim } });
  return response.data;
};
