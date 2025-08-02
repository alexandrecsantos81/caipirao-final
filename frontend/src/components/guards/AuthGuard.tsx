import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Se o usuário não estiver autenticado...
  if (!isAuthenticated) {
    // ...redireciona para a página de login.
    // O 'state' é usado para guardar a página que o usuário tentou acessar,
    // permitindo que ele seja redirecionado de volta para lá após o login.
    // 'replace' substitui a entrada atual no histórico de navegação.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se o usuário estiver autenticado, renderiza os componentes filhos (a rota protegida).
  return <>{children}</>;
}
