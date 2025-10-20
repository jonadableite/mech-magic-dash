import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Buscar todos os produtos e filtrar no código
    const produtos = await prisma.produto.findMany({
      orderBy: [{ quantidade: "asc" }, { nome: "asc" }],
    });

    // Filtrar produtos com estoque baixo
    const produtosEstoqueBaixo = produtos.filter(
      (produto) => produto.quantidade <= produto.quantidadeMinima
    );

    return NextResponse.json({
      data: produtosEstoqueBaixo,
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
