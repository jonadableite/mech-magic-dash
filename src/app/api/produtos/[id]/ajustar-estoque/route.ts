import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ajustarEstoqueSchema = z.object({
  quantidade: z.number().int().min(1, "Quantidade deve ser maior que zero"),
  tipo: z.enum(["entrada", "saida"], {
    errorMap: () => ({ message: "Tipo deve ser 'entrada' ou 'saida'" }),
  }),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "ID do produto é obrigatório", success: false },
        { status: 400 }
      );
    }

    // Validar dados
    const { quantidade, tipo } = ajustarEstoqueSchema.parse(body);

    // Verificar se produto existe
    const produto = await prisma.produto.findUnique({
      where: { id },
    });

    if (!produto) {
      return NextResponse.json(
        { message: "Produto não encontrado", success: false },
        { status: 404 }
      );
    }

    // Calcular nova quantidade
    const novaQuantidade =
      tipo === "entrada"
        ? produto.quantidade + quantidade
        : produto.quantidade - quantidade;

    // Verificar se não ficará negativo
    if (novaQuantidade < 0) {
      return NextResponse.json(
        {
          message: "Quantidade insuficiente em estoque",
          success: false,
        },
        { status: 400 }
      );
    }

    // Atualizar estoque
    const produtoAtualizado = await prisma.produto.update({
      where: { id },
      data: {
        quantidade: novaQuantidade,
      },
    });

    return NextResponse.json({
      data: produtoAtualizado,
      message: `Estoque ${
        tipo === "entrada" ? "adicionado" : "removido"
      } com sucesso`,
      success: true,
    });
  } catch (error) {
    console.error("Erro ao ajustar estoque:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { message: "Dados inválidos", success: false },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}
