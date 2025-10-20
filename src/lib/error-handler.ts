// Sistema de tratamento de erros centralizado (Single Responsibility Principle)

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class AppError extends Error {
  public status: number;
  public code?: string;
  public details?: any;

  constructor(
    message: string,
    status: number = 500,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Classe para tratamento de erros da API
export class ApiErrorHandler {
  static handle(error: any): ApiError {
    // Erro de rede
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return {
        message: "Erro de conexão. Verifique sua internet e tente novamente.",
        status: 0,
        code: "NETWORK_ERROR",
      };
    }

    // Erro de validação Zod
    if (error.name === "ZodError") {
      return {
        message: "Dados inválidos fornecidos",
        status: 400,
        code: "VALIDATION_ERROR",
        details: error.issues,
      };
    }

    // Erro do Prisma
    if (error.code) {
      switch (error.code) {
        case "P2002":
          return {
            message: "Dados duplicados. Este registro já existe.",
            status: 409,
            code: "DUPLICATE_ERROR",
          };
        case "P2025":
          return {
            message: "Registro não encontrado.",
            status: 404,
            code: "NOT_FOUND",
          };
        case "P2003":
          return {
            message: "Erro de referência. Verifique os dados relacionados.",
            status: 400,
            code: "FOREIGN_KEY_ERROR",
          };
        default:
          return {
            message: "Erro no banco de dados.",
            status: 500,
            code: "DATABASE_ERROR",
          };
      }
    }

    // Erro HTTP da API
    if (error.status || error.response?.status) {
      const status = error.status || error.response?.status;
      const message =
        error.message || error.response?.data?.message || "Erro na requisição";

      return {
        message,
        status,
        code: `HTTP_${status}`,
      };
    }

    // Erro genérico
    return {
      message: error.message || "Erro interno do servidor",
      status: 500,
      code: "INTERNAL_ERROR",
    };
  }

  static isRetryable(error: ApiError): boolean {
    const retryableStatuses = [0, 408, 429, 500, 502, 503, 504];
    const retryableCodes = ["NETWORK_ERROR", "TIMEOUT_ERROR"];

    return (
      retryableStatuses.includes(error.status || 0) ||
      retryableCodes.includes(error.code || "")
    );
  }

  static getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return Math.min(1000 * Math.pow(2, attempt), 16000);
  }
}

// Função para logging de erros
export function logError(error: any, context?: string) {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    message: error.message,
    stack: error.stack,
    ...(error.status && { status: error.status }),
    ...(error.code && { code: error.code }),
  };

  console.error("Error logged:", errorInfo);

  // Aqui você pode enviar para um serviço de monitoramento como Sentry
  // Sentry.captureException(error, { extra: errorInfo });
}

// Hook para tratamento de erros em componentes React
export function useErrorHandler() {
  const handleError = (error: any, context?: string) => {
    const apiError = ApiErrorHandler.handle(error);
    logError(apiError, context);
    return apiError;
  };

  const handleAsyncError = async (
    asyncFn: () => Promise<any>,
    context?: string
  ) => {
    try {
      return await asyncFn();
    } catch (error) {
      throw handleError(error, context);
    }
  };

  return { handleError, handleAsyncError };
}

// Utility para criar erros customizados
export function createError(
  message: string,
  status: number = 500,
  code?: string
): AppError {
  return new AppError(message, status, code);
}

// Utility para verificar se é um erro esperado
export function isExpectedError(error: any): boolean {
  return (
    error instanceof AppError ||
    error.name === "ZodError" ||
    error.code?.startsWith("P2")
  ); // Prisma errors
}
