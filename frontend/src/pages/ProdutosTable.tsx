// frontend/src/pages/ProdutosTable.tsx

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Produto } from "@/services/produtos.service";

interface ProdutosTableProps {
  produtos: Produto[];
  // 1. ADICIONAR userProfile ÀS PROPS
  userProfile?: 'ADMIN' | 'USER';
  // As funções onEdit e onDelete agora são opcionais, pois só serão usadas por admins
  onEdit?: (produto: Produto) => void;
  onDelete?: (id: number) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatUnit = (unit: string | null) => {
  if (!unit) return 'N/A';
  switch (unit.toLowerCase()) {
    case 'kg': return 'Quilograma';
    case 'un': return 'Unidade';
    default: return unit;
  }
};

export default function ProdutosTable({ produtos, onEdit, onDelete, userProfile }: ProdutosTableProps) {
  return (
    <div className="rounded-lg border shadow-sm mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Unidade de Medida</TableHead>
            <TableHead>Preço</TableHead>
            {/* 2. RENDERIZAÇÃO CONDICIONAL DO CABEÇALHO DA COLUNA */}
            {userProfile === 'ADMIN' && (
              <TableHead className="text-right w-[180px]">Ações</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {produtos.map((produto) => (
            <TableRow key={produto.id}>
              <TableCell className="font-medium">{produto.nome}</TableCell>
              <TableCell>
                <Badge variant="outline">{formatUnit(produto.unidade_medida)}</Badge>
              </TableCell>
              <TableCell>{formatCurrency(produto.preco)}</TableCell>
              {/* 3. RENDERIZAÇÃO CONDICIONAL DA CÉLULA DE AÇÕES */}
              {userProfile === 'ADMIN' && (
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    // Garante que onEdit existe antes de chamá-lo
                    onClick={() => onEdit && onEdit(produto)}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    // Garante que onDelete existe antes de chamá-lo
                    onClick={() => onDelete && onDelete(produto.id)}
                  >
                    Deletar
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
