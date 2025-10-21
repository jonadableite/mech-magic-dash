import { NextResponse } from "next/server";
import { prisma } from "@/providers/prisma";
import { z } from "zod";

const fecharCaixaSchema = z.object({
  valorFinal: z.number().min(0, "Valor final deve ser positivo"),
});

async function getUserIdFromSession(request: Request): Promise<string> {
  const sessionToken = request.headers
    .get("cookie")
    ?.match(/session-token=([^;]+)/)?.[1];

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromSession(request);
    const { id } = await params;
    const body = await request.json();
    const validatedData = fecharCaixaSchema.parse(body);

    // Verificar se o caixa existe e está aberto
    const caixa = await prisma.caixa.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    if (!caixa) {
      return NextResponse.json(
        { message: "Caixa não encontrado." },
        { status: 404 }
      );
    }

    if (caixa.status === "FECHADO") {
      return NextResponse.json(
        { message: "Este caixa já está fechado." },
        { status: 400 }
      );
    }

    if (caixa.usuarioId !== userId) {
      return NextResponse.json(
        { message: "Você não tem permissão para fechar este caixa." },
        { status: 403 }
      );
    }

    // Fechar o caixa
    const caixaFechado = await prisma.caixa.update({
      where: { id },
      data: {
        status: "FECHADO",
        valorFinal: validatedData.valorFinal,
        dataFechamento: new Date(),
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
          },
        },
        movimentacoes: {
          orderBy: {
            dataHora: "desc",
          },
          take: 10,
        },
      },
    });

    return NextResponse.json(caixaFechado);
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error) || "Erro desconhecido";
    console.error("Erro ao fechar caixa:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
