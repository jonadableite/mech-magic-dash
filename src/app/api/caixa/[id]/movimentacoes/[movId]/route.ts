import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateMovimentacaoSchema } from "@/lib/schemas";
import { ApiErrorHandler } from "@/lib/error-handler";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; movId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

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
    return ApiErrorHandler.handle(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; movId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

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
    return ApiErrorHandler.handle(error);
  }
}
