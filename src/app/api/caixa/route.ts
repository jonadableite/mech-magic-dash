import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCaixaSchema } from "@/lib/schemas";
import { z } from "zod";

// GET /api/caixa - Listar caixas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");

    const skip = (page - 1) * limit;

    // Filtros
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (dataInicio || dataFim) {
      where.dataAbertura = {};
      if (dataInicio) {
        where.dataAbertura.gte = new Date(dataInicio);
      }
      if (dataFim) {
        where.dataAbertura.lte = new Date(dataFim);
      }
    }

    // Buscar caixas
    const [caixas, total] = await Promise.all([
      prisma.caixa.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dataAbertura: "desc" },
        include: {
          movimentacoes: {
            orderBy: { dataHora: "desc" },
          },
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
        },
      }),
      prisma.caixa.count({ where }),
    ]);

    // Converter Decimal para Number
    const caixasFormatted = caixas.map((caixa) => ({
      ...caixa,
      valorInicial: Number(caixa.valorInicial),
      valorFinal: caixa.valorFinal ? Number(caixa.valorFinal) : null,
      movimentacoes: caixas.map((mov) => ({
        ...mov,
        valor: Number(mov.valor),
      })),
    }));

    return NextResponse.json({
      data: caixasFormatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar caixas:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST /api/caixa - Criar novo caixa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados
    const validatedData = createCaixaSchema.parse(body);

    // Verificar se já existe um caixa aberto
    const caixaAberto = await prisma.caixa.findFirst({
      where: { status: "ABERTO" },
    });

    if (caixaAberto) {
      return NextResponse.json(
        {
          message:
            "Já existe um caixa aberto. Feche o caixa atual antes de abrir um novo.",
        },
        { status: 400 }
      );
    }

    // Buscar ou criar usuário padrão
    let usuario = await prisma.usuario.findFirst({
      where: { email: "admin@oficina.com" },
    });

    if (!usuario) {
      usuario = await prisma.usuario.create({
        data: {
          nome: "Administrador",
          email: "admin@oficina.com",
          senha: "admin123",
          role: "ADMIN",
          ativo: true,
        },
      });
    }

    // Criar caixa
    const caixa = await prisma.caixa.create({
      data: {
        valorInicial: validatedData.valorInicial,
        observacoes: validatedData.observacoes,
        usuarioId: usuario.id,
      },
      include: {
        movimentacoes: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        ...caixa,
        valorInicial: Number(caixa.valorInicial),
        valorFinal: caixa.valorFinal ? Number(caixa.valorFinal) : null,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Dados inválidos",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("Erro ao criar caixa:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
