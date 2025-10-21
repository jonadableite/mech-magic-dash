import { NextResponse } from "next/server";
import { prisma } from "@/providers/prisma";
import { z } from "zod";

const createMovimentacaoSchema = z.object({
  tipo: z.enum(["ENTRADA", "SAIDA"]),
  valor: z.number().min(0.01, "Valor deve ser maior que zero"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  categoria: z
    .enum([
      "VENDAS",
      "SERVICOS",
      "PAGAMENTOS",
      "RECEBIMENTOS",
      "DESPESAS",
      "INVESTIMENTOS",
      "OUTROS",
    ])
    .optional(),
  observacoes: z.string().optional(),
  ordemId: z.string().optional(),
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
    const { id: caixaId } = await params;
    const body = await request.json();
    const validatedData = createMovimentacaoSchema.parse(body);

    // Verificar se o caixa existe e está aberto
    const caixa = await prisma.caixa.findUnique({
      where: { id: caixaId },
    });

    if (!caixa) {
      return NextResponse.json(
        { message: "Caixa não encontrado." },
        { status: 404 }
      );
    }

    if (caixa.status === "FECHADO") {
      return NextResponse.json(
        {
          message:
            "Não é possível adicionar movimentações em um caixa fechado.",
        },
        { status: 400 }
      );
    }

    // Criar a movimentação
    const movimentacao = await prisma.movimentacaoCaixa.create({
      data: {
        tipo: validatedData.tipo,
        valor: validatedData.valor,
        descricao: validatedData.descricao,
        categoria: validatedData.categoria || "OUTROS",
        observacoes: validatedData.observacoes,
        caixaId: caixaId,
        ordemId: validatedData.ordemId,
      },
    });

    return NextResponse.json(movimentacao, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error) || "Erro desconhecido";
    console.error("Erro ao criar movimentação:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
