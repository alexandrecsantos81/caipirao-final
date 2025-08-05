import api from './api';

// Interface que define a estrutura de um Produto
export interface Produto {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  unidade_medida: string | null; // <<< ADICIONE ESTA LINHA
}

// Tipo para o payload de criação (sem o 'id')
// Adicionar 'unidade_medida' aqui também
export type CreateProdutoPayload = Omit<Produto, 'id' | 'descricao'> & {
  unidade_medida: string;
  descricao: string | null;
};

// Tipo para o payload de atualização (também sem o 'id')
// Adicionar 'unidade_medida' aqui também
export type UpdateProdutoPayload = Omit<Produto, 'id' | 'descricao'> & {
  unidade_medida: string;
  descricao: string | null;
};

// --- Funções da API (sem alteração na lógica) ---

export const getProdutos = async (): Promise<Produto[]> => {
  const response = await api.get('/api/produtos');
  return response.data;
};

export const createProduto = async (payload: CreateProdutoPayload): Promise<Produto> => {
  const response = await api.post('/api/produtos', payload);
  return response.data;
};

export const updateProduto = async ({ id, payload }: { id: number, payload: UpdateProdutoPayload }): Promise<Produto> => {
  const response = await api.put(`/api/produtos/${id}`, payload);
  return response.data;
};

export const deleteProduto = async (id: number): Promise<void> => {
  await api.delete(`/api/produtos/${id}`);
};
