import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/providers/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Schema de validação (Single Responsibility Principle)
const changePasswordSchema = z
  .object({
    senhaAtual: z
      .string()
      .min(6, "Senha atual deve ter pelo menos 6 caracteres"),
    novaSenha: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
    confirmarSenha: z
      .string()
      .min(6, "Confirmação deve ter pelo menos 6 caracteres"),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: "Nova senha e confirmação não coincidem",
    path: ["confirmarSenha"],
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

// PUT - Alterar senha do usuário
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession(request);
    const body = await request.json();

    // Validar dados de entrada
    const validatedData = changePasswordSchema.parse(body);

    // Buscar usuário atual
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { senha: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(
      validatedData.senhaAtual,
      user.senha
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Senha atual incorreta" },
        { status: 400 }
      );
    }

    // Criptografar nova senha
    const hashedNewPassword = await bcrypt.hash(validatedData.novaSenha, 12);

    // Atualizar senha
    await prisma.usuario.update({
      where: { id: userId },
      data: { senha: hashedNewPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Senha alterada com sucesso",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error) || "Erro desconhecido";
    console.error("Erro ao alterar senha:", errorMessage);

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
