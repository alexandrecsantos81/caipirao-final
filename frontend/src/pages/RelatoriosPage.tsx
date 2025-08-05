import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVendasPorPeriodo, useRankingProdutos, useRankingClientes } from '@/hooks/useReports';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, DollarSign, Weight, ShoppingCart, BarChart2, Crown, User, FileDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { exportToPdf } from '@/lib/reportUtils';

// --- Funções Auxiliares ---
const toISODateString = (date: Date) => date.toISOString().split('T')[0];
const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatNumber = (value: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 }).format(value);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

// --- Componentes de UI ---
const ReportLoader = () => <Skeleton className="h-64 w-full mt-6" />;
const ReportError = ({ error }: { error: Error | null }) => (
  <Alert variant="destructive" className="mt-6"><Terminal className="h-4 w-4" /><AlertTitle>Erro ao Gerar Relatório</AlertTitle><AlertDescription>{error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.'}</AlertDescription></Alert>
);

// --- Componente Principal ---
export default function RelatoriosPage() {
  const [dataInicio, setDataInicio] = useState(toISODateString(new Date(new Date().setDate(1))));
  const [dataFim, setDataFim] = useState(toISODateString(new Date()));
  const [activeTab, setActiveTab] = useState("vendas_gerais");

  const vendasQuery = useVendasPorPeriodo({ data_inicio: dataInicio, data_fim: dataFim, enabled: activeTab === 'vendas_gerais' });
  const produtosQuery = useRankingProdutos({ data_inicio: dataInicio, data_fim: dataFim, enabled: activeTab === 'ranking_produtos' });
  const clientesQuery = useRankingClientes({ data_inicio: dataInicio, data_fim: dataFim, enabled: activeTab === 'ranking_clientes' });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'vendas_gerais' && !vendasQuery.data) vendasQuery.refetch();
    if (value === 'ranking_produtos' && !produtosQuery.data) produtosQuery.refetch();
    if (value === 'ranking_clientes' && !clientesQuery.data) clientesQuery.refetch();
  };

  const handleExport = () => {
    switch (activeTab) {
      case 'vendas_gerais':
        if (!vendasQuery.data) return;
        exportToPdf({
          reportName: 'Relatório de Vendas Gerais',
          headers: ['Dia', 'Vendas (R$)', 'Peso (kg)', 'Nº Transações'],
          data: vendasQuery.data.map(item => [formatDate(item.dia), formatCurrency(parseFloat(item.total_vendas)), formatNumber(parseFloat(item.peso_total)), item.transacoes]),
          period: { start: dataInicio, end: dataFim },
        });
        break;
      case 'ranking_produtos':
        // CORREÇÃO: Adicionada verificação para evitar erro com dados indefinidos
        if (!produtosQuery.data) return;
        exportToPdf({
          reportName: 'Ranking de Produtos',
          headers: ['Pos.', 'Produto', 'Faturamento (R$)', 'Qtd. Vendida', 'Nº Vendas'],
          data: produtosQuery.data.map((item, index) => [
            `${index + 1}º`, 
            item.produto_nome, 
            formatCurrency(parseFloat(item.faturamento_total)), 
            `${formatNumber(parseFloat(item.quantidade_vendida))} ${item.unidade_medida}`, 
            item.transacoes
          ]),
          period: { start: dataInicio, end: dataFim },
        });
        break;
      case 'ranking_clientes':
        // CORREÇÃO: Adicionada verificação para evitar erro com dados indefinidos
        if (!clientesQuery.data) return;
        exportToPdf({
          reportName: 'Ranking de Clientes',
          headers: ['Pos.', 'Cliente', 'Valor Gasto (R$)', 'Nº Compras'],
          data: clientesQuery.data.map((item, index) => [
            `${index + 1}º`, 
            item.cliente_nome, 
            formatCurrency(parseFloat(item.faturamento_total)), 
            item.transacoes
          ]),
          period: { start: dataInicio, end: dataFim },
        });
        break;
    }
  };

  const VendasGeraisTab = () => {
    const totais = useMemo(() => {
      if (!vendasQuery.data) return { valor: 0, peso: 0, transacoes: 0 };
      return vendasQuery.data.reduce((acc, item) => {
        acc.valor += parseFloat(item.total_vendas);
        acc.peso += parseFloat(item.peso_total) || 0;
        acc.transacoes += parseInt(item.transacoes, 10);
        return acc;
      }, { valor: 0, peso: 0, transacoes: 0 });
    }, [vendasQuery.data]);

    if (vendasQuery.isLoading) return <ReportLoader />;
    if (vendasQuery.isError) return <ReportError error={vendasQuery.error} />;
    if (!vendasQuery.data) return null;

    return (
      <div className="space-y-6 mt-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Faturamento Total</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(totais.valor)}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Peso Total Vendido</CardTitle><Weight className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatNumber(totais.peso)} kg</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total de Transações</CardTitle><ShoppingCart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totais.transacoes}</div></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Evolução das Vendas</CardTitle></CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={vendasQuery.data.map(d => ({ ...d, dia: formatDate(d.dia), total_vendas: parseFloat(d.total_vendas) }))}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="dia" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value)} /><Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => `Dia: ${label}`} /><Legend /><Bar dataKey="total_vendas" name="Vendas (R$)" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-3xl font-bold">Relatórios</h1><p className="mt-2 text-gray-600">Gere relatórios detalhados para uma visão aprofundada do seu negócio.</p></div>
      
      <Card>
        <CardHeader><CardTitle>Filtros do Relatório</CardTitle><CardDescription>Selecione um período e o tipo de relatório para visualizar.</CardDescription></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="grid w-full sm:w-auto gap-1.5"><Label htmlFor="data-inicio">Data de Início</Label><Input id="data-inicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} /></div>
            <div className="grid w-full sm:w-auto gap-1.5"><Label htmlFor="data-fim">Data de Fim</Label><Input id="data-fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} /></div>
            <Button onClick={handleExport} variant="outline" className="w-full sm:w-auto">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar para PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto">
          <TabsTrigger value="vendas_gerais"><BarChart2 className="mr-2 h-4 w-4" />Vendas Gerais</TabsTrigger>
          <TabsTrigger value="ranking_produtos"><Crown className="mr-2 h-4 w-4" />Ranking de Produtos</TabsTrigger>
          <TabsTrigger value="ranking_clientes"><User className="mr-2 h-4 w-4" />Ranking de Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="vendas_gerais"><VendasGeraisTab /></TabsContent>

        <TabsContent value="ranking_produtos">
          {produtosQuery.isLoading && <ReportLoader />}
          {produtosQuery.isError && <ReportError error={produtosQuery.error} />}
          {produtosQuery.data && !produtosQuery.isLoading && (
            <Card className="mt-6"><CardHeader><CardTitle>Produtos Mais Vendidos</CardTitle><CardDescription>Ranking por faturamento no período selecionado.</CardDescription></CardHeader><CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Posição</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Faturamento</TableHead>
                  <TableHead className="text-right">Qtd. Vendida</TableHead>
                  <TableHead className="text-right">Nº Vendas</TableHead>
                </TableRow></TableHeader>
                <TableBody>{produtosQuery.data.map((item, index) => (
                  <TableRow key={item.produto_nome}>
                    <TableCell className="font-medium">{index + 1}º</TableCell>
                    <TableCell>{item.produto_nome}</TableCell>
                    <TableCell className="text-right">{formatCurrency(parseFloat(item.faturamento_total))}</TableCell>
                    <TableCell className="text-right">
                      {`${formatNumber(parseFloat(item.quantidade_vendida))} ${item.unidade_medida}`}
                    </TableCell>
                    <TableCell className="text-right">{item.transacoes}</TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            </CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="ranking_clientes">
          {clientesQuery.isLoading && <ReportLoader />}
          {clientesQuery.isError && <ReportError error={clientesQuery.error} />}
          {clientesQuery.data && !clientesQuery.isLoading && (
            <Card className="mt-6"><CardHeader><CardTitle>Clientes com Maior Volume de Compra</CardTitle><CardDescription>Ranking por valor total de compras no período selecionado.</CardDescription></CardHeader><CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Posição</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Valor Gasto</TableHead>
                  <TableHead className="text-right">Nº Compras</TableHead>
                </TableRow></TableHeader>
                <TableBody>{clientesQuery.data.map((item, index) => (
                  <TableRow key={item.cliente_nome}>
                    <TableCell className="font-medium">{index + 1}º</TableCell>
                    <TableCell>{item.cliente_nome}</TableCell>
                    <TableCell className="text-right">{formatCurrency(parseFloat(item.faturamento_total))}</TableCell>
                    <TableCell className="text-right">{item.transacoes}</TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            </CardContent></Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
