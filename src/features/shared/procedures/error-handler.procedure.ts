import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// Procedure para tratamento centralizado de erros
export function createErrorHandlerProcedure() {
  return (handler: (request: NextRequest) => Promise<NextResponse>) => {
    return async (request: NextRequest) => {
      try {
        return await handler(request);
      } catch (error) {
        console.error("API Error:", error);

        // Erro do Prisma
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          switch (error.code) {
            case "P2002":
              return NextResponse.json(
                {
                  message: "Dados duplicados. Este registro já existe.",
                  success: false,
                  code: "DUPLICATE_ERROR",
                },
                { status: 409 }
              );
            case "P2025":
              return NextResponse.json(
                {
                  message: "Registro não encontrado.",
                  success: false,
                  code: "NOT_FOUND",
                },
                { status: 404 }
              );
            case "P2003":
              return NextResponse.json(
                {
                  message:
                    "Erro de referência. Verifique os dados relacionados.",
                  success: false,
                  code: "FOREIGN_KEY_ERROR",
                },
                { status: 400 }
              );
            default:
              return NextResponse.json(
                {
                  message: "Erro no banco de dados.",
                  success: false,
                  code: "DATABASE_ERROR",
                },
                { status: 500 }
              );
          }
        }

        // Erro de validação Zod
        if (error instanceof Error && error.name === "ZodError") {
          return NextResponse.json(
            {
              message: "Dados inválidos fornecidos",
              success: false,
              code: "VALIDATION_ERROR",
            },
            { status: 400 }
          );
        }

        // Erro genérico
        return NextResponse.json(
          {
            message:
              error instanceof Error
                ? error.message
                : "Erro interno do servidor",
            success: false,
            code: "INTERNAL_ERROR",
          },
          { status: 500 }
        );
      }
    };
  };
}

// Procedure para logging de requisições
export function createLoggingProcedure() {
  return (handler: (request: NextRequest) => Promise<NextResponse>) => {
    return async (request: NextRequest) => {
      const start = Date.now();
      const method = request.method;
      const url = request.url;

      console.log(`[${method}] ${url} - Iniciando`);

      try {
        const response = await handler(request);
        const duration = Date.now() - start;
        console.log(`[${method}] ${url} - ${response.status} - ${duration}ms`);
        return response;
      } catch (error) {
        const duration = Date.now() - start;
        console.error(`[${method}] ${url} - ERROR - ${duration}ms`, error);
        throw error;
      }
    };
  };
}
