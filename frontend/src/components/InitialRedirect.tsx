// frontend/src/components/InitialRedirect.tsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Este componente não renderiza nada visualmente.
 * Sua única função é verificar o perfil do usuário logado e
 * redirecioná-lo para a página inicial correta.
 */
export function InitialRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se o usuário existe para evitar erros durante o carregamento
    if (user) {
      // Se for ADMIN, vai para o Dashboard.
      if (user.perfil === 'ADMIN') {
        navigate('/dashboard', { replace: true });
      } 
      // Se for qualquer outro perfil (USER), vai para Movimentações.
      else {
        navigate('/movimentacoes', { replace: true });
      }
    }
    // O `replace: true` é importante para que o usuário não possa "voltar" para esta página de redirecionamento.
  }, [user, navigate]); // O efeito é executado sempre que o usuário ou a função de navegação mudam.

  // Retorna null pois este componente não tem interface visual.
  return null;
}
