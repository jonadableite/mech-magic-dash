import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/providers/prisma";

// Helper para obter userId da sessão (Dependency Inversion Principle)
async function getUserIdFromSession(
  request: NextRequest
): Promise<string | null> {
  const sessionToken = request.cookies.get("session-token")?.value;
  if (!sessionToken) return null;

  try {
    const session = await prisma.sessao.findUnique({
      where: { token: sessionToken },
      include: { usuario: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session.userId;
  } catch (error) {
    console.error("Erro ao buscar sessão:", error);
    return null;
  }
}

// PUT /api/ordens/[id]/finalizar - Finalizar ordem de serviço
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserIdFromSession(request);

    if (!userId) {
      return NextResponse.json(
        { message: "Não autorizado", success: false },
        { status: 401 }
      );
    }

    // Verificar se a ordem existe e pertence ao usuário
    const ordem = await prisma.ordemServico.findFirst({
      where: {
        id,
        cliente: { usuarioId: userId },
      },
    });

    if (!ordem) {
      return NextResponse.json(
        { message: "Ordem não encontrada", success: false },
        { status: 404 }
      );
    }

    // Verificar se a ordem pode ser finalizada
    if (ordem.status === "FINALIZADA") {
      return NextResponse.json(
        { message: "Ordem já está finalizada", success: false },
        { status: 400 }
      );
    }

    if (ordem.status === "CANCELADA") {
      return NextResponse.json(
        {
          message: "Não é possível finalizar uma ordem cancelada",
          success: false,
        },
        { status: 400 }
      );
    }

    // Finalizar ordem
    const ordemFinalizada = await prisma.ordemServico.update({
      where: { id },
      data: {
        status: "FINALIZADA",
        dataFechamento: new Date(),
      },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
        veiculo: {
          select: {
            id: true,
            marca: true,
            modelo: true,
            ano: true,
            placa: true,
          },
        },
        itens: true,
      },
    });

    return NextResponse.json({
      data: ordemFinalizada,
      message: "Ordem finalizada com sucesso",
      success: true,
    });
  } catch (error) {
    console.error("Erro ao finalizar ordem:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}
