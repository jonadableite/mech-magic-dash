import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/providers/prisma";
import { z } from "zod";

// Schema de validação (Single Responsibility Principle)
const updateProfileSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  telefone: z
    .string()
    .min(10, "Telefone deve ter pelo menos 10 caracteres")
    .optional(),
});

// Função para obter ID do usuário da sessão (Single Responsibility Principle)
async function getUserIdFromSession(request: NextRequest): Promise<string> {
  const sessionToken = request.cookies.get("session-token")?.value;

  if (!sessionToken) {
    throw new Error("Token de sessão não encontrado");
  }

  const session = await prisma.sessao.findUnique({
    where: { token: sessionToken },
    include: { usuario: true },
  });

  if (!session || !session.usuario) {
    throw new Error("Sessão inválida");
  }

  return session.usuario.id;
}

// GET - Buscar perfil do usuário
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession(request);

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        avatar: true,
        role: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error) || "Erro desconhecido";
    console.error("Erro ao buscar perfil:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// PUT - Atualizar perfil do usuário
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession(request);
    const body = await request.json();

    // Validar dados de entrada
    const validatedData = updateProfileSchema.parse(body);

    // Atualizar usuário
    const updatedUser = await prisma.usuario.update({
      where: { id: userId },
      data: validatedData,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        avatar: true,
        role: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error) || "Erro desconhecido";
    console.error("Erro ao atualizar perfil:", errorMessage);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
