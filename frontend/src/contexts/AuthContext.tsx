// frontend/src/contexts/AuthContext.tsx

import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import { toast } from 'sonner';

const AUTH_TOKEN_KEY = 'caipirao-auth-token';

interface UserPayload {
  id: number;
  email: string;
  perfil: 'ADMIN' | 'USER';
  iat: number;
  exp: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean; // 1. Adicionar estado de carregamento
  user: UserPayload | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserPayload | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true); // 2. Iniciar como true

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      try {
        const decodedUser = jwtDecode<UserPayload>(token);
        if (decodedUser.exp * 1000 > Date.now()) {
          setUser(decodedUser);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(AUTH_TOKEN_KEY);
        }
      } catch (error) {
        console.error("Falha ao decodificar o token:", error);
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
    // 3. Finalizar o carregamento após a verificação
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    // ... (função de login permanece a mesma)
    try {
      const response = await api.post('/auth/login', { email, senha: pass });
      const { token } = response.data;
      
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      
      const decodedUser = jwtDecode<UserPayload>(token);
      setUser(decodedUser);
      setIsAuthenticated(true);
      
      toast.success('Login realizado com sucesso!');
      navigate('/');

    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Falha no login. Verifique suas credenciais.');
      throw error;
    }
  };

  const logout = useCallback(() => {
    // ... (função de logout permanece a mesma)
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
    toast.info('Você foi desconectado.');
  }, [navigate]);

  // 4. Passar o 'isLoading' no valor do provider
  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
