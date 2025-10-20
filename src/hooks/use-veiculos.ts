import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api";
import { CreateVeiculoData, UpdateVeiculoData } from "@/lib/schemas";

// Interfaces para tipagem (Interface Segregation Principle)
export interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  cor?: string;
  observacoes?: string;
  clienteId: string;
  cliente: {
    id: string;
    nome: string;
    email: string;
    telefone: string;
  };
  createdAt: string;
  updatedAt: string;
  ordens?: OrdemServico[];
}

export interface OrdemServico {
  id: string;
  numero: string;
  descricao: string;
  status:
    | "ABERTA"
    | "EM_ANDAMENTO"
    | "AGUARDANDO_PECAS"
    | "FINALIZADA"
    | "CANCELADA";
  prioridade: "BAIXA" | "MEDIA" | "ALTA" | "URGENTE";
  valorTotal: number;
  dataAbertura: string;
  dataFechamento?: string;
  observacoes?: string;
  clienteId: string;
  veiculoId: string;
  createdAt: string;
  updatedAt: string;
}

// Classe para gerenciar operações de veículos (Single Responsibility Principle)
class VeiculoService {
  private client = apiClient;

  async getVeiculos(params?: {
    page?: number;
    limit?: number;
    search?: string;
    clienteId?: string;
  }): Promise<PaginatedResponse<Veiculo>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.clienteId) searchParams.set("clienteId", params.clienteId);

    const query = searchParams.toString();
    return this.client.get<Veiculo[]>(`/veiculos${query ? `?${query}` : ""}`);
  }

  async getVeiculo(id: string): Promise<ApiResponse<Veiculo>> {
    return this.client.get<Veiculo>(`/veiculos/${id}`);
  }

  async createVeiculo(data: CreateVeiculoData): Promise<ApiResponse<Veiculo>> {
    return this.client.post<Veiculo>("/veiculos", data);
  }

  async updateVeiculo(data: UpdateVeiculoData): Promise<ApiResponse<Veiculo>> {
    const { id, ...updateData } = data;
    return this.client.put<Veiculo>(`/veiculos/${id}`, updateData);
  }

  async deleteVeiculo(id: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/veiculos/${id}`);
  }

  async getVeiculosByCliente(
    clienteId: string
  ): Promise<ApiResponse<Veiculo[]>> {
    return this.client.get<Veiculo[]>(`/veiculos/cliente/${clienteId}`);
  }
}

// Instância singleton do serviço
const veiculoService = new VeiculoService();

// Hooks SWR para veículos
export function useVeiculos(params?: {
  page?: number;
  limit?: number;
  search?: string;
  clienteId?: string;
}) {
  const { data, error, isLoading, mutate } = useSWR(
    ["/veiculos", params],
    () => veiculoService.getVeiculos(params),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    veiculos: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}

export function useVeiculo(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/veiculos/${id}` : null,
    () => veiculoService.getVeiculo(id),
    {
      revalidateOnFocus: true,
    }
  );

  return {
    veiculo: data?.data,
    isLoading,
    error,
    mutate,
  };
}

export function useCreateVeiculo() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/veiculos",
    async (url, { arg }: { arg: CreateVeiculoData }) => {
      return veiculoService.createVeiculo(arg);
    }
  );

  return {
    createVeiculo: trigger,
    isCreating: isMutating,
    error,
  };
}

export function useUpdateVeiculo() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/veiculos",
    async (url, { arg }: { arg: UpdateVeiculoData }) => {
      return veiculoService.updateVeiculo(arg);
    }
  );

  return {
    updateVeiculo: trigger,
    isUpdating: isMutating,
    error,
  };
}

export function useDeleteVeiculo() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/veiculos",
    async (url, { arg }: { arg: string }) => {
      return veiculoService.deleteVeiculo(arg);
    }
  );

  return {
    deleteVeiculo: trigger,
    isDeleting: isMutating,
    error,
  };
}

export function useVeiculosByCliente(clienteId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    clienteId ? `/veiculos/cliente/${clienteId}` : null,
    () => veiculoService.getVeiculosByCliente(clienteId),
    {
      revalidateOnFocus: true,
    }
  );

  return {
    veiculos: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}
