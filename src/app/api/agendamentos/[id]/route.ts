import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateAgendamentoSchema } from "@/lib/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "ID do agendamento é obrigatório", success: false },
        { status: 400 }
      );
    }

    const agendamento = await prisma.agendamento.findUnique({
      where: { id },
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

    if (!agendamento) {
      return NextResponse.json(
        { message: "Agendamento não encontrado", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: agendamento,
      success: true,
    });
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const validatedData = updateAgendamentoSchema.parse({ id, ...body });

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

    // Verificar se cliente existe (se fornecido)
    if (validatedData.clienteId) {
      const cliente = await prisma.cliente.findUnique({
        where: { id: validatedData.clienteId },
      });

      if (!cliente) {
        return NextResponse.json(
          { message: "Cliente não encontrado", success: false },
          { status: 404 }
        );
      }
    }

    // Verificar se veículo existe (se fornecido)
    if (validatedData.veiculoId) {
      const veiculo = await prisma.veiculo.findUnique({
        where: { id: validatedData.veiculoId },
      });

      if (!veiculo) {
        return NextResponse.json(
          { message: "Veículo não encontrado", success: false },
          { status: 404 }
        );
      }

      // Verificar se veículo pertence ao cliente
      if (
        veiculo.clienteId !==
        (validatedData.clienteId || existingAgendamento.clienteId)
      ) {
        return NextResponse.json(
          { message: "Veículo não pertence ao cliente", success: false },
          { status: 400 }
        );
      }
    }

    // Verificar conflito de horário (se dataHora foi alterada)
    if (validatedData.dataHora) {
      const conflito = await prisma.agendamento.findFirst({
        where: {
          dataHora: new Date(validatedData.dataHora),
          status: {
            not: "CANCELADO",
          },
          id: {
            not: id,
          },
        },
      });

      if (conflito) {
        return NextResponse.json(
          { message: "Já existe um agendamento neste horário", success: false },
          { status: 400 }
        );
      }
    }

    const agendamento = await prisma.agendamento.update({
      where: { id },
      data: {
        ...validatedData,
        dataHora: validatedData.dataHora
          ? new Date(validatedData.dataHora)
          : undefined,
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
      message: "Agendamento atualizado com sucesso",
      success: true,
    });
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "ID do agendamento é obrigatório", success: false },
        { status: 400 }
      );
    }

    const existingAgendamento = await prisma.agendamento.findUnique({
      where: { id },
    });

    if (!existingAgendamento) {
      return NextResponse.json(
        { message: "Agendamento não encontrado", success: false },
        { status: 404 }
      );
    }

    // Verificar se pode ser excluído (não pode excluir se já foi finalizado)
    if (existingAgendamento.status === "FINALIZADO") {
      return NextResponse.json(
        {
          message: "Não é possível excluir agendamento finalizado",
          success: false,
        },
        { status: 400 }
      );
    }

    await prisma.agendamento.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Agendamento excluído com sucesso",
      success: true,
    });
  } catch (error) {
    console.error("Erro ao excluir agendamento:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}
