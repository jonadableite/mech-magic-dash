import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api";
import { CreateClienteData, UpdateClienteData } from "@/lib/schemas";

// Interfaces para tipagem (Interface Segregation Principle)
export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco?: string;
  createdAt: string;
  updatedAt: string;
  veiculos?: Veiculo[];
  ordens?: OrdemServico[];
}

export interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  cor?: string;
  observacoes?: string;
  clienteId: string;
  createdAt: string;
  updatedAt: string;
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

// Classe para gerenciar operações de clientes (Single Responsibility Principle)
class ClienteService {
  private client = apiClient;

  async getClientes(): Promise<ApiResponse<Cliente[]>> {
    return this.client.get<Cliente[]>("/clientes");
  }

  async getCliente(id: string): Promise<ApiResponse<Cliente>> {
    return this.client.get<Cliente>(`/clientes/${id}`);
  }

  async createCliente(data: CreateClienteData): Promise<ApiResponse<Cliente>> {
    return this.client.post<Cliente>("/clientes", data);
  }

  async updateCliente(data: UpdateClienteData): Promise<ApiResponse<Cliente>> {
    const { id, ...updateData } = data;
    return this.client.put<Cliente>(`/clientes/${id}`, updateData);
  }

  async deleteCliente(id: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/clientes/${id}`);
  }
}

// Instância singleton do serviço
const clienteService = new ClienteService();

// Hooks SWR para clientes
export function useClientes() {
  const { data, error, isLoading, mutate } = useSWR(
    "/clientes",
    () => clienteService.getClientes(),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    clientes: data?.data || [],
    isLoading,
    error,
    mutate,
  }
}

export function useCliente(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/clientes/${id}` : null,
    () => clienteService.getCliente(id),
    {
      revalidateOnFocus: true,
    }
  );

  return {
    cliente: data?.data,
    isLoading,
    error,
    mutate,
  };
}

export function useCreateCliente() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/clientes",
    async (url, { arg }: { arg: CreateClienteData }) => {
      return clienteService.createCliente(arg);
    }
  );

  return {
    createCliente: trigger,
    isCreating: isMutating,
    error,
  };
}

export function useUpdateCliente() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/clientes",
    async (url, { arg }: { arg: UpdateClienteData }) => {
      return clienteService.updateCliente(arg);
    }
  );

  return {
    updateCliente: trigger,
    isUpdating: isMutating,
    error,
  };
}

export function useDeleteCliente() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/clientes",
    async (url, { arg }: { arg: string }) => {
      return clienteService.deleteCliente(arg);
    }
  );

  return {
    deleteCliente: trigger,
    isDeleting: isMutating,
    error,
  };
}
