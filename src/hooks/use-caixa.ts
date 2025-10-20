import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import {
  CreateCaixaData,
  UpdateCaixaData,
  CreateMovimentacaoData,
  UpdateMovimentacaoData,
} from "@/lib/schemas";

// Interfaces
export interface Caixa {
  id: string;
  dataAbertura: string;
  dataFechamento?: string | null;
  valorInicial: number;
  valorFinal?: number | null;
  status: "ABERTO" | "FECHADO";
  observacoes?: string | null;
  createdAt: string;
  updatedAt: string;
  usuarioId: string;
  movimentacoes: MovimentacaoCaixa[];
}

export interface MovimentacaoCaixa {
  id: string;
  tipo: "ENTRADA" | "SAIDA";
  valor: number;
  descricao: string;
  categoria:
    | "VENDAS"
    | "SERVICOS"
    | "PAGAMENTOS"
    | "RECEBIMENTOS"
    | "DESPESAS"
    | "INVESTIMENTOS"
    | "OUTROS";
  dataHora: string;
  observacoes?: string | null;
  createdAt: string;
  updatedAt: string;
  caixaId: string;
  ordemId?: string | null;
}

export interface CaixaStats {
  totalEntradas: number;
  totalSaidas: number;
  saldoAtual: number;
  movimentacoesHoje: number;
  valorInicial: number;
}

// Service para operações de caixa
class CaixaService {
  private static baseUrl = "/api/caixa";

  static async fetchCaixas(params?: {
    page?: number;
    limit?: number;
    status?: string;
    dataInicio?: string;
    dataFim?: string;
  }): Promise<{
    data: Caixa[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.dataInicio) searchParams.set("dataInicio", params.dataInicio);
    if (params?.dataFim) searchParams.set("dataFim", params.dataFim);

    const response = await fetch(`${this.baseUrl}?${searchParams}`);
    if (!response.ok) {
      throw new Error("Erro ao buscar caixas");
    }
    return response.json();
  }

  static async fetchCaixa(id: string): Promise<Caixa> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error("Erro ao buscar caixa");
    }
    return response.json();
  }

  static async createCaixa(data: CreateCaixaData): Promise<Caixa> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao criar caixa");
    }

    return response.json();
  }

  static async updateCaixa(id: string, data: UpdateCaixaData): Promise<Caixa> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao atualizar caixa");
    }

    return response.json();
  }

  static async deleteCaixa(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao excluir caixa");
    }
  }

  static async fetchCaixaAtivo(): Promise<Caixa | null> {
    const response = await fetch(`${this.baseUrl}/ativo`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error("Erro ao buscar caixa ativo");
    }
    return response.json();
  }

  static async fetchCaixaStats(caixaId: string): Promise<CaixaStats> {
    const response = await fetch(`${this.baseUrl}/${caixaId}/stats`);
    if (!response.ok) {
      throw new Error("Erro ao buscar estatísticas do caixa");
    }
    return response.json();
  }

  // Movimentações
  static async createMovimentacao(
    caixaId: string,
    data: CreateMovimentacaoData
  ): Promise<MovimentacaoCaixa> {
    const response = await fetch(`${this.baseUrl}/${caixaId}/movimentacoes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao criar movimentação");
    }

    return response.json();
  }

  static async updateMovimentacao(
    caixaId: string,
    movimentacaoId: string,
    data: UpdateMovimentacaoData
  ): Promise<MovimentacaoCaixa> {
    const response = await fetch(
      `${this.baseUrl}/${caixaId}/movimentacoes/${movimentacaoId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao atualizar movimentação");
    }

    return response.json();
  }

  static async deleteMovimentacao(
    caixaId: string,
    movimentacaoId: string
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/${caixaId}/movimentacoes/${movimentacaoId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao excluir movimentação");
    }
  }
}

// Hooks SWR
export function useCaixas(params?: {
  page?: number;
  limit?: number;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
}) {
  const { data, error, isLoading, mutate } = useSWR(
    params ? ["/api/caixa", params] : "/api/caixa",
    () => CaixaService.fetchCaixas(params)
  );

  return {
    caixas: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}

export function useCaixa(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/caixa/${id}` : null,
    () => CaixaService.fetchCaixa(id)
  );

  return {
    caixa: data,
    isLoading,
    error,
    mutate,
  };
}

export function useCaixaAtivo() {
  const { data, error, isLoading, mutate } = useSWR("/api/caixa/ativo", () =>
    CaixaService.fetchCaixaAtivo()
  );

  return {
    caixaAtivo: data,
    isLoading,
    error,
    mutate,
  };
}

export function useCaixaStats(caixaId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    caixaId ? `/api/caixa/${caixaId}/stats` : null,
    () => CaixaService.fetchCaixaStats(caixaId)
  );

  return {
    stats: data,
    isLoading,
    error,
    mutate,
  };
}

// Mutations
export function useCreateCaixa() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/api/caixa",
    (url, { arg }: { arg: CreateCaixaData }) => CaixaService.createCaixa(arg)
  );

  return {
    createCaixa: trigger,
    isCreating: isMutating,
    error,
  };
}

export function useUpdateCaixa() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/api/caixa",
    (url, { arg }: { arg: { id: string; data: UpdateCaixaData } }) =>
      CaixaService.updateCaixa(arg.id, arg.data)
  );

  return {
    updateCaixa: trigger,
    isUpdating: isMutating,
    error,
  };
}

export function useDeleteCaixa() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/api/caixa",
    (url, { arg }: { arg: string }) => CaixaService.deleteCaixa(arg)
  );

  return {
    deleteCaixa: trigger,
    isDeleting: isMutating,
    error,
  };
}

export function useCreateMovimentacao() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/api/caixa",
    (
      url,
      { arg }: { arg: { caixaId: string; data: CreateMovimentacaoData } }
    ) => CaixaService.createMovimentacao(arg.caixaId, arg.data)
  );

  return {
    createMovimentacao: trigger,
    isCreating: isMutating,
    error,
  };
}

export function useUpdateMovimentacao() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/api/caixa",
    (
      url,
      {
        arg,
      }: {
        arg: {
          caixaId: string;
          movimentacaoId: string;
          data: UpdateMovimentacaoData;
        };
      }
    ) =>
      CaixaService.updateMovimentacao(arg.caixaId, arg.movimentacaoId, arg.data)
  );

  return {
    updateMovimentacao: trigger,
    isUpdating: isMutating,
    error,
  };
}

export function useDeleteMovimentacao() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/api/caixa",
    (url, { arg }: { arg: { caixaId: string; movimentacaoId: string } }) =>
      CaixaService.deleteMovimentacao(arg.caixaId, arg.movimentacaoId)
  );

  return {
    deleteMovimentacao: trigger,
    isDeleting: isMutating,
    error,
  };
}
