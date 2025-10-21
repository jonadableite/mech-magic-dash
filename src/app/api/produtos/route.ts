import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/providers/prisma";
import { createProdutoSchema } from "@/lib/schemas";

// Helper para obter userId da sessão
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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const categoria = searchParams.get("categoria") || "";
    const estoqueBaixo = searchParams.get("estoqueBaixo") === "true";

    const skip = (page - 1) * limit;

    const where: any = {};

    // Filtro de busca
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" as const } },
        { codigo: { contains: search, mode: "insensitive" as const } },
        { categoria: { contains: search, mode: "insensitive" as const } },
        { fornecedor: { contains: search, mode: "insensitive" as const } },
      ];
    }

    // Filtro por categoria
    if (categoria) {
      where.categoria = { contains: categoria, mode: "insensitive" as const };
    }

    // Filtro de estoque baixo
    if (estoqueBaixo) {
      where.quantidade = { lte: prisma.produto.fields.quantidadeMinima };
    }

    const [produtos, total] = await Promise.all([
      prisma.produto.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { quantidade: "asc" }, // Produtos com estoque baixo primeiro
          { nome: "asc" },
        ],
      }),
      prisma.produto.count({ where }),
    ]);

    // Converter preços para números para evitar problemas de precisão
    const produtosFormatados = produtos.map((produto) => ({
      ...produto,
      preco: Number(produto.preco),
    }));

    return NextResponse.json({
      data: produtosFormatados,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true,
    });
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
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

    // Validar dados com Zod
    const validatedData = createProdutoSchema.parse(body);

    // Verificar se código já existe para o usuário
    const existingProduto = await prisma.produto.findFirst({
      where: {
        codigo: validatedData.codigo,
        usuarioId: userId,
      },
    });

    if (existingProduto) {
      return NextResponse.json(
        { message: "Código já cadastrado", success: false },
        { status: 400 }
      );
    }

    const produto = await prisma.produto.create({
      data: {
        ...validatedData,
        usuarioId: userId,
      },
    });

    return NextResponse.json(
      {
        data: produto,
        message: "Produto criado com sucesso",
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar produto:", error);

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
