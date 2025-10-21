import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateClienteSchema } from "@/lib/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        veiculos: true,
        ordens: {
          include: {
            veiculo: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!cliente) {
      return NextResponse.json(
        { message: "Cliente não encontrado", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: cliente,
      success: true,
    });
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
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
        { message: "ID do cliente é obrigatório", success: false },
        { status: 400 }
      );
    }

    // Validar dados com Zod
    const validatedData = updateClienteSchema.parse({ id, ...body });

    // Verificar se cliente existe
    const existingCliente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!existingCliente) {
      return NextResponse.json(
        { message: "Cliente não encontrado", success: false },
        { status: 404 }
      );
    }

    // Se está atualizando o email, verificar se já existe
    if (body.email && body.email !== existingCliente.email) {
      const emailExists = await prisma.cliente.findFirst({
        where: {
          email: body.email,
          usuarioId: existingCliente.usuarioId,
        },
      });

      if (emailExists) {
        return NextResponse.json(
          { message: "Email já cadastrado", success: false },
          { status: 400 }
        );
      }
    }

    const { id: _, ...updateData } = validatedData;
    const cliente = await prisma.cliente.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      data: cliente,
      message: "Cliente atualizado com sucesso",
      success: true,
    });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);

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
        { message: "ID do cliente é obrigatório", success: false },
        { status: 400 }
      );
    }

    // Verificar se cliente existe
    const existingCliente = await prisma.cliente.findUnique({
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

    if (!existingCliente) {
      return NextResponse.json(
        { message: "Cliente não encontrado", success: false },
        { status: 404 }
      );
    }

    // Verificar se há ordens em andamento
    if (existingCliente.ordens.length > 0) {
      return NextResponse.json(
        {
          message: "Não é possível excluir cliente com ordens em andamento",
          success: false,
        },
        { status: 400 }
      );
    }

    await prisma.cliente.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Cliente excluído com sucesso",
      success: true,
    });
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}
