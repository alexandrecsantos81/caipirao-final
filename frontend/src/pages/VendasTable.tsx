import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Venda } from "@/services/movimentacoes.service";
import { CheckCircle2, User } from "lucide-react";

interface VendasTableProps {
  vendas: Venda[];
  onEdit: (venda: Venda) => void;
  onDelete: (id: number) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (dateString: string | null) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
const formatQuantity = (value: number | null, unit: string | null) => {
  if (value === null) return 'N/A';
  const formattedValue = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 }).format(value);
  return `${formattedValue} ${unit || ''}`; // Adiciona a unidade de medida
};

export default function VendasTable({ vendas, onEdit, onDelete }: VendasTableProps) {
  return (
    <div className="rounded-lg border shadow-sm overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data da Venda</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead>Status</TableHead>
            {/* 1. Mover a coluna Quantidade para depois de Status */}
            <TableHead className="text-center">Quantidade</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
            <TableHead className="text-center w-[180px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendas.map((venda) => (
            <TableRow key={venda.id} className={venda.data_pagamento ? 'bg-green-50/50 dark:bg-green-900/20' : ''}>
              <TableCell>{formatDate(venda.data_venda)}</TableCell>
              <TableCell>{venda.cliente_nome}</TableCell>
              <TableCell>{venda.produto_nome}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{venda.responsavel_venda_nome || 'N/A'}</span>
                </div>
              </TableCell>
              <TableCell>
                {venda.data_pagamento ? (
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Pago
                  </Badge>
                ) : (
                  <Badge variant="destructive">Pendente</Badge>
                )}
              </TableCell>
              {/* 2. Mover a célula Quantidade e centralizar o conteúdo */}
              <TableCell className="text-center font-medium">
                {formatQuantity(venda.peso, venda.unidade_medida)}
              </TableCell>
              <TableCell className="text-right font-semibold text-green-600">
                {formatCurrency(venda.valor_total)}
              </TableCell>
              <TableCell className="text-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(venda)}>Editar</Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(venda.id)}>Deletar</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
