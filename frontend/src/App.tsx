// frontend/src/App.tsx

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';

// --- CORREÇÃO FINALÍSSIMA ---
// Assumindo que todos os componentes não-páginas estão em uma pasta 'components'
// ou diretamente na raiz de 'src'. Esta é a estrutura mais provável.
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout'; // Caminho mais provável
import AuthGuard from './components/AuthGuard';             // Caminho mais provável
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Produtos from './pages/Produtos';
import Movimentacoes from './pages/Movimentacoes';

function App() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-right" />
      <Router>
        <Routes>
          {/* Se o usuário acessar a raiz, redirecione para /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rota pública para a página de login */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas dentro do layout do dashboard */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <DashboardLayout />
              </AuthGuard>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="produtos" element={<Produtos />} />
            <Route path="movimentacoes" element={<Movimentacoes />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
