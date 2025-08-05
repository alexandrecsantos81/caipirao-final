import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Importar o Badge
import { Produto } from "@/services/produtos.service";

interface ProdutosTableProps {
  produtos: Produto[];
  onEdit: (produto: Produto) => void;
  onDelete: (id: number) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Função para formatar a unidade de medida para exibição
const formatUnit = (unit: string | null) => {
  if (!unit) return 'N/A';
  switch (unit.toLowerCase()) {
    case 'kg':
      return 'Quilograma';
    case 'un':
      return 'Unidade';
    case 'dz':
      return 'Dúzia';
    default:
      return unit;
  }
};

export default function ProdutosTable({ produtos, onEdit, onDelete }: ProdutosTableProps) {
  return (
    <div className="rounded-lg border shadow-sm mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            {/* 1. Nova coluna para a Unidade de Medida */}
            <TableHead>Unidade de Medida</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead className="text-right w-[180px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {produtos.map((produto) => (
            <TableRow key={produto.id}>
              <TableCell className="font-medium">{produto.nome}</TableCell>
              {/* 2. Célula que exibe a unidade de medida formatada com um Badge */}
              <TableCell>
                <Badge variant="outline">{formatUnit(produto.unidade_medida)}</Badge>
              </TableCell>
              <TableCell>{formatCurrency(produto.preco)}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(produto)}
                >
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => onDelete(produto.id)}
                >
                  Deletar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
