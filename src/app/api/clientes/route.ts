import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClienteSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { nome: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { telefone: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.cliente.count({ where }),
    ]);

    return NextResponse.json({
      data: clientes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true,
    });
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
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
    const validatedData = createClienteSchema.parse(body);

    // Verificar se email já existe
    const existingCliente = await prisma.cliente.findUnique({
      where: { email: validatedData.email },
    });

    if (existingCliente) {
      return NextResponse.json(
        { message: "Email já cadastrado", success: false },
        { status: 400 }
      );
    }

    const cliente = await prisma.cliente.create({
      data: validatedData,
    });

    return NextResponse.json(
      {
        data: cliente,
        message: "Cliente criado com sucesso",
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar cliente:", error);

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
