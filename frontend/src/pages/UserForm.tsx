import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import InputMask from 'react-input-mask';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const userFormSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  nickname: z.string().optional(),
  telefone: z.string().optional().refine(val => !val || val.replace(/\D/g, '').length === 10 || val.replace(/\D/g, '').length === 11, {
    message: "O telefone, se preenchido, deve ter 10 ou 11 dígitos.",
  }),
  senha: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }).optional().or(z.literal('')),
  perfil: z.enum(['ADMIN', 'USER']),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  onSubmit: (values: UserFormValues) => void;
  isSubmitting: boolean;
  isEditing: boolean;
  formInstance: UseFormReturn<UserFormValues>;
}

export default function UserForm({ onSubmit, isSubmitting, isEditing, formInstance: form }: UserFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail do Usuário</FormLabel>
              <FormControl>
                <Input type="email" placeholder="exemplo@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nickname (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Apelido para login" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* ================================================================== */}
          {/*      INÍCIO DA CORREÇÃO FINAL: Passando o Input como função      */}
          {/* ================================================================== */}
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone (Opcional)</FormLabel>
                <FormControl>
                  <InputMask
                    mask="(99) 99999-9999"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  >
                    {(inputProps: any) => <Input {...inputProps} placeholder="(xx) xxxxx-xxxx" />}
                  </InputMask>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* ================================================================== */}
          {/*       FIM DA CORREÇÃO FINAL                                      */}
          {/* ================================================================== */}
        </div>

        <FormField
          control={form.control}
          name="senha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder={isEditing ? "Deixe em branco para não alterar" : "Mínimo 6 caracteres"} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="perfil"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Perfil de Acesso</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="USER">Usuário Padrão (USER)</SelectItem>
                  <SelectItem value="ADMIN">Administrador (ADMIN)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Criar Usuário")}
        </Button>
      </form>
    </Form>
  );
}
