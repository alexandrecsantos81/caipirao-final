import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import { toast } from 'sonner';

const AUTH_TOKEN_KEY = 'caipirao-auth-token';

// Interface para o payload do token JWT
interface UserPayload {
  id: number;
  email: string;
  perfil: 'ADMIN' | 'USER';
  iat: number;
  exp: number;
}

// Interface para o valor fornecido pelo contexto
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserPayload | null;
  login: (identificador: string, pass: string) => Promise<void>; // Assinatura corrigida
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserPayload | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(false);
  }, []);

  // Função de login atualizada para usar 'identificador'
  const login = async (identificador: string, pass: string) => {
    try {
      // A CORREÇÃO ESTÁ AQUI:
      // O nome da propriedade no objeto deve ser 'identificador', não 'email'.
      const response = await api.post('/auth/login', { identificador: identificador, senha: pass });
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
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
    toast.info('Você foi desconectado.');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
