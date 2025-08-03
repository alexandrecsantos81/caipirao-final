import React from 'react';
// import { Navigate } from 'react-router-dom'; // Linha removida
import { useAuth } from '../../contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ShieldAlert } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (user?.perfil !== 'ADMIN') {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Acesso Negado</AlertTitle>
          <AlertDescription>
            Você não tem permissão para acessar esta página. Apenas administradores podem visualizar este conteúdo.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
