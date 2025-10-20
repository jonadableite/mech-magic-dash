import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/providers/prisma";
import {
  verifyUserAccess,
  getUserFilter,
  createWithUser,
} from "@/lib/auth-middleware";

// Helper para obter userId da sessão
async function getUserIdFromSession(
  request: NextRequest
): Promise<string | null> {
  const sessionToken = request.cookies.get("session-token")?.value;

  if (!sessionToken) return null;

  try {
    // Buscar sessão no banco de dados
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

// GET /api/clientes - Listar clientes do usuário
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession(request);

    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 401 }
      );
    }

    const clientes = await prisma.cliente.findMany({
      where: getUserFilter(userId, user.role),
      include: {
        veiculos: true,
        _count: {
          select: {
            ordens: true,
            agendamentos: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: clientes });
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST /api/clientes - Criar cliente
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession(request);

    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { nome, email, telefone, endereco } = body;

    if (!nome || !email || !telefone) {
      return NextResponse.json(
        { error: "Nome, email e telefone são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se já existe cliente com mesmo email para este usuário
    const existingCliente = await prisma.cliente.findFirst({
      where: {
        email,
        usuarioId: userId,
      },
    });

    if (existingCliente) {
      return NextResponse.json(
        { error: "Já existe um cliente com este email" },
        { status: 400 }
      );
    }

    const cliente = await prisma.cliente.create({
      data: createWithUser(
        {
          nome,
          email,
          telefone,
          endereco,
        },
        userId
      ),
    });

    return NextResponse.json({ data: cliente }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/clientes/[id] - Atualizar cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserIdFromSession(request);

    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar acesso ao recurso
    const accessCheck = await verifyUserAccess(request, userId, id, "cliente");
    if (accessCheck) return accessCheck;

    const body = await request.json();
    const { nome, email, telefone, endereco } = body;

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nome,
        email,
        telefone,
        endereco,
      },
    });

    return NextResponse.json({ data: cliente });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/clientes/[id] - Deletar cliente
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserIdFromSession(request);

    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar acesso ao recurso
    const accessCheck = await verifyUserAccess(request, userId, id, "cliente");
    if (accessCheck) return accessCheck;

    await prisma.cliente.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Cliente deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
