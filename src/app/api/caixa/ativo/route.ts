import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/caixa/ativo - Buscar caixa ativo
export async function GET() {
  try {
    const caixaAtivo = await prisma.caixa.findFirst({
      where: { status: "ABERTO" },
      include: {
        movimentacoes: {
          orderBy: { dataHora: "desc" },
          take: 10, // Limitar a 10 movimentações recentes
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    if (!caixaAtivo) {
      return NextResponse.json(
        { message: "Nenhum caixa ativo encontrado" },
        { status: 404 }
      );
    }

    // Converter Decimal para Number
    const caixaFormatted = {
      ...caixaAtivo,
      valorInicial: Number(caixaAtivo.valorInicial),
      valorFinal: caixaAtivo.valorFinal ? Number(caixaAtivo.valorFinal) : null,
      movimentacoes: caixaAtivo.movimentacoes.map((mov) => ({
        ...mov,
        valor: Number(mov.valor),
      })),
    };

    return NextResponse.json(caixaFormatted);
  } catch (error) {
    console.error("Erro ao buscar caixa ativo:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
