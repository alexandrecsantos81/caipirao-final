// /frontend/src/pages/Vendedores.tsx

// 1. Importar useEffect e os componentes Select
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSellerProductivity } from '@/hooks/useReports';
import { DollarSign, Hash, ShoppingBag, Terminal, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- Funções Auxiliares (sem alteração) ---
const toISODateString = (date: Date) => date.toISOString().split('T')[0];
const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// --- Componente SellerCard (sem alteração) ---
const SellerCard = ({ nome, total, count, avg }: { nome: string, total: number, count: number, avg: number }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium truncate">{nome}</CardTitle>
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

// --- Componente Principal (COM AS ALTERAÇÕES) ---
export default function Vendedores() {
  // 2. Definir os tipos e estados para os filtros
  type QuickFilterType = 'personalizado' | 'mes_anterior' | 'ultimos_3_meses' | 'ultimos_6_meses' | 'ultimos_12_meses';
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('personalizado');

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

  // 3. useEffect para atualizar as datas com base no filtro rápido
  useEffect(() => {
    if (quickFilter === 'personalizado') return;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    let inicio = new Date(hoje);

    switch (quickFilter) {
      case 'mes_anterior':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        setDataFim(toISODateString(new Date(hoje.getFullYear(), hoje.getMonth(), 0)));
        break;
      case 'ultimos_3_meses':
        inicio.setMonth(hoje.getMonth() - 3);
        setDataFim(toISODateString(hoje));
        break;
      case 'ultimos_6_meses':
        inicio.setMonth(hoje.getMonth() - 6);
        setDataFim(toISODateString(hoje));
        break;
      case 'ultimos_12_meses':
        inicio.setFullYear(hoje.getFullYear() - 1);
        setDataFim(toISODateString(hoje));
        break;
    }
    setDataInicio(toISODateString(inicio));
  }, [quickFilter]);

  // 4. Funções para lidar com a mudança manual das datas
  const handleDataInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDataInicio(e.target.value);
    setQuickFilter('personalizado'); // Reseta o dropdown
  };

  const handleDataFimChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDataFim(e.target.value);
    setQuickFilter('personalizado'); // Reseta o dropdown
  };

  // --- renderContent (sem alteração) ---
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
            nome={vendedor.vendedor_nome}
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
          <CardDescription>Selecione um filtro rápido ou defina um período personalizado.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 5. Layout do filtro atualizado com o Select */}
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="grid w-full sm:w-auto flex-1 gap-1.5">
              <Label htmlFor="filtro-rapido">Filtro Rápido</Label>
              <Select value={quickFilter} onValueChange={(value) => setQuickFilter(value as QuickFilterType)}>
                <SelectTrigger id="filtro-rapido">
                  <SelectValue placeholder="Selecione um período..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                  <SelectItem value="mes_anterior">Mês Anterior</SelectItem>
                  <SelectItem value="ultimos_3_meses">Últimos 3 Meses</SelectItem>
                  <SelectItem value="ultimos_6_meses">Últimos 6 Meses</SelectItem>
                  <SelectItem value="ultimos_12_meses">Últimos 12 Meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full sm:w-auto gap-1.5">
              <Label htmlFor="data-inicio">Data de Início</Label>
              <Input id="data-inicio" type="date" value={dataInicio} onChange={handleDataInicioChange} />
            </div>
            <div className="grid w-full sm:w-auto gap-1.5">
              <Label htmlFor="data-fim">Data de Fim</Label>
              <Input id="data-fim" type="date" value={dataFim} onChange={handleDataFimChange} />
            </div>
          </div>
        </CardContent>
      </Card>

      {renderContent()}
    </div>
  );
}
