import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Procedure para validação de dados com Zod
export function createValidationProcedure<T>(schema: z.ZodSchema<T>) {
  return (
    handler: (data: T, request: NextRequest) => Promise<NextResponse>
  ) => {
    return async (request: NextRequest) => {
      try {
        const body = await request.json();
        const validatedData = schema.parse(body);
        return await handler(validatedData, request);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            {
              message: "Dados inválidos",
              errors: error.errors,
              success: false,
            },
            { status: 400 }
          );
        }
        throw error;
      }
    };
  };
}

// Procedure para validação de query parameters
export function createQueryValidationProcedure<T>(schema: z.ZodSchema<T>) {
  return (
    handler: (data: T, request: NextRequest) => Promise<NextResponse>
  ) => {
    return async (request: NextRequest) => {
      try {
        const { searchParams } = new URL(request.url);
        const queryData = Object.fromEntries(searchParams.entries());
        const validatedData = schema.parse(queryData);
        return await handler(validatedData, request);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            {
              message: "Parâmetros de consulta inválidos",
              errors: error.errors,
              success: false,
            },
            { status: 400 }
          );
        }
        throw error;
      }
    };
  };
}

// Procedure para validação de parâmetros de rota
export function createParamsValidationProcedure<T>(schema: z.ZodSchema<T>) {
  return (
    handler: (
      data: T,
      request: NextRequest,
      params: any
    ) => Promise<NextResponse>
  ) => {
    return async (request: NextRequest, { params }: { params: any }) => {
      try {
        const validatedParams = schema.parse(params);
        return await handler(validatedParams, request, params);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            {
              message: "Parâmetros de rota inválidos",
              errors: error.errors,
              success: false,
            },
            { status: 400 }
          );
        }
        throw error;
      }
    };
  };
}
