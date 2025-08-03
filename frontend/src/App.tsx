// frontend/src/App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Importe seus providers e componentes
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeProvider';
import { AuthGuard } from './components/guards/AuthGuard';
// CORREÇÃO APLICADA AQUI: Removidas as chaves da importação
import LayoutPrincipal from './components/LayoutPrincipal'; 
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Movimentacoes from './pages/Movimentacoes';
import Produtos from './pages/Produtos';
import RelatoriosPage from './pages/RelatoriosPage';
import Vendedores from './pages/Vendedores';

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="system" storageKey="caipirao-ui-theme">
        <Router>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <Routes>
                {/* A rota de Login é pública e não é protegida pelo AuthGuard */}
                <Route path="/login" element={<Login />} />

                {/* Envolver a rota do LayoutPrincipal com o AuthGuard */}
                <Route
                  path="/*" // Captura todas as outras rotas
                  element={
                    <AuthGuard>
                      <Routes>
                        <Route element={<LayoutPrincipal />}>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/clientes" element={<Clientes />} />
                          <Route path="/movimentacoes" element={<Movimentacoes />} />
                          <Route path="/produtos" element={<Produtos />} />
                          <Route path="/relatorios" element={<RelatoriosPage />} />
                          <Route path="/vendedores" element={<Vendedores />} />
                        </Route>
                      </Routes>
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
