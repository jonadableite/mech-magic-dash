import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  Cliente,
  CreateClienteData,
  UpdateClienteData,
} from "../clientes.interfaces";

// Procedure para verificar se email já existe
export function createEmailCheckProcedure() {
  return async (email: string, excludeId?: string): Promise<boolean> => {
    const existingCliente = await prisma.cliente.findFirst({
      where: {
        email,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return !!existingCliente;
  };
}

// Procedure para verificar se cliente pode ser excluído
export function createClienteDeletionCheckProcedure() {
  return async (
    clienteId: string
  ): Promise<{ canDelete: boolean; reason?: string }> => {
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        ordens: {
          where: {
            status: {
              in: ["ABERTA", "EM_ANDAMENTO", "AGUARDANDO_PECAS"],
            },
          },
        },
      },
    });

    if (!cliente) {
      return { canDelete: false, reason: "Cliente não encontrado" };
    }

    if (cliente.ordens.length > 0) {
      return {
        canDelete: false,
        reason: "Cliente possui ordens de serviço em andamento",
      };
    }

    return { canDelete: true };
  };
}

// Procedure para buscar estatísticas do cliente
export function createClienteStatsProcedure() {
  return async (clienteId: string) => {
    const [cliente, ordens, receitaTotal] = await Promise.all([
      prisma.cliente.findUnique({
        where: { id: clienteId },
        include: {
          veiculos: true,
          ordens: {
            orderBy: { dataAbertura: "desc" },
            take: 5,
          },
        },
      }),
      prisma.ordemServico.findMany({
        where: { clienteId },
        select: { status: true, valorTotal: true },
      }),
      prisma.ordemServico.aggregate({
        where: {
          clienteId,
          status: "FINALIZADA",
        },
        _sum: { valorTotal: true },
      }),
    ]);

    if (!cliente) {
      throw new Error("Cliente não encontrado");
    }

    return {
      cliente,
      totalOrdens: ordens.length,
      ordensEmAndamento: ordens.filter((o) =>
        ["ABERTA", "EM_ANDAMENTO", "AGUARDANDO_PECAS"].includes(o.status)
      ).length,
      receitaTotal: receitaTotal._sum.valorTotal || 0,
    };
  };
}

// Procedure para gerar iniciais do nome
export function createInitialsProcedure() {
  return (nome: string): string => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
}
