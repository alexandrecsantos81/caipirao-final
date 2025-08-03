// frontend/src/components/guards/AuthGuard.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Skeleton } from '../ui/skeleton'; // Importar um componente de loader

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  // 1. Obter 'isAuthenticated' e o novo 'isLoading'
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 2. Se estiver carregando, mostrar um loader (ou tela em branco)
  if (isLoading) {
    // Isso impede o redirecionamento prematuro
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="w-full max-w-md space-y-4 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // 3. Se não estiver carregando E não estiver autenticado, redirecionar
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. Se não estiver carregando E estiver autenticado, mostrar o conteúdo
  return <>{children}</>;
}
