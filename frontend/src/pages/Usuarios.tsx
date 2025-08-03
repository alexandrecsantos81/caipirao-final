import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// Hooks e tipos
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/useUsers";
import { User, CreateUserPayload, UpdateUserPayload } from "@/services/users.service";
import UserForm, { UserFormValues, userFormSchema } from "./UserForm";

// Componentes e Ícones
import { PlusCircle, Terminal, ShieldCheck, User as UserIcon, Trash2, Edit, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";

// Funções Utilitárias
import { formatWhatsAppLink, formatPhone } from "@/lib/utils";

export default function Usuarios() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // ==================================================================
  //      INÍCIO DA CORREÇÃO: Bloco de código restaurado
  // ==================================================================
  const { data: users, isLoading, isError, error } = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  // ==================================================================
  //       FIM DA CORREÇÃO
  // ==================================================================

  const formSchemaWithPasswordValidation = userFormSchema.refine(data => {
    return !!userToEdit || (data.senha && data.senha.length > 0);
  }, {
    message: "A senha é obrigatória para criar um novo usuário.",
    path: ["senha"],
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchemaWithPasswordValidation),
    defaultValues: { email: '', nickname: '', telefone: '', senha: '', perfil: 'USER' },
  });

  const handleOpenDrawer = (user: User | null) => {
    setUserToEdit(user);
    if (user) {
      form.reset({ email: user.email, perfil: user.perfil, nickname: user.nickname || '', telefone: user.telefone || '', senha: '' });
    } else {
      form.reset({ email: '', nickname: '', telefone: '', senha: '', perfil: 'USER' });
    }
    setIsDrawerOpen(true);
  };

  const handleFormSubmit = (values: UserFormValues) => {
    const payload: CreateUserPayload | UpdateUserPayload = {
      email: values.email,
      perfil: values.perfil,
      nickname: values.nickname || null,
      telefone: values.telefone ? values.telefone.replace(/\D/g, '') : null,
      ...(values.senha && { senha: values.senha }),
    };

    const handleSuccess = (action: string) => {
      toast.success(`Usuário ${action} com sucesso!`);
      setIsDrawerOpen(false);
    };

    const handleError = (action: string, err: any) => {
      toast.error(`Erro ao ${action} usuário: ${err.response?.data?.error || err.message}`);
    };

    if (userToEdit) {
      updateUserMutation.mutate({ id: userToEdit.id, payload }, {
        onSuccess: () => handleSuccess('atualizado'),
        onError: (err) => handleError('atualizar', err),
      });
    } else {
      createUserMutation.mutate(payload as CreateUserPayload, {
        onSuccess: () => handleSuccess('criado'),
        onError: (err) => handleError('criar', err),
      });
    }
  };

  const handleDelete = (userId: number) => {
    if (window.confirm("Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.")) {
      deleteUserMutation.mutate(userId, {
        onSuccess: () => toast.success("Usuário deletado com sucesso!"),
        onError: (err: any) => toast.error(`Erro ao deletar: ${err.response?.data?.error || err.message}`),
      });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="mt-6 space-y-2"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>;
    }
    if (isError) {
      return <Alert variant="destructive" className="mt-6"><Terminal className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error.message}</AlertDescription></Alert>;
    }
    return (
      <div className="mt-6 rounded-md border">
        <Table>
          <TableHeader><TableRow>
            <TableHead>E-mail</TableHead>
            <TableHead>Nickname</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.nickname || 'N/A'}</TableCell>
                <TableCell>
                  {user.telefone ? (
                    <a 
                      href={formatWhatsAppLink(user.telefone)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-500 hover:underline hover:text-blue-400 transition-colors"
                      title="Abrir conversa no WhatsApp"
                    >
                      <Phone className="h-4 w-4" />
                      {formatPhone(user.telefone)}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={user.perfil === 'ADMIN' ? 'destructive' : 'secondary'}>
                    {user.perfil === 'ADMIN' ? <ShieldCheck className="mr-1 h-3 w-3" /> : <UserIcon className="mr-1 h-3 w-3" />}
                    {user.perfil}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenDrawer(user)}><Edit className="mr-2 h-4 w-4" />Editar</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}><Trash2 className="mr-2 h-4 w-4" />Deletar</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const isSubmitting = createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <div className="p-6">
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <div className="flex flex-col items-start gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
            <p className="mt-2 text-gray-600">Adicione, edite e gerencie os usuários do sistema.</p>
          </div>
          <DrawerTrigger asChild>
            <Button onClick={() => handleOpenDrawer(null)}><PlusCircle className="mr-2 h-4 w-4" /> Novo Usuário</Button>
          </DrawerTrigger>
        </div>
        
        {renderContent()}

        <DrawerContent>
          <div className="mx-auto w-full max-w-md p-4">
            <DrawerHeader className="text-left">
              <DrawerTitle>{userToEdit ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}</DrawerTitle>
              <DrawerDescription>
                {userToEdit ? 'Altere os detalhes abaixo para atualizar o usuário.' : 'Preencha os detalhes para adicionar um novo usuário.'}
              </DrawerDescription>
            </DrawerHeader>
            
            <UserForm
              formInstance={form}
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
              isEditing={!!userToEdit}
            />

            <DrawerClose asChild>
              <Button variant="outline" className="mt-4 w-full">Cancelar</Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
