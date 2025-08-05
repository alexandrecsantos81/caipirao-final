import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getProdutos, 
  createProduto, 
  updateProduto,
  deleteProduto,
  CreateProdutoPayload,
  UpdateProdutoPayload
} from '../services/produtos.service';

const PRODUTOS_QUERY_KEY = 'produtos';

export function useProdutos() {
  return useQuery({
    queryKey: [PRODUTOS_QUERY_KEY],
    queryFn: getProdutos,
  });
}

export function useCreateProduto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProdutoPayload) => createProduto(payload),
    onSuccess: () => {
      // Invalida tanto a lista de produtos quanto os relatórios
      return queryClient.invalidateQueries({ queryKey: [PRODUTOS_QUERY_KEY] });
    },
  });
}

export function useUpdateProduto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number, payload: UpdateProdutoPayload }) => updateProduto({ id, payload }),
    onSuccess: () => {
      // ======================= INÍCIO DA CORREÇÃO =======================
      // Ao atualizar um produto, também invalidamos as queries de relatórios.
      // Isso força a página de relatórios a buscar os dados novamente com as unidades corretas.
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: [PRODUTOS_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: ['reports'] }) // Invalida todas as queries de relatórios
      ]);
      // ======================== FIM DA CORREÇÃO =========================
    },
  });
}

export function useDeleteProduto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProduto(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: [PRODUTOS_QUERY_KEY] });
    },
  });
}
