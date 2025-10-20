import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiErrorHandler } from "@/lib/error-handler";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format, startOfDay, endOfDay, subDays } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");
    const tipoRelatorio = searchParams.get("tipoRelatorio") || "fluxo";

    // Definir período padrão se não fornecido
    let inicio: Date;
    let fim: Date;

    if (dataInicio && dataFim) {
      inicio = startOfDay(new Date(dataInicio));
      fim = endOfDay(new Date(dataFim));
    } else {
      // Padrão: últimos 30 dias
      fim = endOfDay(new Date());
      inicio = startOfDay(subDays(fim, 30));
    }

    // Buscar movimentações do período
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
          },
        },
      },
      orderBy: {
        dataHora: "asc",
      },
    });

    // Processar dados para fluxo de caixa
    const fluxoCaixaMap = new Map<
      string,
      { entradas: number; saidas: number }
    >();

    movimentacoes.forEach((mov) => {
      const data = format(mov.dataHora, "yyyy-MM-dd");
      if (!fluxoCaixaMap.has(data)) {
        fluxoCaixaMap.set(data, { entradas: 0, saidas: 0 });
      }

      const dataMap = fluxoCaixaMap.get(data)!;
      if (mov.tipo === "ENTRADA") {
        dataMap.entradas += mov.valor.toNumber();
      } else {
        dataMap.saidas += mov.valor.toNumber();
      }
    });

    // Converter para array e calcular saldo
    const fluxoCaixa = Array.from(fluxoCaixaMap.entries()).map(
      ([data, valores]) => {
        const saldo = valores.entradas - valores.saidas;
        return {
          data,
          entradas: valores.entradas,
          saidas: valores.saidas,
          saldo,
        };
      }
    );

    // Processar categorias de entrada
    const categoriasEntradaMap = new Map<string, number>();
    const categoriasSaidaMap = new Map<string, number>();

    movimentacoes.forEach((mov) => {
      const categoria = mov.categoria;
      const valor = mov.valor.toNumber();

      if (mov.tipo === "ENTRADA") {
        categoriasEntradaMap.set(
          categoria,
          (categoriasEntradaMap.get(categoria) || 0) + valor
        );
      } else {
        categoriasSaidaMap.set(
          categoria,
          (categoriasSaidaMap.get(categoria) || 0) + valor
        );
      }
    });

    // Converter categorias para formato do gráfico
    const cores = [
      "#3b82f6",
      "#22c55e",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#06b6d4",
      "#f97316",
      "#84cc16",
      "#ec4899",
      "#6366f1",
    ];

    const categoriasEntrada = Array.from(categoriasEntradaMap.entries()).map(
      ([name, value], index) => ({
        name,
        value,
        color: cores[index % cores.length],
      })
    );

    const categoriasSaida = Array.from(categoriasSaidaMap.entries()).map(
      ([name, value], index) => ({
        name,
        value,
        color: cores[index % cores.length],
      })
    );

    // Calcular resumo
    const totalEntradas = movimentacoes
      .filter((mov) => mov.tipo === "ENTRADA")
      .reduce((sum, mov) => sum + mov.valor.toNumber(), 0);

    const totalSaidas = movimentacoes
      .filter((mov) => mov.tipo === "SAIDA")
      .reduce((sum, mov) => sum + mov.valor.toNumber(), 0);

    const saldoLiquido = totalEntradas - totalSaidas;
    const movimentacoesCount = movimentacoes.length;
    const ticketMedio =
      movimentacoesCount > 0
        ? (totalEntradas + totalSaidas) / movimentacoesCount
        : 0;

    const relatorio = {
      fluxoCaixa,
      categoriasEntrada,
      categoriasSaida,
      resumo: {
        totalEntradas,
        totalSaidas,
        saldoLiquido,
        movimentacoes: movimentacoesCount,
        ticketMedio,
      },
    };

    return NextResponse.json(relatorio);
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}
