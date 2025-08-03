// /frontend/src/hooks/useReports.ts

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { 
  getVendasPorPeriodo, 
  getRankingProdutos, 
  getRankingClientes,
  getAtividadeClientes // 1. Importar a nova função de serviço
} from '../services/reports.service';

const REPORTS_QUERY_KEY = 'reports';

interface ReportHookParams {
  data_inicio: string;
  data_fim: string;
  enabled?: boolean;
}

export function useVendasPorPeriodo({ data_inicio, data_fim, enabled = true }: ReportHookParams) {
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, 'vendasPorPeriodo', { data_inicio, data_fim }],
    queryFn: () => getVendasPorPeriodo({ data_inicio, data_fim }),
    enabled: enabled,
    placeholderData: keepPreviousData,
  });
}

export function useRankingProdutos({ data_inicio, data_fim, enabled = false }: ReportHookParams) {
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, 'rankingProdutos', { data_inicio, data_fim }],
    queryFn: () => getRankingProdutos({ data_inicio, data_fim }),
    enabled: enabled,
    placeholderData: keepPreviousData,
  });
}

export function useRankingClientes({ data_inicio, data_fim, enabled = false }: ReportHookParams) {
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, 'rankingClientes', { data_inicio, data_fim }],
    queryFn: () => getRankingClientes({ data_inicio, data_fim }),
    enabled: enabled,
    placeholderData: keepPreviousData,
  });
}

/**
 * NOVO HOOK: Hook para buscar e gerenciar os dados de atividade de clientes.
 */
export function useAtividadeClientes() {
  return useQuery({
    // Chave de query única para este dado
    queryKey: [REPORTS_QUERY_KEY, 'atividadeClientes'],
    // Função que será executada para buscar os dados
    queryFn: getAtividadeClientes,
    // Transforma os dados recebidos (string) para número antes de disponibilizá-los
    select: (data) => ({
      ativos: parseInt(data.ativos, 10) || 0,
      inativos: parseInt(data.inativos, 10) || 0,
    }),
  });
}
