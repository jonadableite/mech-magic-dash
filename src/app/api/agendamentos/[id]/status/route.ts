import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum([
    "AGENDADO",
    "CONFIRMADO",
    "EM_ANDAMENTO",
    "FINALIZADO",
    "CANCELADO",
    "FALTOU",
  ]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "ID do agendamento é obrigatório", success: false },
        { status: 400 }
      );
    }

    // Validar dados com Zod
    const validatedData = updateStatusSchema.parse(body);

    // Verificar se agendamento existe
    const existingAgendamento = await prisma.agendamento.findUnique({
      where: { id },
    });

    if (!existingAgendamento) {
      return NextResponse.json(
        { message: "Agendamento não encontrado", success: false },
        { status: 404 }
      );
    }

    // Verificar se pode alterar status
    if (
      existingAgendamento.status === "FINALIZADO" &&
      validatedData.status !== "FINALIZADO"
    ) {
      return NextResponse.json(
        {
          message: "Não é possível alterar status de agendamento finalizado",
          success: false,
        },
        { status: 400 }
      );
    }

    const agendamento = await prisma.agendamento.update({
      where: { id },
      data: {
        status: validatedData.status,
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
      },
    });

    return NextResponse.json({
      data: agendamento,
      message: "Status atualizado com sucesso",
      success: true,
    });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { message: "Status inválido", success: false },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}
