// frontend/src/contexts/ThemeProvider.tsx

import { createContext, useContext, useEffect, useState } from "react"

// Define os tipos de temas possíveis
type Theme = "dark" | "light" | "system"

// Define as propriedades que o nosso provedor receberá
type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

// Define a estrutura do estado que o nosso contexto fornecerá
type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

// Estado inicial para o contexto
const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

// Cria o Contexto do Provedor de Tema
const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

// Componente principal do Provedor de Tema
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme", // Chave para salvar no localStorage
  ...props
}: ThemeProviderProps) {
  // Estado para armazenar o tema atual, inicializado com o valor do localStorage ou o padrão
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  // Efeito que é executado sempre que o tema muda
  useEffect(() => {
    const root = window.document.documentElement // Pega o elemento <html>

    // Remove as classes de tema existentes para evitar conflitos
    root.classList.remove("light", "dark")

    // Se o tema for 'system', verifica a preferência do sistema operacional
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      
      root.classList.add(systemTheme) // Aplica o tema do sistema
      return
    }

    // Se for 'light' ou 'dark', aplica a classe diretamente
    root.classList.add(theme)
  }, [theme]) // O efeito depende do estado 'theme'

  // O valor que será fornecido pelo contexto
  const value = {
    theme,
    setTheme: (theme: Theme) => {
      // Salva a nova escolha no localStorage
      localStorage.setItem(storageKey, theme)
      // Atualiza o estado do React
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

// Hook customizado para facilitar o uso do contexto do tema em outros componentes
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme deve ser usado dentro de um ThemeProvider")

  return context
}
