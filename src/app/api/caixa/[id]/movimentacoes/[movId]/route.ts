import { NextResponse } from "next/server";
import { prisma } from "@/providers/prisma";
import { z } from "zod";

const updateMovimentacaoSchema = z.object({
  tipo: z.enum(["ENTRADA", "SAIDA"]),
  valor: z.number().min(0.01, "Valor deve ser maior que zero"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  categoria: z
    .enum([
      "VENDAS",
      "SERVICOS",
      "PAGAMENTOS",
      "RECEBIMENTOS",
      "DESPESAS",
      "INVESTIMENTOS",
      "OUTROS",
    ])
    .optional(),
  observacoes: z.string().optional(),
});

async function getUserIdFromSession(request: Request): Promise<string> {
  const sessionToken = request.headers
    .get("cookie")
    ?.match(/session-token=([^;]+)/)?.[1];

  if (!sessionToken) {
    throw new Error("Token de sessão não encontrado");
  }

  const session = await prisma.sessao.findUnique({
    where: { token: sessionToken },
    include: { usuario: true },
  });

  if (!session || !session.usuario) {
    throw new Error("Sessão inválida");
  }

  return session.usuario.id;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; movId: string }> }
) {
  try {
    const userId = await getUserIdFromSession(request);
    const { id: caixaId, movId } = await params;
    const body = await request.json();
    const validatedData = updateMovimentacaoSchema.parse(body);

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
        { message: "Não é possível editar movimentações em um caixa fechado." },
        { status: 400 }
      );
    }

    // Verificar se a movimentação existe
    const movimentacao = await prisma.movimentacaoCaixa.findUnique({
      where: { id: movId },
    });

    if (!movimentacao) {
      return NextResponse.json(
        { message: "Movimentação não encontrada." },
        { status: 404 }
      );
    }

    // Atualizar a movimentação
    const movimentacaoAtualizada = await prisma.movimentacaoCaixa.update({
      where: { id: movId },
      data: validatedData,
    });

    return NextResponse.json(movimentacaoAtualizada);
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error) || "Erro desconhecido";
    console.error("Erro ao atualizar movimentação:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; movId: string }> }
) {
  try {
    const userId = await getUserIdFromSession(request);
    const { id: caixaId, movId } = await params;

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
          message: "Não é possível excluir movimentações de um caixa fechado.",
        },
        { status: 400 }
      );
    }

    // Verificar se a movimentação existe
    const movimentacao = await prisma.movimentacaoCaixa.findUnique({
      where: { id: movId },
    });

    if (!movimentacao) {
      return NextResponse.json(
        { message: "Movimentação não encontrada." },
        { status: 404 }
      );
    }

    // Excluir a movimentação
    await prisma.movimentacaoCaixa.delete({
      where: { id: movId },
    });

    return NextResponse.json({ message: "Movimentação excluída com sucesso." });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error) || "Erro desconhecido";
    console.error("Erro ao excluir movimentação:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
