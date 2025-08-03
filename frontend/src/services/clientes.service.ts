// /frontend/src/services/clientes.service.ts

import api from './api';

// Interface completa para o Cliente
export interface Cliente {
  id: number;
  nome: string;
  contato: string;
  nome_responsavel?: string;
  telefone_whatsapp?: boolean;
  logradouro?: string;
  quadra?: string;
  lote?: string;
  bairro?: string;
  cep?: string;
  ponto_referencia?: string;
  status: 'Ativo' | 'Inativo'; // <<< ALTERAÇÃO APLICADA AQUI
}

// Tipo para o payload de criação (sem o 'id' e 'status')
export type CreateClientePayload = Omit<Cliente, 'id' | 'status'>;

// Tipo para o payload de atualização (sem o 'id' e 'status')
export type UpdateClientePayload = Omit<Cliente, 'id' | 'status'>;

// --- Funções da API (sem alteração na lógica) ---

export const getClientes = async (): Promise<Cliente[]> => {
  const response = await api.get('/api/clientes');
  return response.data;
};

export const createCliente = async (data: CreateClientePayload): Promise<Cliente> => {
  const response = await api.post('/api/clientes', data);
  return response.data;
};

export const updateCliente = async ({ id, payload }: { id: number, payload: UpdateClientePayload }): Promise<Cliente> => {
  const response = await api.put(`/api/clientes/${id}`, payload);
  return response.data;
};

export const deleteCliente = async (id: number): Promise<void> => {
  await api.delete(`/api/clientes/${id}`);
};
