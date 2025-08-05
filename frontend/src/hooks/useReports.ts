// /frontend/src/hooks/useReports.ts

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { 
  getVendasPorPeriodo, 
  getRankingProdutos, 
  getRankingClientes,
  getAtividadeClientes,
  getSellerProductivity
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

// ======================= INÍCIO DA ALTERAÇÃO =======================
// O parâmetro 'enabled' agora tem o valor padrão 'true' para que os hooks
// sejam ativados por padrão quando chamados no Dashboard.
export function useRankingProdutos({ data_inicio, data_fim, enabled = true }: ReportHookParams) {
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, 'rankingProdutos', { data_inicio, data_fim }],
    queryFn: () => getRankingProdutos({ data_inicio, data_fim }),
    enabled: enabled,
    placeholderData: keepPreviousData,
  });
}

export function useRankingClientes({ data_inicio, data_fim, enabled = true }: ReportHookParams) {
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, 'rankingClientes', { data_inicio, data_fim }],
    queryFn: () => getRankingClientes({ data_inicio, data_fim }),
    enabled: enabled,
    placeholderData: keepPreviousData,
  });
}
// ======================== FIM DA ALTERAÇÃO =========================

export function useAtividadeClientes() {
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, 'atividadeClientes'],
    queryFn: getAtividadeClientes,
    select: (data) => ({
      ativos: parseInt(data.ativos, 10) || 0,
      inativos: parseInt(data.inativos, 10) || 0,
    }),
  });
}

export function useSellerProductivity({ data_inicio, data_fim, enabled = true }: ReportHookParams) {
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, 'sellerProductivity', { data_inicio, data_fim }],
    queryFn: () => getSellerProductivity({ data_inicio, data_fim }),
    enabled: enabled,
    placeholderData: keepPreviousData,
  });
}
