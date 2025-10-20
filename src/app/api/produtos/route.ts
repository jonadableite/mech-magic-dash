import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProdutoSchema } from "@/lib/schemas";

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
    const body = await request.json();

    // Validar dados com Zod
    const validatedData = createProdutoSchema.parse(body);

    // Verificar se código já existe
    const existingProduto = await prisma.produto.findUnique({
      where: { codigo: validatedData.codigo },
    });

    if (existingProduto) {
      return NextResponse.json(
        { message: "Código já cadastrado", success: false },
        { status: 400 }
      );
    }

    const produto = await prisma.produto.create({
      data: validatedData,
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
