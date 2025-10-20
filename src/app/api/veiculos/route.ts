import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createVeiculoSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const clienteId = searchParams.get("clienteId") || "";

    const skip = (page - 1) * limit;

    const where: any = {};

    // Filtro de busca
    if (search) {
      where.OR = [
        { marca: { contains: search, mode: "insensitive" as const } },
        { modelo: { contains: search, mode: "insensitive" as const } },
        { placa: { contains: search, mode: "insensitive" as const } },
        { cor: { contains: search, mode: "insensitive" as const } },
        {
          cliente: { nome: { contains: search, mode: "insensitive" as const } },
        },
      ];
    }

    // Filtro por cliente
    if (clienteId) {
      where.clienteId = clienteId;
    }

    const [veiculos, total] = await Promise.all([
      prisma.veiculo.findMany({
        where,
        skip,
        take: limit,
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
            select: {
              id: true,
              numero: true,
              status: true,
              valorTotal: true,
              dataAbertura: true,
            },
            orderBy: { dataAbertura: "desc" },
            take: 3, // Últimas 3 ordens
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.veiculo.count({ where }),
    ]);

    return NextResponse.json({
      data: veiculos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true,
    });
  } catch (error) {
    console.error("Erro ao buscar veículos:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados com Zod
    const validatedData = createVeiculoSchema.parse(body);

    // Verificar se placa já existe
    const existingVeiculo = await prisma.veiculo.findUnique({
      where: { placa: validatedData.placa },
    });

    if (existingVeiculo) {
      return NextResponse.json(
        { message: "Placa já cadastrada", success: false },
        { status: 400 }
      );
    }

    // Verificar se cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: validatedData.clienteId },
    });

    if (!cliente) {
      return NextResponse.json(
        { message: "Cliente não encontrado", success: false },
        { status: 404 }
      );
    }

    const veiculo = await prisma.veiculo.create({
      data: validatedData,
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

    return NextResponse.json(
      {
        data: veiculo,
        message: "Veículo criado com sucesso",
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar veículo:", error);

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
