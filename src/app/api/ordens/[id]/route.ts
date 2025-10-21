import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/providers/prisma";
import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";

// Schema de validação para atualização de ordem (Single Responsibility Principle)
const updateOrdemSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória").optional(),
  status: z
    .enum([
      "ABERTA",
      "EM_ANDAMENTO",
      "AGUARDANDO_PECAS",
      "FINALIZADA",
      "CANCELADA",
    ])
    .optional(),
  prioridade: z.enum(["BAIXA", "MEDIA", "ALTA", "URGENTE"]).optional(),
  observacoes: z.string().optional(),
  clienteId: z.string().uuid("ID do cliente inválido").optional(),
  veiculoId: z.string().uuid("ID do veículo inválido").optional(),
  itens: z
    .array(
      z.object({
        descricao: z.string().min(1, "Descrição do item é obrigatória"),
        quantidade: z.number().min(1, "Quantidade deve ser maior que 0"),
        valorUnitario: z
          .number()
          .min(0, "Valor unitário deve ser maior ou igual a 0"),
        observacoes: z.string().optional(),
      })
    )
    .optional(),
});

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

// GET /api/ordens/[id] - Buscar ordem específica
export async function GET(
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

    const ordem = await prisma.ordemServico.findFirst({
      where: {
        id,
        cliente: { usuarioId: userId },
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

    if (!ordem) {
      return NextResponse.json(
        { message: "Ordem não encontrada", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: ordem,
      success: true,
    });
  } catch (error) {
    console.error("Erro ao buscar ordem:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}

// PUT /api/ordens/[id] - Atualizar ordem
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

    const body = await request.json();
    const validatedData = updateOrdemSchema.parse(body);

    // Verificar se a ordem existe e pertence ao usuário
    const ordemExistente = await prisma.ordemServico.findFirst({
      where: {
        id,
        cliente: { usuarioId: userId },
      },
    });

    if (!ordemExistente) {
      return NextResponse.json(
        { message: "Ordem não encontrada", success: false },
        { status: 404 }
      );
    }

    // Verificar se cliente e veículo existem (se fornecidos)
    if (validatedData.clienteId) {
      const cliente = await prisma.cliente.findFirst({
        where: {
          id: validatedData.clienteId,
          usuarioId: userId,
        },
      });
      if (!cliente) {
        return NextResponse.json(
          { message: "Cliente não encontrado", success: false },
          { status: 400 }
        );
      }
    }

    if (validatedData.veiculoId) {
      const veiculo = await prisma.veiculo.findFirst({
        where: {
          id: validatedData.veiculoId,
          cliente: { usuarioId: userId },
        },
      });
      if (!veiculo) {
        return NextResponse.json(
          { message: "Veículo não encontrado", success: false },
          { status: 400 }
        );
      }
    }

    // Calcular novo valor total se itens foram fornecidos
    let valorTotal = ordemExistente.valorTotal;
    if (validatedData.itens) {
      const totalCalculado = validatedData.itens.reduce((total, item) => {
        return total + item.quantidade * item.valorUnitario;
      }, 0);
      valorTotal = new Decimal(totalCalculado);
    }

    // Separar campos diretos dos relacionamentos
    const { itens, ...camposDiretos } = validatedData;

    // Atualizar ordem
    const ordemAtualizada = await prisma.ordemServico.update({
      where: { id },
      data: {
        ...camposDiretos,
        valorTotal,
        ...(itens && {
          itens: {
            deleteMany: {},
            create: itens.map((item) => ({
              descricao: item.descricao,
              quantidade: item.quantidade,
              valorUnitario: item.valorUnitario,
              valorTotal: new Decimal(item.quantidade * item.valorUnitario),
              observacoes: item.observacoes,
            })),
          },
        }),
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
      data: ordemAtualizada,
      message: "Ordem atualizada com sucesso",
      success: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Dados inválidos",
          errors: error.errors,
          success: false,
        },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar ordem:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/ordens/[id] - Deletar ordem
export async function DELETE(
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

    // Verificar se a ordem pode ser deletada (não finalizada)
    if (ordem.status === "FINALIZADA") {
      return NextResponse.json(
        {
          message: "Não é possível deletar uma ordem finalizada",
          success: false,
        },
        { status: 400 }
      );
    }

    // Deletar ordem (cascade deleta os itens)
    await prisma.ordemServico.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Ordem deletada com sucesso",
      success: true,
    });
  } catch (error) {
    console.error("Erro ao deletar ordem:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}
