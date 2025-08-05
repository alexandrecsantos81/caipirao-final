// /frontend/src/services/movimentacoes.service.ts
import api from './api';

/**
 * Interface que define a estrutura de uma Venda, como recebida da API.
 */
export interface Venda {
  id: number;
  data_venda: string;
  produto_nome: string;
  valor_total: number;
  cliente_nome: string;
  cliente_id: number;
  peso: number | null;
  data_pagamento: string | null;
  data_vencimento: string | null;
  preco_manual: number | null;
  responsavel_venda_id: number | null;
  responsavel_venda_nome: string | null; // Recebe o nickname ou email do vendedor
  unidade_medida: 'kg' | 'un' | null;
}

/**
 * Tipo para o payload de criação de uma nova venda.
 */
export type CreateMovimentacaoPayload = {
  cliente_id: number;
  produto_nome: string;
  data_venda: string;
  data_pagamento: string | null;
  data_vencimento: string | null;
  peso_produto: number | null;
  valor_total: number;
  preco_manual: number | null;
  responsavel_venda_id: number; // Envia o ID do vendedor
};

/**
 * Tipo para o payload de atualização de uma venda.
 */
export type UpdateMovimentacaoPayload = CreateMovimentacaoPayload;

/**
 * Busca a lista de todas as vendas (movimentações de entrada).
 * @returns Uma promessa que resolve para um array de Vendas.
 */
export async function getMovimentacoes(): Promise<Venda[]> {
  const response = await api.get('/api/movimentacoes');
  return response.data;
}

/**
 * Cria uma nova venda no sistema.
 * @param data - O payload com os dados da nova venda.
 * @returns Uma promessa que resolve para a Venda criada.
 */
export async function createMovimentacao(data: CreateMovimentacaoPayload): Promise<Venda> {
  const response = await api.post('/api/movimentacoes', data);
  return response.data;
}

/**
 * Atualiza uma venda existente.
 * @param id - O ID da venda a ser atualizada.
 * @param payload - Os novos dados da venda.
 * @returns Uma promessa que resolve para a Venda atualizada.
 */
export async function updateMovimentacao({ id, payload }: { id: number, payload: UpdateMovimentacaoPayload }): Promise<Venda> {
  const response = await api.put(`/api/movimentacoes/${id}`, payload);
  return response.data;
}

/**
 * Deleta uma venda do sistema.
 * @param id - O ID da venda a ser deletada.
 */
export async function deleteMovimentacao(id: number): Promise<void> {
  await api.delete(`/api/movimentacoes/${id}`);
}
