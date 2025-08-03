import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  CreateUserPayload,
  UpdateUserPayload
} from '../services/users.service';

// Chave única para a query de usuários no cache do React Query
const USERS_QUERY_KEY = 'users';

/**
 * Hook para buscar a lista de todos os usuários.
 */
export function useUsers() {
  return useQuery({
    queryKey: [USERS_QUERY_KEY],
    queryFn: getUsers,
  });
}

/**
 * Hook para criar um novo usuário.
 */
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      // Invalida a query de usuários para forçar a atualização da lista
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}

/**
 * Hook para atualizar um usuário existente.
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number, payload: UpdateUserPayload }) => updateUser({ id, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}

/**
 * Hook para deletar um usuário.
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}
