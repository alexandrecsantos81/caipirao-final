// /frontend/src/hooks/useReports.ts

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { 
  getVendasPorPeriodo, 
  getRankingProdutos, 
  getRankingClientes,
  getAtividadeClientes,
  getSellerProductivity // Importa a nova função de serviço
} from '../services/reports.service';

// Chave base para todas as queries de relatórios, para facilitar a invalidação em cache.
const REPORTS_QUERY_KEY = 'reports';

// Interface para os parâmetros dos hooks que dependem de um período.
interface ReportHookParams {
  data_inicio: string;
  data_fim: string;
  enabled?: boolean; // Parâmetro opcional para controlar a execução da query.
}

/**
 * Hook para buscar dados de vendas consolidados por dia.
 * @param params - Objeto com data_inicio, data_fim e enabled.
 */
export function useVendasPorPeriodo({ data_inicio, data_fim, enabled = true }: ReportHookParams) {
  return useQuery({
    // A chave da query inclui os parâmetros para que o React Query refaça a busca quando eles mudarem.
    queryKey: [REPORTS_QUERY_KEY, 'vendasPorPeriodo', { data_inicio, data_fim }],
    queryFn: () => getVendasPorPeriodo({ data_inicio, data_fim }),
    enabled: enabled, // A query só será executada se 'enabled' for true.
    placeholderData: keepPreviousData, // Mantém os dados antigos enquanto novos são carregados.
  });
}

/**
 * Hook para buscar o ranking de produtos mais vendidos.
 * @param params - Objeto com data_inicio, data_fim e enabled.
 */
export function useRankingProdutos({ data_inicio, data_fim, enabled = false }: ReportHookParams) {
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, 'rankingProdutos', { data_inicio, data_fim }],
    queryFn: () => getRankingProdutos({ data_inicio, data_fim }),
    enabled: enabled,
    placeholderData: keepPreviousData,
  });
}

/**
 * Hook para buscar o ranking de clientes que mais compraram.
 * @param params - Objeto com data_inicio, data_fim e enabled.
 */
export function useRankingClientes({ data_inicio, data_fim, enabled = false }: ReportHookParams) {
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, 'rankingClientes', { data_inicio, data_fim }],
    queryFn: () => getRankingClientes({ data_inicio, data_fim }),
    enabled: enabled,
    placeholderData: keepPreviousData,
  });
}

/**
 * Hook para buscar a contagem de clientes ativos e inativos.
 */
export function useAtividadeClientes() {
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, 'atividadeClientes'],
    queryFn: getAtividadeClientes,
    // Transforma os dados recebidos (string) para número antes de disponibilizá-los.
    select: (data) => ({
      ativos: parseInt(data.ativos, 10) || 0,
      inativos: parseInt(data.inativos, 10) || 0,
    }),
  });
}

/**
 * NOVO HOOK: Hook para buscar os dados de produtividade dos vendedores.
 * @param params - Objeto com data_inicio, data_fim e enabled.
 */
export function useSellerProductivity({ data_inicio, data_fim, enabled = true }: ReportHookParams) {
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, 'sellerProductivity', { data_inicio, data_fim }],
    queryFn: () => getSellerProductivity({ data_inicio, data_fim }),
    enabled: enabled,
    placeholderData: keepPreviousData,
  });
}
