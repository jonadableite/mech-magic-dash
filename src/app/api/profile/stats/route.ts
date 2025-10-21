import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/providers/prisma";

// Função para obter ID do usuário da sessão (Single Responsibility Principle)
async function getUserIdFromSession(request: NextRequest): Promise<string> {
  const sessionToken = request.cookies.get("session-token")?.value;

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

// GET - Buscar estatísticas do perfil
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession(request);

    // Buscar estatísticas em paralelo (Performance Optimization)
    const [totalClientes, totalVeiculos, totalOrdens, totalProdutos] =
      await Promise.all([
        prisma.cliente.count({ where: { usuarioId: userId } }),
        prisma.veiculo.count({ where: { usuarioId: userId } }),
        prisma.ordemServico.count({ where: { usuarioId: userId } }),
        prisma.produto.count({ where: { usuarioId: userId } }),
      ]);

    const stats = {
      totalClientes,
      totalVeiculos,
      totalOrdens,
      totalProdutos,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error) || "Erro desconhecido";
    console.error("Erro ao buscar estatísticas do perfil:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
