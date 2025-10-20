import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Buscar estatísticas do dashboard
    const [
      ordensAbertas,
      clientesAtivos,
      totalProdutos,
      faturamentoMensal,
      ordensRecentes,
      estoqueBaixo,
    ] = await Promise.all([
      // Ordens abertas (não finalizadas)
      prisma.ordemServico.count({
        where: {
          status: {
            not: "FINALIZADA",
          },
        },
      }),

      // Clientes ativos (com pelo menos uma ordem)
      prisma.cliente.count({
        where: {
          ordens: {
            some: {},
          },
        },
      }),

      // Total de itens em estoque
      prisma.produto.aggregate({
        _sum: {
          quantidade: true,
        },
      }),

      // Faturamento do mês atual
      prisma.ordemServico.aggregate({
        where: {
          status: "FINALIZADA",
          dataFechamento: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: {
          valorTotal: true,
        },
      }),

      // Ordens recentes (últimas 5)
      prisma.ordemServico.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          cliente: {
            select: {
              nome: true,
            },
          },
          veiculo: {
            select: {
              marca: true,
              modelo: true,
              ano: true,
            },
          },
        },
      }),

      // Produtos com estoque baixo
      prisma.produto.findMany({
        where: {
          quantidade: {
            lte: prisma.produto.fields.quantidadeMinima,
          },
        },
        take: 5,
        orderBy: { quantidade: "asc" },
      }),
    ]);

    // Calcular variações (simulado - em produção você compararia com dados do mês anterior)
    const variacaoOrdens = 12; // +12%
    const variacaoClientes = 8; // +8%
    const variacaoEstoque = -3; // -3%
    const variacaoFaturamento = 18; // +18%

    const dashboardData = {
      stats: {
        ordensAbertas,
        clientesAtivos,
        itensEstoque: totalProdutos._sum.quantidade || 0,
        faturamentoMensal: Number(faturamentoMensal._sum.valorTotal || 0),
        variacaoOrdens,
        variacaoClientes,
        variacaoEstoque,
        variacaoFaturamento,
      },
      ordensRecentes: ordensRecentes.map((ordem) => ({
        id: ordem.id,
        numero: ordem.numero,
        cliente: ordem.cliente.nome,
        veiculo: `${ordem.veiculo.marca} ${ordem.veiculo.modelo} ${ordem.veiculo.ano}`,
        status: ordem.status,
        prioridade: ordem.prioridade,
      })),
      estoqueBaixo: estoqueBaixo.map((produto) => ({
        id: produto.id,
        nome: produto.nome,
        quantidade: produto.quantidade,
        quantidadeMinima: produto.quantidadeMinima,
      })),
    };

    return NextResponse.json({
      data: dashboardData,
      success: true,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}
