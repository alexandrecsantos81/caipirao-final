// /frontend/src/components/ui/input.tsx

import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          
          // ======================= INÍCIO DA CORREÇÃO =======================
          // Adiciona uma classe específica para inputs de data no modo escuro.
          // Esta classe será usada no nosso CSS para forçar a cor do ícone.
          "dark:[&[type='date']]:dark-date-picker-icon",
          // ======================== FIM DA CORREÇÃO =========================

          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
