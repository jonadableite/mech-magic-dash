import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateVeiculoSchema } from "@/lib/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "ID do veículo é obrigatório", success: false },
        { status: 400 }
      );
    }

    const veiculo = await prisma.veiculo.findUnique({
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
        ordens: {
          include: {
            itens: true,
          },
          orderBy: { dataAbertura: "desc" },
        },
      },
    });

    if (!veiculo) {
      return NextResponse.json(
        { message: "Veículo não encontrado", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: veiculo,
      success: true,
    });
  } catch (error) {
    console.error("Erro ao buscar veículo:", error);
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
        { message: "ID do veículo é obrigatório", success: false },
        { status: 400 }
      );
    }

    // Validar dados com Zod
    const validatedData = updateVeiculoSchema.parse({ id, ...body });

    // Verificar se veículo existe
    const existingVeiculo = await prisma.veiculo.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            usuarioId: true,
          },
        },
      },
    });

    if (!existingVeiculo) {
      return NextResponse.json(
        { message: "Veículo não encontrado", success: false },
        { status: 404 }
      );
    }

    // Se está atualizando a placa, verificar se já existe
    if (body.placa && body.placa !== existingVeiculo.placa) {
      const placaExists = await prisma.veiculo.findFirst({
        where: {
          placa: body.placa,
          cliente: { usuarioId: existingVeiculo.cliente.usuarioId },
        },
      });

      if (placaExists) {
        return NextResponse.json(
          { message: "Placa já cadastrada", success: false },
          { status: 400 }
        );
      }
    }

    // Se está atualizando o cliente, verificar se existe
    if (body.clienteId && body.clienteId !== existingVeiculo.clienteId) {
      const cliente = await prisma.cliente.findUnique({
        where: { id: body.clienteId },
      });

      if (!cliente) {
        return NextResponse.json(
          { message: "Cliente não encontrado", success: false },
          { status: 404 }
        );
      }
    }

    const { id: _, ...updateData } = validatedData;
    const veiculo = await prisma.veiculo.update({
      where: { id },
      data: updateData,
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: veiculo,
      message: "Veículo atualizado com sucesso",
      success: true,
    });
  } catch (error) {
    console.error("Erro ao atualizar veículo:", error);

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
        { message: "ID do veículo é obrigatório", success: false },
        { status: 400 }
      );
    }

    // Verificar se veículo existe
    const existingVeiculo = await prisma.veiculo.findUnique({
      where: { id },
      include: {
        ordens: {
          where: {
            status: {
              in: ["ABERTA", "EM_ANDAMENTO", "AGUARDANDO_PECAS"],
            },
          },
        },
      },
    });

    if (!existingVeiculo) {
      return NextResponse.json(
        { message: "Veículo não encontrado", success: false },
        { status: 404 }
      );
    }

    // Verificar se há ordens em andamento
    if (existingVeiculo.ordens.length > 0) {
      return NextResponse.json(
        {
          message: "Não é possível excluir veículo com ordens em andamento",
          success: false,
        },
        { status: 400 }
      );
    }

    await prisma.veiculo.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Veículo excluído com sucesso",
      success: true,
    });
  } catch (error) {
    console.error("Erro ao excluir veículo:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}
