import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clienteId: string }> }
) {
  try {
    const { clienteId } = await params;

    if (!clienteId) {
      return NextResponse.json(
        { message: "ID do cliente é obrigatório", success: false },
        { status: 400 }
      );
    }

    // Verificar se cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      return NextResponse.json(
        { message: "Cliente não encontrado", success: false },
        { status: 404 }
      );
    }

    const veiculos = await prisma.veiculo.findMany({
      where: { clienteId },
      include: {
        ordens: {
          select: {
            id: true,
            numero: true,
            status: true,
            valorTotal: true,
            dataAbertura: true,
          },
          orderBy: { dataAbertura: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      data: veiculos,
      success: true,
    });
  } catch (error) {
    console.error("Erro ao buscar veículos do cliente:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}
