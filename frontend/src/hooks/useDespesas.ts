// /frontend/src/hooks/useDespesas.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getDespesas, 
  createDespesa, 
  updateDespesa,
  deleteDespesa,
  CreateDespesaPayload,
  UpdateDespesaPayload
} from '../services/despesas.service';

const DESPESAS_QUERY_KEY = 'despesas';

// ======================= INÍCIO DA CORREÇÃO =======================
// Adicionamos um parâmetro opcional 'options' ao hook.
export function useDespesas(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: [DESPESAS_QUERY_KEY],
    queryFn: getDespesas,
    // A opção 'enabled' recebida é passada para a query.
    // Se nenhuma opção for passada, 'enabled' será true por padrão.
    enabled: options.enabled, 
  });
}
// ======================== FIM DA CORREÇÃO =========================

export function useCreateDespesa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDespesaPayload) => createDespesa(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DESPESAS_QUERY_KEY] });
    },
  });
}

export function useUpdateDespesa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number, payload: UpdateDespesaPayload }) => updateDespesa({ id, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DESPESAS_QUERY_KEY] });
    },
  });
}

export function useDeleteDespesa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteDespesa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DESPESAS_QUERY_KEY] });
    },
  });
}
