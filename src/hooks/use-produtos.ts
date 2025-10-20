import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api";

// Interfaces para tipagem (Interface Segregation Principle)
export interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  codigo: string;
  preco: number;
  quantidade: number;
  quantidadeMinima: number;
  categoria?: string;
  fornecedor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProdutoData {
  nome: string;
  descricao?: string;
  codigo: string;
  preco: number;
  quantidade?: number;
  quantidadeMinima?: number;
  categoria?: string;
  fornecedor?: string;
}

export interface UpdateProdutoData extends Partial<CreateProdutoData> {
  id: string;
}

// Classe para gerenciar operações de produtos (Single Responsibility Principle)
class ProdutoService {
  private client = apiClient;

  async getProdutos(): Promise<PaginatedResponse<Produto>> {
    return this.client.get<Produto[]>("/produtos");
  }

  async getProduto(id: string): Promise<ApiResponse<Produto>> {
    return this.client.get<Produto>(`/produtos/${id}`);
  }

  async createProduto(data: CreateProdutoData): Promise<ApiResponse<Produto>> {
    return this.client.post<Produto>("/produtos", data);
  }

  async updateProduto(data: UpdateProdutoData): Promise<ApiResponse<Produto>> {
    const { id, ...updateData } = data;
    return this.client.put<Produto>(`/produtos/${id}`, updateData);
  }

  async deleteProduto(id: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/produtos/${id}`);
  }

  async getProdutosEstoqueBaixo(): Promise<ApiResponse<Produto[]>> {
    return this.client.get<Produto[]>("/produtos/estoque-baixo");
  }
}

// Instância singleton do serviço
const produtoService = new ProdutoService();

// Hooks SWR para produtos
export function useProdutos() {
  const { data, error, isLoading, mutate } = useSWR(
    "/produtos",
    () => produtoService.getProdutos(),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    produtos: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}

export function useProduto(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/produtos/${id}` : null,
    () => produtoService.getProduto(id),
    {
      revalidateOnFocus: true,
    }
  );

  return {
    produto: data?.data,
    isLoading,
    error,
    mutate,
  };
}

export function useCreateProduto() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/produtos",
    async (url, { arg }: { arg: CreateProdutoData }) => {
      return produtoService.createProduto(arg);
    }
  );

  return {
    createProduto: trigger,
    isCreating: isMutating,
    error,
  };
}

export function useUpdateProduto() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/produtos",
    async (url, { arg }: { arg: UpdateProdutoData }) => {
      return produtoService.updateProduto(arg);
    }
  );

  return {
    updateProduto: trigger,
    isUpdating: isMutating,
    error,
  };
}

export function useDeleteProduto() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/produtos",
    async (url, { arg }: { arg: string }) => {
      return produtoService.deleteProduto(arg);
    }
  );

  return {
    deleteProduto: trigger,
    isDeleting: isMutating,
    error,
  };
}

export function useProdutosEstoqueBaixo() {
  const { data, error, isLoading, mutate } = useSWR(
    "/produtos/estoque-baixo",
    () => produtoService.getProdutosEstoqueBaixo(),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    produtosEstoqueBaixo: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}
