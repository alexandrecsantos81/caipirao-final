// frontend/src/components/LayoutPrincipal.tsx

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeProvider';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Moon, Sun, PanelLeftClose, PanelLeftOpen, Menu } from 'lucide-react';
import AppSidebar from './layout/AppSidebar';
import { cn } from '@/lib/utils';

export function LayoutPrincipal() {
  const { setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    // CORREÇÃO PRINCIPAL APLICADA AQUI
    // O grid agora é definido de forma mais robusta e apenas para telas 'md' e maiores.
    // Em telas pequenas, ele se comporta como um block normal, permitindo que o header e o main ocupem 100% da largura.
    <div className="flex h-screen w-full bg-background">
      <AppSidebar 
        isCollapsed={isCollapsed} 
        isMobileNavOpen={isMobileNavOpen}
        setIsMobileNavOpen={setIsMobileNavOpen}
      />

      <div className="flex flex-1 flex-col h-screen">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          {/* Botão de controle do menu desktop (escondido em telas pequenas) */}
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 hidden md:flex"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
            <span className="sr-only">Recolher/Expandir Menu</span>
          </Button>

          {/* Botão "hambúrguer" para abrir o menu móvel (visível apenas em telas pequenas) */}
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={() => setIsMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir Menu</span>
          </Button>

          {/* Espaçador e menu de tema */}
          <div className="w-full flex-1"></div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Alternar tema</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>Claro</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>Escuro</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>Sistema</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
