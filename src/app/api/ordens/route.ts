import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/providers/prisma";
import { z } from "zod";

// Schema de validação para criação de ordem (Single Responsibility Principle)
const createOrdemSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  status: z
    .enum([
      "ABERTA",
      "EM_ANDAMENTO",
      "AGUARDANDO_PECAS",
      "FINALIZADA",
      "CANCELADA",
    ])
    .default("ABERTA"),
  prioridade: z.enum(["BAIXA", "MEDIA", "ALTA", "URGENTE"]).default("MEDIA"),
  observacoes: z.string().optional(),
  clienteId: z.string().uuid("ID do cliente inválido"),
  veiculoId: z.string().uuid("ID do veículo inválido"),
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
    .default([]),
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

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession(request);

    if (!userId) {
      return NextResponse.json(
        { message: "Não autorizado", success: false },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    const where: any = {
      cliente: { usuarioId: userId },
    };

    if (search) {
      where.OR = [
        { numero: { contains: search, mode: "insensitive" as const } },
        {
          cliente: {
            nome: { contains: search, mode: "insensitive" as const },
            usuarioId: userId,
          },
        },
        {
          veiculo: {
            placa: { contains: search, mode: "insensitive" as const },
            cliente: { usuarioId: userId },
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
    const userId = await getUserIdFromSession(request);

    if (!userId) {
      return NextResponse.json(
        { message: "Não autorizado", success: false },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createOrdemSchema.parse(body);

    // Verificar se cliente e veículo existem e pertencem ao usuário
    const [cliente, veiculo] = await Promise.all([
      prisma.cliente.findFirst({
        where: {
          id: validatedData.clienteId,
          usuarioId: userId,
        },
      }),
      prisma.veiculo.findFirst({
        where: {
          id: validatedData.veiculoId,
          cliente: { usuarioId: userId },
        },
      }),
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
    const valorTotal = validatedData.itens.reduce((total, item) => {
      return total + item.quantidade * item.valorUnitario;
    }, 0);

    const ordem = await prisma.ordemServico.create({
      data: {
        numero,
        descricao: validatedData.descricao,
        status: validatedData.status,
        prioridade: validatedData.prioridade,
        observacoes: validatedData.observacoes,
        valorTotal,
        clienteId: validatedData.clienteId,
        veiculoId: validatedData.veiculoId,
        usuarioId: userId,
        itens: {
          create: validatedData.itens.map((item) => ({
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

    console.error("Erro ao criar ordem:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}
