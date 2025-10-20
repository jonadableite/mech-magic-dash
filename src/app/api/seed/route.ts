import { NextResponse } from "next/server";
import { seedAllData } from "@/lib/seed-data";
import type { ApiResponse } from "@/lib/types/common";

export async function POST(): Promise<NextResponse<ApiResponse>> {
  try {
    const result = await seedAllData();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao criar dados de teste",
          error: result.error?.message || "Unknown error",
        },
        { status: result.error?.statusCode || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Dados de teste criados com sucesso!",
      data: result.data,
    });
  } catch (error) {
    console.error("Erro ao criar dados de teste:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
