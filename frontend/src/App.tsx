// frontend/src/App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Outlet } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Importe seus providers e componentes
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeProvider';
import { AuthGuard } from './components/guards/AuthGuard';
import { AdminGuard } from './components/guards/AdminGuard';
import LayoutPrincipal from './components/LayoutPrincipal';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Movimentacoes from './pages/Movimentacoes';
import Produtos from './pages/Produtos';
import RelatoriosPage from './pages/RelatoriosPage';
import Vendedores from './pages/Vendedores';
import Usuarios from './pages/Usuarios';
import { InitialRedirect } from './components/InitialRedirect'; // 1. IMPORTAR O NOVO COMPONENTE

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="system" storageKey="caipirao-ui-theme">
        <Router>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                  path="/*"
                  element={
                    <AuthGuard>
                      <LayoutPrincipal>
                        <Routes>
                          {/* Rotas para todos os usuários */}
                          <Route path="/movimentacoes" element={<Movimentacoes />} />
                          <Route path="/clientes" element={<Clientes />} />
                          <Route path="/produtos" element={<Produtos />} />

                          {/* Rotas exclusivas para ADMIN */}
                          <Route element={<AdminGuard><Outlet/></AdminGuard>}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/vendedores" element={<Vendedores />} />
                            <Route path="/relatorios" element={<RelatoriosPage />} />
                            <Route path="/usuarios" element={<Usuarios />} />
                          </Route>
                          
                          {/* 2. USAR O COMPONENTE DE REDIRECIONAMENTO NA ROTA RAIZ */}
                          <Route path="/" element={<InitialRedirect />} />
                        </Routes>
                      </LayoutPrincipal>
                    </AuthGuard>
                  }
                />
              </Routes>
            </AuthProvider>
          </QueryClientProvider>
        </Router>
        
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
      </ThemeProvider>
    </>
  );
}

export default App;
