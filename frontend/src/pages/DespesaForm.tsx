import { useMemo } from "react"; // 1. Importar o hook useMemo
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsers } from "@/hooks/useUsers"; // 2. Importar o hook para buscar usuários

// O schema de validação permanece o mesmo
export const formSchema = z.object({
  tipo_saida: z.string().min(1, "O tipo de saída é obrigatório."),
  valor: z.string().min(1, "O valor é obrigatório.").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "O valor deve ser um número positivo.",
  }),
  discriminacao: z.string().optional(),
  nome_recebedor: z.string().optional(),
  data_pagamento: z.string().optional(),
  data_vencimento: z.string().optional(),
  forma_pagamento: z.string().optional(),
  responsavel_pagamento: z.string().optional(),
});

export type DespesaFormValues = z.infer<typeof formSchema>;

interface DespesaFormProps {
  onSubmit: (values: DespesaFormValues) => void;
  isSubmitting: boolean;
  formInstance: UseFormReturn<DespesaFormValues>;
}

const tiposDeDespesa = [
  "Insumos de Produção", "Mão de Obra", "Materiais e Embalagens",
  "Despesas Operacionais", "Encargos e Tributos", "Despesas Administrativas",
  "Financeiras", "Remuneração de Sócios", "Outros"
];

export default function DespesaForm({ onSubmit, isSubmitting, formInstance: form }: DespesaFormProps) {
  // 3. Buscar a lista de todos os usuários
  const { data: usuarios } = useUsers();

  // 4. Filtrar apenas os administradores, usando useMemo para otimização
  const administradores = useMemo(() => {
    return usuarios?.filter(user => user.perfil === 'ADMIN') || [];
  }, [usuarios]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tipo_saida"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Saída</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione o tipo da despesa" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tiposDeDespesa.map((tipo) => (<SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={form.control} name="valor" render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="discriminacao" render={({ field }) => (
          <FormItem>
            <FormLabel>Discriminação (Detalhes)</FormLabel>
            <FormControl><Textarea placeholder="Detalhes da despesa..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="data_pagamento" render={({ field }) => (
            <FormItem>
              <FormLabel>Data do Pagamento</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="data_vencimento" render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Vencimento</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <FormField control={form.control} name="nome_recebedor" render={({ field }) => (
            <FormItem>
              <FormLabel>Nome de Quem Recebe</FormLabel>
              <FormControl><Input placeholder="Nome do recebedor" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
           {/* 5. Substituir o Input pelo Select para o responsável */}
           <FormField
            control={form.control}
            name="responsavel_pagamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsável pelo Pagamento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {administradores.map((admin) => (
                      <SelectItem key={admin.id} value={admin.nickname || admin.email}>
                        {admin.nickname || admin.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full !mt-6">
          {isSubmitting ? "Salvando..." : "Salvar Despesa"}
        </Button>
      </form>
    </Form>
  );
}
