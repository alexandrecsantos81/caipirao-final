// frontend/src/App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { AuthGuard } from '@/components/guards/AuthGuard';
import LayoutPrincipal from '@/components/LayoutPrincipal'; 
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Clientes from '@/pages/Clientes';
import Movimentacoes from '@/pages/Movimentacoes';
import Produtos from '@/pages/Produtos';
// CORREÇÃO: Importar com o novo nome do arquivo
import RelatoriosPage from '@/pages/RelatoriosPage'; 

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
                      <Routes>
                        <Route element={<LayoutPrincipal />}>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/clientes" element={<Clientes />} />
                          <Route path="/movimentacoes" element={<Movimentacoes />} />
                          <Route path="/produtos" element={<Produtos />} />
                          {/* CORREÇÃO: Usar o novo componente na rota */}
                          <Route path="/relatorios" element={<RelatoriosPage />} />
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
