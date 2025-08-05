import api from './api';

// --- Interfaces de Dados para os Relatórios ---

export interface VendasPorPeriodoData {
  dia: string;
  total_vendas: string;
  peso_total: string;
  transacoes: string;
}

// ======================= INÍCIO DA ALTERAÇÃO =======================
// A interface foi atualizada para corresponder à nova resposta da API
export interface RankingProdutoData {
  produto_nome: string;
  unidade_medida: string; // 1. Adicionado o campo para a unidade de medida
  faturamento_total: string;
  quantidade_vendida: string; // 2. Renomeado de 'peso_total' para um nome mais genérico
  transacoes: string;
}
// ======================== FIM DA ALTERAÇÃO =========================

export interface RankingClienteData {
  cliente_nome: string;
  faturamento_total: string;
  peso_total: string;
  transacoes: string;
}

export interface AtividadeClientesData {
  ativos: string;
  inativos: string;
}

export interface SellerProductivityData {
  vendedor_id: number;
  vendedor_nome: string;
  total_vendas: string;
  numero_vendas: string;
  ticket_medio: string;
}


// --- Funções de Chamada à API (sem alteração na lógica) ---

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

export const getAtividadeClientes = async (): Promise<AtividadeClientesData> => {
  const response = await api.get('/api/reports/atividade-clientes');
  return response.data;
};

export const getSellerProductivity = async ({ data_inicio, data_fim }: { data_inicio: string, data_fim: string }): Promise<SellerProductivityData[]> => {
  const response = await api.get('/api/reports/seller-productivity', { params: { data_inicio, data_fim } });
  return response.data;
};
