import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const categoria = searchParams.get("categoria") || "";

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" as const } },
        { codigo: { contains: search, mode: "insensitive" as const } },
        { categoria: { contains: search, mode: "insensitive" as const } },
      ];
    }

    if (categoria) {
      where.categoria = categoria;
    }

    const [produtos, total] = await Promise.all([
      prisma.produto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.produto.count({ where }),
    ]);

    return NextResponse.json({
      data: produtos,
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
    const {
      nome,
      descricao,
      codigo,
      preco,
      quantidade = 0,
      quantidadeMinima = 0,
      categoria,
      fornecedor,
    } = body;

    // Validar dados obrigatórios
    if (!nome || !codigo || !preco) {
      return NextResponse.json(
        { message: "Nome, código e preço são obrigatórios", success: false },
        { status: 400 }
      );
    }

    // Verificar se código já existe
    const existingProduto = await prisma.produto.findUnique({
      where: { codigo },
    });

    if (existingProduto) {
      return NextResponse.json(
        { message: "Código já cadastrado", success: false },
        { status: 400 }
      );
    }

    const produto = await prisma.produto.create({
      data: {
        nome,
        descricao,
        codigo,
        preco,
        quantidade,
        quantidadeMinima,
        categoria,
        fornecedor,
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
    return NextResponse.json(
      { message: "Erro interno do servidor", success: false },
      { status: 500 }
    );
  }
}
