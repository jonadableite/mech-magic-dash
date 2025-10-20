import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Buscar todos os produtos de uma vez
    const produtos = await prisma.produto.findMany({
      select: {
        preco: true,
        quantidade: true,
        quantidadeMinima: true,
        categoria: true,
      },
    });

    // Calcular estatísticas
    const totalProdutos = produtos.length;

    const valorTotal = produtos.reduce((total, produto) => {
      const preco = Number(produto.preco);
      const quantidade = Number(produto.quantidade);
      return total + preco * quantidade;
    }, 0);

    const produtosEstoqueBaixo = produtos.filter(
      (p) => p.quantidade <= p.quantidadeMinima && p.quantidade > 0
    ).length;

    const produtosSemEstoque = produtos.filter(
      (p) => p.quantidade === 0
    ).length;

    // Agrupar por categoria
    const categoriasMap = new Map<string, number>();
    produtos.forEach((produto) => {
      const categoria = produto.categoria || "Sem categoria";
      categoriasMap.set(categoria, (categoriasMap.get(categoria) || 0) + 1);
    });

    const categorias = Array.from(categoriasMap.entries())
      .map(([categoria, quantidade]) => ({ categoria, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade);

    const stats = {
      totalProdutos,
      totalValor: valorTotal,
      produtosEstoqueBaixo,
      produtosSemEstoque,
      categorias,
    };

    return NextResponse.json({
      data: stats,
      success: true,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas do estoque:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}
