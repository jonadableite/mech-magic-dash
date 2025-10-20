// Tipos compartilhados entre features (Shared Domain Types)

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

// Enums compartilhados
export enum StatusOrdem {
  ABERTA = "ABERTA",
  EM_ANDAMENTO = "EM_ANDAMENTO",
  AGUARDANDO_PECAS = "AGUARDANDO_PECAS",
  FINALIZADA = "FINALIZADA",
  CANCELADA = "CANCELADA",
}

export enum Prioridade {
  BAIXA = "BAIXA",
  MEDIA = "MEDIA",
  ALTA = "ALTA",
  URGENTE = "URGENTE",
}

// Tipos de contexto
export interface DatabaseContext {
  cliente: any;
  veiculo: any;
  ordemServico: any;
  produto: any;
  itemOrdemServico: any;
}

export interface AppContext {
  db: DatabaseContext;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}
