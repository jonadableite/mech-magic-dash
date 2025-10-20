import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateProdutoSchema } from "@/lib/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "ID do produto é obrigatório", success: false },
        { status: 400 }
      );
    }

    const produto = await prisma.produto.findUnique({
      where: { id },
    });

    if (!produto) {
      return NextResponse.json(
        { message: "Produto não encontrado", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: produto,
      success: true,
    });
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
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
        { message: "ID do produto é obrigatório", success: false },
        { status: 400 }
      );
    }

    // Validar dados com Zod
    const validatedData = updateProdutoSchema.parse({ id, ...body });

    // Verificar se produto existe
    const existingProduto = await prisma.produto.findUnique({
      where: { id },
    });

    if (!existingProduto) {
      return NextResponse.json(
        { message: "Produto não encontrado", success: false },
        { status: 404 }
      );
    }

    // Se está atualizando o código, verificar se já existe
    if (body.codigo && body.codigo !== existingProduto.codigo) {
      const codigoExists = await prisma.produto.findUnique({
        where: { codigo: body.codigo },
      });

      if (codigoExists) {
        return NextResponse.json(
          { message: "Código já cadastrado", success: false },
          { status: 400 }
        );
      }
    }

    const { id: _, ...updateData } = validatedData;
    const produto = await prisma.produto.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      data: produto,
      message: "Produto atualizado com sucesso",
      success: true,
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);

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
        { message: "ID do produto é obrigatório", success: false },
        { status: 400 }
      );
    }

    // Verificar se produto existe
    const existingProduto = await prisma.produto.findUnique({
      where: { id },
    });

    if (!existingProduto) {
      return NextResponse.json(
        { message: "Produto não encontrado", success: false },
        { status: 404 }
      );
    }

    await prisma.produto.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Produto excluído com sucesso",
      success: true,
    });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}
