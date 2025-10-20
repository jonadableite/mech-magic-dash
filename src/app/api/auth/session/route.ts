import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/providers/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("session-token")?.value;

  console.log("GET /api/auth/session - sessionToken:", sessionToken);

  if (!sessionToken) {
    console.log("GET /api/auth/session - No session token found");
    return NextResponse.json({
      user: null,
      message: "No session found",
    });
  }

  try {
    // Buscar sessão no banco de dados
    const session = await prisma.sessao.findUnique({
      where: { token: sessionToken },
      include: { usuario: true },
    });

    console.log("GET /api/auth/session - session found:", session);

    if (!session || session.expiresAt < new Date()) {
      console.log("GET /api/auth/session - Session expired or not found");

      // Limpar sessão expirada se existir
      if (session) {
        await prisma.sessao.delete({ where: { id: session.id } });
      }

      return NextResponse.json({
        user: null,
        message: "Session expired",
      });
    }

    return NextResponse.json({
      user: {
        id: session.usuario.id,
        email: session.usuario.email,
        name: session.usuario.nome,
        role: session.usuario.role,
      },
    });
  } catch (error) {
    console.error("GET /api/auth/session - Error:", error);
    return NextResponse.json({
      user: null,
      message: "Database error",
    });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, action } = body as {
    email?: string;
    password?: string;
    action: "signin" | "signup" | "signout";
  };

  if (action === "signin") {
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar usuário por email
    const user = await prisma.usuario.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    // Comparar senha
    let isValid = await bcrypt.compare(password, user.senha);
    // Migração transparente: se senha estiver em texto puro e bater, re-hash e atualiza
    if (!isValid && user.senha === password) {
      const newHash = await bcrypt.hash(password, 12);
      await prisma.usuario.update({
        where: { id: user.id },
        data: { senha: newHash },
      });
      isValid = true;
    }
    if (!isValid)
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );

    // Criar sessão
    const sessionToken =
      Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    console.log("POST /api/auth/session - Creating session for user:", user.id);
    console.log("POST /api/auth/session - sessionToken:", sessionToken);

    // Salvar sessão no banco de dados
    await prisma.sessao.create({
      data: {
        token: sessionToken,
        userId: user.id,
        expiresAt,
      },
    });

    console.log("POST /api/auth/session - Session saved to database");

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.nome,
        role: user.role,
      },
    });

    response.cookies.set("session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 dias
    });

    console.log("POST /api/auth/session - Cookie set, returning response");
    return response;
  }

  if (action === "signup") {
    const { name } = body as { name?: string };

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o usuário já existe
    const existing = await prisma.usuario.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Usuário já existe" }, { status: 400 });
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 12);

    // Criar novo usuário
    const created = await prisma.usuario.create({
      data: {
        nome: name,
        email,
        senha: passwordHash,
      },
      select: { id: true, email: true, nome: true },
    });

    // Criar sessão
    const sessionToken =
      Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    // Salvar sessão no banco de dados
    await prisma.sessao.create({
      data: {
        token: sessionToken,
        userId: created.id,
        expiresAt,
      },
    });

    const response = NextResponse.json({
      user: {
        id: created.id,
        email: created.email,
        name: created.nome,
      },
    });

    response.cookies.set("session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 dias
    });

    return response;
  }

  if (action === "signout") {
    const sessionToken = request.cookies.get("session-token")?.value;

    if (sessionToken) {
      // Remover sessão do banco de dados
      await prisma.sessao.deleteMany({
        where: { token: sessionToken },
      });
    }

    const response = NextResponse.json({
      message: "Signed out successfully",
    });

    response.cookies.delete("session-token");

    return response;
  }

  return NextResponse.json(
    {
      error: "Invalid action",
    },
    { status: 400 }
  );
}
