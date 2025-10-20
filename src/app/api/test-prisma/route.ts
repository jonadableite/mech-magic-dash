import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Teste simples para verificar se o Prisma está funcionando
    const count = await prisma.cliente.count();
    
    return NextResponse.json({
      success: true,
      message: "Prisma está funcionando",
      clienteCount: count,
    });
  } catch (error) {
    console.error("Erro no teste do Prisma:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Erro no Prisma",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    );
  }
}
