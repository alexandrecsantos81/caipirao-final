// /frontend/src/pages/Vendedores.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSellerProductivity } from '@/hooks/useReports';
import { DollarSign, Hash, ShoppingBag, Terminal, User } from 'lucide-react';

const toISODateString = (date: Date) => date.toISOString().split('T')[0];
const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const SellerCard = ({ email, total, count, avg }: { email: string, total: number, count: number, avg: number }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium truncate">{email}</CardTitle>
      <User className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center">
        <DollarSign className="h-6 w-6 text-green-500 mr-4" />
        <div>
          <p className="text-xs text-muted-foreground">Total de Vendas</p>
          <p className="text-2xl font-bold">{formatCurrency(total)}</p>
        </div>
      </div>
      <div className="flex items-center">
        <Hash className="h-6 w-6 text-blue-500 mr-4" />
        <div>
          <p className="text-xs text-muted-foreground">Número de Vendas</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>
      </div>
      <div className="flex items-center">
        <ShoppingBag className="h-6 w-6 text-purple-500 mr-4" />
        <div>
          <p className="text-xs text-muted-foreground">Ticket Médio</p>
          <p className="text-2xl font-bold">{formatCurrency(avg)}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Vendedores() {
  const [dataInicio, setDataInicio] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return toISODateString(date);
  });
  const [dataFim, setDataFim] = useState(toISODateString(new Date()));

  const { data, isLoading, isError, error } = useSellerProductivity({
    data_inicio: dataInicio,
    data_fim: dataFim,
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }

    if (isError) {
      return (
        <Alert variant="destructive" className="mt-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Erro ao Carregar</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.'}</AlertDescription>
        </Alert>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-center py-10 border-2 border-dashed rounded-lg mt-6">
          <h3 className="text-lg font-medium">Nenhum dado de vendedor encontrado.</h3>
          <p className="text-sm text-gray-500">Não há vendas registradas para vendedores no período selecionado.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {data.map(vendedor => (
          <SellerCard
            key={vendedor.vendedor_id}
            email={vendedor.vendedor_email}
            total={parseFloat(vendedor.total_vendas)}
            count={parseInt(vendedor.numero_vendas, 10)}
            avg={parseFloat(vendedor.ticket_medio)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div>
        <h1 className="text-3xl font-bold">Produtividade dos Vendedores</h1>
        <p className="mt-2 text-gray-600">Acompanhe o desempenho de vendas da sua equipe.</p>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Filtro por Período</CardTitle>
          <CardDescription>Selecione o intervalo de datas para analisar a produtividade.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="grid w-full sm:w-auto gap-1.5">
              <Label htmlFor="data-inicio">Data de Início</Label>
              <Input id="data-inicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div className="grid w-full sm:w-auto gap-1.5">
              <Label htmlFor="data-fim">Data de Fim</Label>
              <Input id="data-fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {renderContent()}
    </div>
  );
}
