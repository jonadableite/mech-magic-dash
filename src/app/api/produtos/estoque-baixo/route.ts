import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const produtos = await prisma.produto.findMany({
      where: {
        quantidade: {
          lte: prisma.produto.fields.quantidadeMinima,
        },
      },
      orderBy: [
        { quantidade: "asc" },
        { nome: "asc" },
      ],
    });

    return NextResponse.json({
      data: produtos,
      success: true,
    });
  } catch (error) {
    console.error("Erro ao buscar produtos com estoque baixo:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}