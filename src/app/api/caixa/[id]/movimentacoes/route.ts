import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createMovimentacaoSchema } from "@/lib/schemas";
import { ApiErrorHandler } from "@/lib/error-handler";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    const { id: caixaId } = await params;
    const body = await request.json();
    const validatedData = createMovimentacaoSchema.parse(body);

    // Verificar se o caixa existe e está aberto
    const caixa = await prisma.caixa.findUnique({
      where: { id: caixaId },
    });

    if (!caixa) {
      return NextResponse.json(
        { message: "Caixa não encontrado." },
        { status: 404 }
      );
    }

    if (caixa.status === "FECHADO") {
      return NextResponse.json(
        {
          message:
            "Não é possível adicionar movimentações em um caixa fechado.",
        },
        { status: 400 }
      );
    }

    // Criar a movimentação
    const movimentacao = await prisma.movimentacaoCaixa.create({
      data: {
        tipo: validatedData.tipo,
        valor: validatedData.valor,
        descricao: validatedData.descricao,
        categoria: validatedData.categoria,
        observacoes: validatedData.observacoes,
        caixaId: caixaId,
        ordemId: validatedData.ordemId,
      },
    });

    return NextResponse.json(movimentacao, { status: 201 });
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}
