// frontend/src/App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Importe seus providers e componentes
import { AuthProvider } from './contexts/AuthContext'; 
import { ThemeProvider } from './contexts/ThemeProvider'; // 1. Importar o ThemeProvider
import { LayoutPrincipal } from './components/LayoutPrincipal'; 
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Movimentacoes from './pages/Movimentacoes';
import Produtos from './pages/Produtos';

const queryClient = new QueryClient();

function App() {
  return (
    <>
      {/* 2. Envolver toda a aplicação com o ThemeProvider */}
      {/*    - defaultTheme: o tema padrão se nenhum for encontrado no localStorage. */}
      {/*    - storageKey: o nome da chave usada para salvar no localStorage. */}
      <ThemeProvider defaultTheme="system" storageKey="caipirao-ui-theme">
        <Router>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<LayoutPrincipal />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/movimentacoes" element={<Movimentacoes />} />
                  <Route path="/produtos" element={<Produtos />} />
                </Route>
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
