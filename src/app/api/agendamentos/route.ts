import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAgendamentoSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const dataInicio = searchParams.get("dataInicio") || "";
    const dataFim = searchParams.get("dataFim") || "";

    const skip = (page - 1) * limit;

    const where: any = {};

    // Filtro de busca
    if (search) {
      where.OR = [
        { descricao: { contains: search, mode: "insensitive" as const } },
        {
          cliente: { nome: { contains: search, mode: "insensitive" as const } },
        },
        {
          veiculo: {
            placa: { contains: search, mode: "insensitive" as const },
          },
        },
      ];
    }

    // Filtro por status
    if (status) {
      where.status = status;
    }

    // Filtro por data
    if (dataInicio && dataFim) {
      where.dataHora = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim),
      };
    } else if (dataInicio) {
      where.dataHora = {
        gte: new Date(dataInicio),
      };
    } else if (dataFim) {
      where.dataHora = {
        lte: new Date(dataFim),
      };
    }

    const [agendamentos, total] = await Promise.all([
      prisma.agendamento.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ dataHora: "asc" }],
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
      }),
      prisma.agendamento.count({ where }),
    ]);

    return NextResponse.json({
      data: agendamentos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true,
    });
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createAgendamentoSchema.parse(body);

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

    // Verificar se veículo existe
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
    if (veiculo.clienteId !== validatedData.clienteId) {
      return NextResponse.json(
        { message: "Veículo não pertence ao cliente", success: false },
        { status: 400 }
      );
    }

    // Verificar conflito de horário
    const conflito = await prisma.agendamento.findFirst({
      where: {
        dataHora: new Date(validatedData.dataHora),
        status: {
          not: "CANCELADO",
        },
      },
    });

    if (conflito) {
      return NextResponse.json(
        { message: "Já existe um agendamento neste horário", success: false },
        { status: 400 }
      );
    }

    const agendamento = await prisma.agendamento.create({
      data: {
        ...validatedData,
        dataHora: new Date(validatedData.dataHora),
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

    return NextResponse.json(
      {
        data: agendamento,
        message: "Agendamento criado com sucesso",
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
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
