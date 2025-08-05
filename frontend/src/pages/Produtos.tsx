// /frontend/src/pages/Produtos.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerDescription } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, PlusCircle } from "lucide-react";

import { useProdutos, useCreateProduto, useUpdateProduto, useDeleteProduto } from "@/hooks/useProdutos";
import { Produto, CreateProdutoPayload, UpdateProdutoPayload } from '@/services/produtos.service';
import ProdutosTable from "./ProdutosTable";
import ProdutoForm, { ProdutoFormValues, formSchema } from "./ProdutoForm";

type ValidUnit = 'kg' | 'un';

export default function Produtos() {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [produtoParaEditar, setProdutoParaEditar] = useState<Produto | null>(null);

  const { data: produtos, isLoading, isError, error } = useProdutos();
  const createProdutoMutation = useCreateProduto();
  const updateProdutoMutation = useUpdateProduto();
  const deleteProdutoMutation = useDeleteProduto();

  const form = useForm<ProdutoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      unidade_medida: 'kg',
      preco: '',
    },
  });

  const handleSubmit = (values: ProdutoFormValues) => {
    const payload: CreateProdutoPayload | UpdateProdutoPayload = {
      nome: values.nome,
      preco: parseFloat(values.preco.replace(',', '.')),
      unidade_medida: values.unidade_medida,
      descricao: null,
    };

    const handleSuccess = (action: string) => {
      toast.success(`Produto ${action} com sucesso!`);
      setIsDrawerOpen(false);
    };

    const handleError = (action: string, err: any) => {
      toast.error(`Erro ao ${action} produto: ${err.response?.data?.error || err.message}`);
    };

    if (produtoParaEditar) {
      updateProdutoMutation.mutate({ id: produtoParaEditar.id, payload }, {
        onSuccess: () => handleSuccess('atualizado'),
        onError: (err) => handleError('atualizar', err),
      });
    } else {
      createProdutoMutation.mutate(payload as CreateProdutoPayload, {
        onSuccess: () => handleSuccess('criado'),
        onError: (err) => handleError('criar', err),
      });
    }
  };

  const handleEdit = (produto: Produto) => {
    setProdutoParaEditar(produto);
    const unidadeValida = ['kg', 'un'].includes(produto.unidade_medida || '') 
      ? produto.unidade_medida as ValidUnit 
      : 'un';
    form.reset({
      nome: produto.nome,
      unidade_medida: unidadeValida,
      preco: String(produto.preco),
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Tem certeza que deseja deletar este produto?")) {
      deleteProdutoMutation.mutate(id, {
        onSuccess: () => toast.success("Produto deletado com sucesso!"),
        onError: (err: any) => toast.error(`Erro ao deletar: ${err.response?.data?.error || err.message}`),
      });
    }
  };

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) {
      setProdutoParaEditar(null);
      form.reset({ nome: '', unidade_medida: 'kg', preco: '' });
    }
    setIsDrawerOpen(open);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="mt-6 space-y-2"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>;
    }
    if (isError) {
      return <Alert variant="destructive" className="mt-6"><Terminal className="h-4 w-4" /><AlertTitle>Erro ao Carregar</AlertTitle><AlertDescription>Não foi possível buscar os dados. Erro: {error.message}</AlertDescription></Alert>;
    }
    if (produtos && produtos.length > 0) {
      return <ProdutosTable produtos={produtos} onEdit={handleEdit} onDelete={handleDelete} userProfile={user?.perfil} />;
    }
    return <div className="text-center py-10 border-2 border-dashed rounded-lg mt-6"><h3 className="text-lg font-medium">Nenhum produto encontrado.</h3><p className="text-sm text-gray-500">Crie seu primeiro produto para começar.</p></div>;
  };

  const isSubmitting = createProdutoMutation.isPending || updateProdutoMutation.isPending;

  return (
    <div className="p-6">
      <div className="flex flex-col items-start gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="mt-2 text-gray-600">Gerencie seus produtos, preços e unidades de medida.</p>
        </div>
        
        {/* O Drawer agora envolve apenas o botão e o conteúdo, não a lógica inteira */}
        <Drawer open={isDrawerOpen} onOpenChange={handleDrawerOpenChange}>
          {user?.perfil === 'ADMIN' && (
            <DrawerTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" /> Novo Produto</Button>
            </DrawerTrigger>
          )}
          <DrawerContent>
            {/* ======================= INÍCIO DA CORREÇÃO ======================= */}
            <div className="mx-auto w-full max-w-md max-h-[90vh] overflow-y-auto p-4">
              <DrawerHeader className="text-left p-0 mb-4">
                <DrawerTitle>{produtoParaEditar ? 'Editar Produto' : 'Cadastrar Novo Produto'}</DrawerTitle>
                <DrawerDescription>
                  Preencha os detalhes abaixo para salvar o produto.
                </DrawerDescription>
              </DrawerHeader>
              <ProdutoForm
                key={produtoParaEditar?.id || 'new'}
                formInstance={form}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
            {/* ======================== FIM DA CORREÇÃO ========================= */}
          </DrawerContent>
        </Drawer>
      </div>
      {renderContent()}
    </div>
  );
}
