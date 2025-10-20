import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import {
  Agendamento,
  CreateAgendamentoData,
  UpdateAgendamentoData,
} from "@/lib/schemas";

// Interface para Agendamento completo com relacionamentos
export interface AgendamentoCompleto {
  id: string;
  dataHora: string;
  descricao: string;
  status:
    | "AGENDADO"
    | "CONFIRMADO"
    | "EM_ANDAMENTO"
    | "FINALIZADO"
    | "CANCELADO"
    | "FALTOU";
  observacoes?: string | null;
  createdAt: string;
  updatedAt: string;
  clienteId: string;
  veiculoId: string;
  cliente: {
    id: string;
    nome: string;
    email: string;
    telefone: string;
  };
  veiculo: {
    id: string;
    marca: string;
    modelo: string;
    ano: number;
    placa: string;
  };
}

// Service para operações de agendamentos
class AgendamentoService {
  private static baseUrl = "/api/agendamentos";

  static async fetchAgendamentos(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    dataInicio?: string;
    dataFim?: string;
  }): Promise<{
    data: AgendamentoCompleto[];
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
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.dataInicio) searchParams.set("dataInicio", params.dataInicio);
    if (params?.dataFim) searchParams.set("dataFim", params.dataFim);

    const url = `${this.baseUrl}?${searchParams.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Erro ao buscar agendamentos");
    }

    return response.json();
  }

  static async fetchAgendamento(id: string): Promise<AgendamentoCompleto> {
    const response = await fetch(`${this.baseUrl}/${id}`);

    if (!response.ok) {
      throw new Error("Erro ao buscar agendamento");
    }

    const result = await response.json();
    return result.data;
  }

  static async createAgendamento(
    data: CreateAgendamentoData
  ): Promise<AgendamentoCompleto> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao criar agendamento");
    }

    const result = await response.json();
    return result.data;
  }

  static async updateAgendamento(
    id: string,
    data: UpdateAgendamentoData
  ): Promise<AgendamentoCompleto> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao atualizar agendamento");
    }

    const result = await response.json();
    return result.data;
  }

  static async deleteAgendamento(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao excluir agendamento");
    }
  }

  static async updateStatus(
    id: string,
    status: string
  ): Promise<AgendamentoCompleto> {
    const response = await fetch(`${this.baseUrl}/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao atualizar status");
    }

    const result = await response.json();
    return result.data;
  }
}

// Hook para buscar agendamentos
export function useAgendamentos(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
}) {
  const key = params ? ["/agendamentos", params] : "/agendamentos";

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => AgendamentoService.fetchAgendamentos(params),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    agendamentos: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}

// Hook para buscar um agendamento específico
export function useAgendamento(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/agendamentos/${id}` : null,
    () => AgendamentoService.fetchAgendamento(id),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    agendamento: data,
    isLoading,
    error,
    mutate,
  };
}

// Hook para criar agendamento
export function useCreateAgendamento() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/agendamentos",
    (url, { arg }: { arg: CreateAgendamentoData }) =>
      AgendamentoService.createAgendamento(arg)
  );

  return {
    createAgendamento: trigger,
    isCreating: isMutating,
    error,
  };
}

// Hook para atualizar agendamento
export function useUpdateAgendamento() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/agendamentos",
    (url, { arg }: { arg: { id: string; data: UpdateAgendamentoData } }) =>
      AgendamentoService.updateAgendamento(arg.id, arg.data)
  );

  return {
    updateAgendamento: trigger,
    isUpdating: isMutating,
    error,
  };
}

// Hook para excluir agendamento
export function useDeleteAgendamento() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/agendamentos",
    (url, { arg }: { arg: string }) => AgendamentoService.deleteAgendamento(arg)
  );

  return {
    deleteAgendamento: trigger,
    isDeleting: isMutating,
    error,
  };
}

// Hook para atualizar status
export function useUpdateStatusAgendamento() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/agendamentos",
    (url, { arg }: { arg: { id: string; status: string } }) =>
      AgendamentoService.updateStatus(arg.id, arg.status)
  );

  return {
    updateStatus: trigger,
    isUpdating: isMutating,
    error,
  };
}
