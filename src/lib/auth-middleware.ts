import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/providers/prisma";

// Middleware para verificar se o usuário tem acesso aos dados
export async function verifyUserAccess(
  request: NextRequest,
  userId: string,
  resourceId?: string,
  resourceType?: string
) {
  // Se não há userId, não pode acessar
  if (!userId) {
    return NextResponse.json(
      { error: "Usuário não autenticado" },
      { status: 401 }
    );
  }

  // Verificar se o usuário existe e está ativo
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { id: true, ativo: true, role: true },
  });

  if (!user || !user.ativo) {
    return NextResponse.json(
      { error: "Usuário não encontrado ou inativo" },
      { status: 401 }
    );
  }

  // Se é admin, pode acessar qualquer recurso
  if (user.role === "ADMIN") {
    return null; // null significa que pode prosseguir
  }

  // Para outros usuários, verificar se o recurso pertence a eles
  if (resourceId && resourceType) {
    // Prisma Client delegate methods (e.g. findUnique) are not available on types or root namespaces.
    // Instead, use a switch/case or a mapping to access the correct delegate. Handle only allowed types.
    let resource: { usuarioId: string } | null = null;

    switch (resourceType) {
      case "comissao":
        resource = await prisma.comissao.findUnique({
          where: { id: resourceId },
          select: { usuarioId: true },
        });
        break;
      case "outroRecurso":
        // Substitua por outros recursos válidos, conforme necessidade
        // resource = await prisma.outroRecurso.findUnique({ ... })
        break;
      default:
        return NextResponse.json(
          { error: "Tipo de recurso inválido ou não suportado" },
          { status: 400 }
        );
    }

    if (!resource || resource.usuarioId !== userId) {
      return NextResponse.json(
        { error: "Acesso negado: recurso não pertence ao usuário" },
        { status: 403 }
      );
    }
  }

  return null; // Pode prosseguir
}

// Helper para filtrar queries por usuário
export function getUserFilter(userId: string, userRole: string) {
  if (userRole === "ADMIN") {
    return {}; // Admin pode ver tudo
  }
  return { usuarioId: userId };
}

// Helper para criar recursos com userId
export function createWithUser<T>(data: T, userId: string) {
  return {
    ...data,
    usuarioId: userId,
  };
}
