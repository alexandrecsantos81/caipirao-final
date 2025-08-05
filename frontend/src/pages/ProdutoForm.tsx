import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// 1. Remover 'dz' do enum de validação
export const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  unidade_medida: z.enum(['kg', 'un']), // Apenas 'kg' e 'un' são válidos
  preco: z.string()
    .min(1, { message: "O preço é obrigatório." })
    .refine(value => !isNaN(parseFloat(value.replace(',', '.'))) && parseFloat(value) > 0, {
      message: "O preço deve ser um número maior que zero.",
    }),
});

export type ProdutoFormValues = z.infer<typeof formSchema>;

interface ProdutoFormProps {
  onSubmit: (values: ProdutoFormValues) => void;
  isSubmitting: boolean;
  formInstance: UseFormReturn<ProdutoFormValues>;
}

export default function ProdutoForm({ onSubmit, isSubmitting, formInstance: form }: ProdutoFormProps) {
  const unidadeMedida = form.watch("unidade_medida");

  const getUnidadeLabel = (unidade: string | undefined) => {
    if (unidade === 'kg') return 'por Kg';
    if (unidade === 'un') return 'por Unidade';
    return '';
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Produto</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Frango Assado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unidade_medida"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidade de Medida</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  {/* 2. Adicionar a classe 'items-start' para alinhar o texto no topo */}
                  <SelectTrigger className="items-start">
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="kg">Quilograma (kg)</SelectItem>
                  <SelectItem value="un">Unidade (un)</SelectItem>
                  {/* 3. Opção 'Dúzia (dz)' removida */}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço (R$) {getUnidadeLabel(unidadeMedida)}</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Salvando..." : "Salvar Produto"}
        </Button>
      </form>
    </Form>
  );
}
