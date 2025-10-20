import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiErrorHandler } from "@/lib/error-handler";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");
    const tipoRelatorio = searchParams.get("tipoRelatorio") || "fluxo";
    const formato = searchParams.get("formato") || "pdf";

    // Definir período
    let inicio: Date;
    let fim: Date;

    if (dataInicio && dataFim) {
      inicio = startOfDay(new Date(dataInicio));
      fim = endOfDay(new Date(dataFim));
    } else {
      fim = endOfDay(new Date());
      inicio = startOfDay(subDays(fim, 30));
    }

    // Buscar dados
    const movimentacoes = await prisma.movimentacaoCaixa.findMany({
      where: {
        dataHora: {
          gte: inicio,
          lte: fim,
        },
      },
      include: {
        caixa: {
          select: {
            valorInicial: true,
            dataAbertura: true,
          },
        },
      },
      orderBy: {
        dataHora: "asc",
      },
    });

    // Gerar conteúdo baseado no formato
    let content: string;
    let contentType: string;
    let fileName: string;

    const dataAtual = format(new Date(), "dd-MM-yyyy", { locale: ptBR });
    const periodo = `${format(inicio, "dd/MM/yyyy", {
      locale: ptBR,
    })} - ${format(fim, "dd/MM/yyyy", { locale: ptBR })}`;

    switch (formato) {
      case "csv":
        content = generateCSV(movimentacoes, periodo);
        contentType = "text/csv";
        fileName = `relatorio-${tipoRelatorio}-${dataAtual}.csv`;
        break;
      case "excel":
        content = generateExcel(movimentacoes, periodo);
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        fileName = `relatorio-${tipoRelatorio}-${dataAtual}.xlsx`;
        break;
      case "pdf":
      default:
        content = generatePDF(movimentacoes, periodo);
        contentType = "application/pdf";
        fileName = `relatorio-${tipoRelatorio}-${dataAtual}.pdf`;
        break;
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}

function generateCSV(movimentacoes: any[], periodo: string): string {
  const headers = [
    "Data",
    "Hora",
    "Tipo",
    "Categoria",
    "Descrição",
    "Valor",
    "Observações",
  ];

  const rows = movimentacoes.map((mov) => [
    format(mov.dataHora, "dd/MM/yyyy", { locale: ptBR }),
    format(mov.dataHora, "HH:mm", { locale: ptBR }),
    mov.tipo,
    mov.categoria,
    mov.descricao,
    mov.valor.toNumber().toFixed(2).replace(".", ","),
    mov.observacoes || "",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((field) => `"${field}"`).join(";"))
    .join("\n");

  return `Relatório de Movimentações - ${periodo}\n\n${csvContent}`;
}

function generateExcel(movimentacoes: any[], periodo: string): string {
  // Para Excel, retornamos CSV por simplicidade
  // Em produção, usar uma biblioteca como xlsx
  return generateCSV(movimentacoes, periodo);
}

function generatePDF(movimentacoes: any[], periodo: string): string {
  // Para PDF, retornamos HTML simples
  // Em produção, usar uma biblioteca como puppeteer ou jsPDF
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Relatório de Movimentações</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .entrada { color: #22c55e; }
        .saida { color: #ef4444; }
      </style>
    </head>
    <body>
      <h1>Relatório de Movimentações</h1>
      <p><strong>Período:</strong> ${periodo}</p>
      <p><strong>Total de movimentações:</strong> ${movimentacoes.length}</p>
      
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Hora</th>
            <th>Tipo</th>
            <th>Categoria</th>
            <th>Descrição</th>
            <th>Valor</th>
            <th>Observações</th>
          </tr>
        </thead>
        <tbody>
          ${movimentacoes
            .map(
              (mov) => `
            <tr>
              <td>${format(mov.dataHora, "dd/MM/yyyy", { locale: ptBR })}</td>
              <td>${format(mov.dataHora, "HH:mm", { locale: ptBR })}</td>
              <td class="${mov.tipo.toLowerCase()}">${mov.tipo}</td>
              <td>${mov.categoria}</td>
              <td>${mov.descricao}</td>
              <td>R$ ${mov.valor.toNumber().toFixed(2).replace(".", ",")}</td>
              <td>${mov.observacoes || ""}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </body>
    </html>
  `;

  return html;
}
