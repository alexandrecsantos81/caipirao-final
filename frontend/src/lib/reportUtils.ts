// frontend/src/lib/reportUtils.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define a interface para as opções da nossa função de exportação
interface PdfExportOptions {
  reportName: string;
  headers: string[];
  data: (string | number)[][];
  period: {
    start: string;
    end: string;
  };
}

/**
 * Gera e baixa um documento PDF a partir de dados de uma tabela.
 * @param options - As opções para a geração do PDF.
 */
export const exportToPdf = ({ reportName, headers, data, period }: PdfExportOptions) => {
  // 1. Inicializa o documento PDF
  const doc = new jsPDF({
    orientation: 'portrait', // 'portrait' (retrato) ou 'landscape' (paisagem)
    unit: 'mm',
    format: 'a4',
  });

  // 2. Formata as datas para exibição no cabeçalho
  const formattedStartDate = new Date(period.start).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  const formattedEndDate = new Date(period.end).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  const generationDate = new Date().toLocaleString('pt-BR');

  // 3. Adiciona o cabeçalho do relatório
  doc.setFontSize(18);
  doc.text('Relatório - Caipirão 2.0', 14, 22);
  doc.setFontSize(12);
  doc.text(reportName, 14, 30);
  doc.setFontSize(10);
  doc.text(`Período: ${formattedStartDate} a ${formattedEndDate}`, 14, 36);
  doc.text(`Gerado em: ${generationDate}`, 14, 42);

  // 4. Usa o autoTable para criar a tabela a partir dos dados
  autoTable(doc, {
    startY: 50, // Posição inicial da tabela (abaixo do cabeçalho)
    head: [headers], // Cabeçalhos da tabela
    body: data, // Corpo da tabela
    theme: 'striped', // Temas: 'striped', 'grid', 'plain'
    headStyles: {
      fillColor: [22, 163, 74], // Cor de fundo do cabeçalho (verde)
      textColor: [255, 255, 255], // Cor do texto do cabeçalho (branco)
      fontStyle: 'bold',
    },
    styles: {
      cellPadding: 2,
      fontSize: 8,
    },
  });

  // 5. Gera o nome do arquivo e salva o PDF
  const fileName = `${reportName.toLowerCase().replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
