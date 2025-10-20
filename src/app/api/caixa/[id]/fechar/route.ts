import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiErrorHandler } from "@/lib/error-handler";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const fecharCaixaSchema = z.object({
  valorFinal: z.number().min(0, "Valor final deve ser positivo"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

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

    if (caixa.usuarioId !== session.user.id) {
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
    return ApiErrorHandler.handle(error);
  }
}
