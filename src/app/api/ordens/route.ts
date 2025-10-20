import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { numero: { contains: search, mode: "insensitive" as const } },
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

    if (status) {
      where.status = status;
    }

    const [ordens, total] = await Promise.all([
      prisma.ordemServico.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
      }),
      prisma.ordemServico.count({ where }),
    ]);

    return NextResponse.json({
      data: ordens,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true,
    });
  } catch (error) {
    console.error("Erro ao buscar ordens:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      descricao,
      status = "ABERTA",
      prioridade = "MEDIA",
      observacoes,
      clienteId,
      veiculoId,
      itens = [],
    } = body;

    // Validar dados obrigatórios
    if (!descricao || !clienteId || !veiculoId) {
      return NextResponse.json(
        {
          message: "Descrição, cliente e veículo são obrigatórios",
          success: false,
        },
        { status: 400 }
      );
    }

    // Verificar se cliente e veículo existem
    const [cliente, veiculo] = await Promise.all([
      prisma.cliente.findUnique({ where: { id: clienteId } }),
      prisma.veiculo.findUnique({ where: { id: veiculoId } }),
    ]);

    if (!cliente) {
      return NextResponse.json(
        { message: "Cliente não encontrado", success: false },
        { status: 400 }
      );
    }

    if (!veiculo) {
      return NextResponse.json(
        { message: "Veículo não encontrado", success: false },
        { status: 400 }
      );
    }

    // Gerar número da ordem
    const ultimaOrdem = await prisma.ordemServico.findFirst({
      orderBy: { createdAt: "desc" },
    });

    const proximoNumero = ultimaOrdem
      ? parseInt(ultimaOrdem.numero.replace("#OS-", "")) + 1
      : 1;

    const numero = `#OS-${proximoNumero.toString().padStart(4, "0")}`;

    // Calcular valor total dos itens
    const valorTotal = itens.reduce((total: number, item: any) => {
      return total + item.quantidade * item.valorUnitario;
    }, 0);

    const ordem = await prisma.ordemServico.create({
      data: {
        numero,
        descricao,
        status,
        prioridade,
        observacoes,
        valorTotal,
        clienteId,
        veiculoId,
        itens: {
          create: itens.map((item: any) => ({
            descricao: item.descricao,
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
            valorTotal: item.quantidade * item.valorUnitario,
            observacoes: item.observacoes,
          })),
        },
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

    return NextResponse.json(
      {
        data: ordem,
        message: "Ordem de serviço criada com sucesso",
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar ordem:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}
