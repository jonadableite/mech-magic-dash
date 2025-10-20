import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/caixa/[id]/stats - Buscar estatísticas do caixa
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar caixa
    const caixa = await prisma.caixa.findUnique({
      where: { id },
      include: {
        movimentacoes: true,
      },
    });

    if (!caixa) {
      return NextResponse.json(
        { message: "Caixa não encontrado" },
        { status: 404 }
      );
    }

    // Calcular estatísticas
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const movimentacoesHoje = caixa.movimentacoes.filter(
      (mov) => new Date(mov.dataHora) >= hoje
    );

    const totalEntradas = caixa.movimentacoes
      .filter((mov) => mov.tipo === "ENTRADA")
      .reduce((sum, mov) => sum + Number(mov.valor), 0);

    const totalSaidas = caixa.movimentacoes
      .filter((mov) => mov.tipo === "SAIDA")
      .reduce((sum, mov) => sum + Number(mov.valor), 0);

    const saldoAtual = Number(caixa.valorInicial) + totalEntradas - totalSaidas;

    const stats = {
      totalEntradas,
      totalSaidas,
      saldoAtual,
      movimentacoesHoje: movimentacoesHoje.length,
      valorInicial: Number(caixa.valorInicial),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Erro ao buscar estatísticas do caixa:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
