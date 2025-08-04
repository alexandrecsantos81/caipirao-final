// /frontend/src/pages/VendaForm.tsx

import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClientes } from "@/hooks/useClientes";
import { useProdutos } from "@/hooks/useProdutos";
import { useUsers } from "@/hooks/useUsers"; // 1. Importar o hook para buscar usuários

// 2. Atualizar o schema de validação
export const vendaFormSchema = z.object({
  cliente_id: z.string().min(1, "Selecione um cliente."),
  produto_id: z.string().min(1, "Selecione um produto."),
  data_venda: z.string().min(1, "A data da venda é obrigatória."),
  data_vencimento: z.string().optional(),
  peso_produto: z.string().optional(),
  preco_manual: z.string().optional(),
  valor_total: z.string().min(1, "O valor total é obrigatório e deve ser maior que zero."),
  data_pagamento: z.string().optional(),
  // O campo agora é 'responsavel_venda_id' e é obrigatório
  responsavel_venda_id: z.string().min(1, "O vendedor responsável é obrigatório."),
});

export type VendaFormValues = z.infer<typeof vendaFormSchema>;

interface VendaFormProps {
  onSubmit: (values: VendaFormValues) => void;
  isSubmitting: boolean;
  formInstance: UseFormReturn<VendaFormValues>;
}

export default function VendaForm({ onSubmit, isSubmitting, formInstance: form }: VendaFormProps) {
  const { data: clientes } = useClientes();
  const { data: produtos } = useProdutos();
  const { data: usuarios } = useUsers(); // 3. Buscar a lista de usuários

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
        {/* Cliente e Produto (sem alterações) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="cliente_id" render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger></FormControl>
                <SelectContent>{clientes?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="produto_id" render={({ field }) => (
            <FormItem>
              <FormLabel>Produto</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger></FormControl>
                <SelectContent>
                  {produtos?.map(p => {
                    const precoNumerico = typeof p.preco === 'number' ? p.preco : parseFloat(String(p.preco));
                    const precoFormatado = !isNaN(precoNumerico) ? precoNumerico.toFixed(2).replace('.', ',') : 'Preço inválido';
                    return (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nome} (R$ {precoFormatado}/kg)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Peso, Preço Manual e Valor Total (sem alterações) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="peso_produto" render={({ field }) => (
            <FormItem><FormLabel>Peso do Produto (kg)</FormLabel><FormControl><Input type="number" step="0.001" placeholder="Ex: 1.500" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="preco_manual" render={({ field }) => (
            <FormItem><FormLabel>Preço Manual por Kg (Opcional)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="Deixe em branco para usar o padrão" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="valor_total" render={({ field }) => (
          <FormItem><FormLabel>Valor Total da Venda (R$)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="Calculado automaticamente" {...field} readOnly /></FormControl><FormMessage /></FormItem>
        )} />

        {/* Datas (sem alterações) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField control={form.control} name="data_venda" render={({ field }) => (
            <FormItem><FormLabel>Data da Venda</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="data_vencimento" render={({ field }) => (
            <FormItem><FormLabel>Data de Vencimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="data_pagamento" render={({ field }) => (
            <FormItem><FormLabel>Data do Pagamento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        {/* 4. Campo "Responsável pela Venda" MODIFICADO para Select */}
        <FormField
          control={form.control}
          name="responsavel_venda_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendedor Responsável</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o vendedor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Popula o dropdown com os usuários */}
                  {usuarios?.map(user => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.nickname || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting} className="w-full !mt-6">
          {isSubmitting ? "Salvando Venda..." : "Salvar Venda"}
        </Button>
      </form>
    </Form>
  );
}
