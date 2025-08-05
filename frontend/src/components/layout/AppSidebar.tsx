// frontend/src/components/layout/AppSidebar.tsx

import { NavLink } from 'react-router-dom';
// 1. Importar os ícones necessários para os novos links
import { Home, ShoppingCart, Users, Package, LineChart, LogOut, UserCircle, ShieldCheck, Briefcase, UserCog } from 'lucide-react'; 
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Drawer, DrawerContent } from '../ui/drawer';

// 2. DIVIDIR OS LINKS EM DUAS LISTAS: COMUM E ADMIN
// Links que todos os usuários autenticados verão
const commonLinks = [
  { to: "/movimentacoes", label: "Movimentações", icon: ShoppingCart },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/produtos", label: "Produtos", icon: Package },
];

// Links que APENAS administradores verão
const adminLinks = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/vendedores", label: "Vendedores", icon: Briefcase },
  { to: "/relatorios", label: "Relatórios", icon: LineChart },
  { to: "/usuarios", label: "Usuários", icon: UserCog },
];

interface AppSidebarProps {
  isCollapsed: boolean;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (isOpen: boolean) => void;
}

const SidebarContent = ({ isCollapsed, onLinkClick }: { isCollapsed: boolean, onLinkClick?: () => void }) => {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <div className="flex flex-col h-full bg-muted/40">
      <div className={cn("flex h-14 items-center border-b lg:h-[60px]", isCollapsed ? "px-2 justify-center" : "px-4 lg:px-6")}>
        <NavLink to="/" className="flex items-center gap-2 font-semibold" onClick={onLinkClick}>
          <Package className="h-6 w-6" />
          {!isCollapsed && <span>Caipirão 2.0</span>}
        </NavLink>
      </div>

      <nav className={cn("flex-1 overflow-y-auto py-2", isCollapsed ? "px-2" : "px-2 lg:px-4")}>
        <ul className="space-y-1">
          {/* 3. RENDERIZAÇÃO CONDICIONAL DOS LINKS DE ADMIN */}
          {user?.perfil === 'ADMIN' && (
            <>
              {adminLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === "/"} // Garante que 'Dashboard' só fica ativo na raiz
                    onClick={onLinkClick}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg py-2 text-muted-foreground transition-all hover:text-primary",
                        isCollapsed ? "px-3 justify-center" : "px-3",
                        isActive && "bg-muted text-primary"
                      )
                    }
                  >
                    <link.icon className="h-5 w-5" />
                    {!isCollapsed && <span className="truncate">{link.label}</span>}
                  </NavLink>
                </li>
              ))}
              {/* Adiciona um separador visual */}
              {!isCollapsed && <li className="px-3 py-2 text-xs font-semibold text-muted-foreground/80 tracking-wider uppercase">Geral</li>}
            </>
          )}

          {/* Renderiza os links comuns para todos os usuários */}
          {commonLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end
                onClick={onLinkClick}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg py-2 text-muted-foreground transition-all hover:text-primary",
                    isCollapsed ? "px-3 justify-center" : "px-3",
                    isActive && "bg-muted text-primary"
                  )
                }
              >
                <link.icon className="h-5 w-5" />
                {!isCollapsed && <span className="truncate">{link.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* O rodapé permanece o mesmo */}
      <div className={cn("mt-auto p-4 border-t w-full", isCollapsed && "px-2")}>
        {user && (
          <div className={cn("flex items-center gap-3 mb-4", isCollapsed && "justify-center")}>
            <UserCircle className="h-8 w-8 text-muted-foreground" />
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium leading-none truncate">
                  {user.nickname || user.email}
                </span>
                {user.perfil === 'ADMIN' && (
                  <Badge variant="destructive" className="mt-1 w-fit">
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    Admin
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={cn("w-full text-muted-foreground hover:text-primary", isCollapsed ? "justify-center px-0" : "justify-start")}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Sair</span>}
        </Button>
      </div>
    </div>
  );
};

// O componente principal exportado permanece o mesmo
export default function AppSidebar({ isCollapsed, isMobileNavOpen, setIsMobileNavOpen }: AppSidebarProps) {
  return (
    <>
      {/* Sidebar para Desktop */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-[220px] lg:w-[280px]"
        )}
      >
        <SidebarContent isCollapsed={isCollapsed} />
      </aside>

      {/* Drawer para Mobile */}
      <div className="md:hidden">
        <Drawer open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
          <DrawerContent className="border-r h-full w-[280px] mt-0 rounded-none">
            <SidebarContent isCollapsed={false} onLinkClick={() => setIsMobileNavOpen(false)} />
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
