import api from './api';

// Interface para a estrutura de um usuário (como recebido da API)
export interface User {
  id: number;
  email: string;
  perfil: 'ADMIN' | 'USER';
  nickname: string | null; // Deve ser string | null
  telefone: string | null; // Deve ser string | null
}

// Tipo para o payload de criação de usuário
export type CreateUserPayload = Omit<User, 'id'> & { senha?: string };

// Tipo para o payload de atualização de usuário
export type UpdateUserPayload = Omit<User, 'id'> & { senha?: string };

// --- Funções da API ---

/**
 * Busca a lista de todos os usuários.
 * @returns Uma promessa que resolve para um array de usuários.
 */
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/api/users');
  return response.data;
};

/**
 * Cria um novo usuário no sistema.
 * @param payload - Os dados do novo usuário (email, senha, perfil).
 * @returns Uma promessa que resolve para o usuário criado.
 */
export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const response = await api.post('/api/users', payload);
  return response.data;
};

/**
 * Atualiza um usuário existente.
 * @param id - O ID do usuário a ser atualizado.
 * @param payload - Os novos dados do usuário.
 * @returns Uma promessa que resolve para o usuário atualizado.
 */
export const updateUser = async ({ id, payload }: { id: number, payload: UpdateUserPayload }): Promise<User> => {
  const response = await api.put(`/api/users/${id}`, payload);
  return response.data;
};

/**
 * Deleta um usuário do sistema.
 * @param id - O ID do usuário a ser deletado.
 */
export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/api/users/${id}`);
};
