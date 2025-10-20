import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const [
      totalProdutos,
      totalValor,
      produtosEstoqueBaixo,
      produtosSemEstoque,
      categorias,
    ] = await Promise.all([
      // Total de produtos
      prisma.produto.count(),

      // Valor total do estoque (preço * quantidade)
      prisma.produto.findMany({
        select: {
          preco: true,
          quantidade: true,
        },
      }),

      // Produtos com estoque baixo
      prisma.produto.count({
        where: {
          quantidade: {
            lte: prisma.produto.fields.quantidadeMinima,
          },
          quantidade: {
            gt: 0,
          },
        },
      }),

      // Produtos sem estoque
      prisma.produto.count({
        where: {
          quantidade: 0,
        },
      }),

      // Categorias com quantidade
      prisma.produto.groupBy({
        by: ["categoria"],
        _count: {
          categoria: true,
        },
        where: {
          categoria: {
            not: null,
          },
        },
        orderBy: {
          _count: {
            categoria: "desc",
          },
        },
      }),
    ]);

    // Calcular valor total do estoque (preço * quantidade)
    const valorTotal = totalValor.reduce((total, produto) => {
      const preco = Number(produto.preco);
      const quantidade = Number(produto.quantidade);
      return total + preco * quantidade;
    }, 0);

    const stats = {
      totalProdutos,
      totalValor: valorTotal,
      produtosEstoqueBaixo,
      produtosSemEstoque,
      categorias: categorias.map((cat) => ({
        categoria: cat.categoria || "Sem categoria",
        quantidade: cat._count.categoria,
      })),
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
