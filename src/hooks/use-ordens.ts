import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api";

// Interfaces para tipagem (Interface Segregation Principle)
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
  createdAt: string;
  updatedAt: string;
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
  itens: ItemOrdemServico[];
}

export interface ItemOrdemServico {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  observacoes?: string;
}

export interface CreateOrdemData {
  descricao: string;
  status?: OrdemServico["status"];
  prioridade?: OrdemServico["prioridade"];
  observacoes?: string;
  clienteId: string;
  veiculoId: string;
  itens?: Omit<ItemOrdemServico, "id">[];
}

export interface UpdateOrdemData extends Partial<CreateOrdemData> {
  id: string;
}

// Classe para gerenciar operações de ordens (Single Responsibility Principle)
class OrdemService {
  private client = apiClient;

  async getOrdens(): Promise<PaginatedResponse<OrdemServico>> {
    return this.client.get<OrdemServico[]>("/ordens");
  }

  async getOrdem(id: string): Promise<ApiResponse<OrdemServico>> {
    return this.client.get<OrdemServico>(`/ordens/${id}`);
  }

  async createOrdem(data: CreateOrdemData): Promise<ApiResponse<OrdemServico>> {
    return this.client.post<OrdemServico>("/ordens", data);
  }

  async updateOrdem(data: UpdateOrdemData): Promise<ApiResponse<OrdemServico>> {
    const { id, ...updateData } = data;
    return this.client.put<OrdemServico>(`/ordens/${id}`, updateData);
  }

  async deleteOrdem(id: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/ordens/${id}`);
  }

  async finalizarOrdem(id: string): Promise<ApiResponse<OrdemServico>> {
    return this.client.put<OrdemServico>(`/ordens/${id}/finalizar`, {});
  }
}

// Instância singleton do serviço
const ordemService = new OrdemService();

// Hooks SWR para ordens
export function useOrdens() {
  const { data, error, isLoading, mutate } = useSWR(
    "/ordens",
    () => ordemService.getOrdens(),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    ordens: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}

export function useOrdem(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/ordens/${id}` : null,
    () => ordemService.getOrdem(id),
    {
      revalidateOnFocus: true,
    }
  );

  return {
    ordem: data?.data,
    isLoading,
    error,
    mutate,
  };
}

export function useCreateOrdem() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/ordens",
    async (url, { arg }: { arg: CreateOrdemData }) => {
      return ordemService.createOrdem(arg);
    }
  );

  return {
    createOrdem: trigger,
    isCreating: isMutating,
    error,
  };
}

export function useUpdateOrdem() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/ordens",
    async (url, { arg }: { arg: UpdateOrdemData }) => {
      return ordemService.updateOrdem(arg);
    }
  );

  return {
    updateOrdem: trigger,
    isUpdating: isMutating,
    error,
  };
}

export function useDeleteOrdem() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/ordens",
    async (url, { arg }: { arg: string }) => {
      return ordemService.deleteOrdem(arg);
    }
  );

  return {
    deleteOrdem: trigger,
    isDeleting: isMutating,
    error,
  };
}

export function useFinalizarOrdem() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/ordens",
    async (url, { arg }: { arg: string }) => {
      return ordemService.finalizarOrdem(arg);
    }
  );

  return {
    finalizarOrdem: trigger,
    isFinalizando: isMutating,
    error,
  };
}
