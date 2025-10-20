import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api";
import { CreateProdutoData, UpdateProdutoData } from "@/lib/schemas";

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

export interface EstoqueStats {
  totalProdutos: number;
  totalValor: number;
  produtosEstoqueBaixo: number;
  produtosSemEstoque: number;
  categorias: { categoria: string; quantidade: number }[];
}

// Classe para gerenciar operações de produtos (Single Responsibility Principle)
class ProdutoService {
  private client = apiClient;

  async getProdutos(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoria?: string;
    estoqueBaixo?: boolean;
  }): Promise<PaginatedResponse<Produto>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.categoria) searchParams.set("categoria", params.categoria);
    if (params?.estoqueBaixo) searchParams.set("estoqueBaixo", "true");

    const query = searchParams.toString();
    return this.client.get<Produto[]>(`/produtos${query ? `?${query}` : ""}`);
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

  async ajustarEstoque(id: string, quantidade: number, tipo: "entrada" | "saida"): Promise<ApiResponse<Produto>> {
    return this.client.post<Produto>(`/produtos/${id}/ajustar-estoque`, {
      quantidade,
      tipo,
    });
  }

  async getEstoqueStats(): Promise<ApiResponse<EstoqueStats>> {
    return this.client.get<EstoqueStats>("/produtos/estoque/stats");
  }

  async getProdutosEstoqueBaixo(): Promise<ApiResponse<Produto[]>> {
    return this.client.get<Produto[]>("/produtos/estoque-baixo");
  }
}

// Instância singleton do serviço
const produtoService = new ProdutoService();

// Hooks SWR para produtos
export function useProdutos(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoria?: string;
  estoqueBaixo?: boolean;
}) {
  const { data, error, isLoading, mutate } = useSWR(
    ["/produtos", params],
    () => produtoService.getProdutos(params),
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

export function useAjustarEstoque() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/produtos",
    async (url, { arg }: { arg: { id: string; quantidade: number; tipo: "entrada" | "saida" } }) => {
      return produtoService.ajustarEstoque(arg.id, arg.quantidade, arg.tipo);
    }
  );

  return {
    ajustarEstoque: trigger,
    isAjustando: isMutating,
    error,
  };
}

export function useEstoqueStats() {
  const { data, error, isLoading, mutate } = useSWR(
    "/produtos/estoque/stats",
    () => produtoService.getEstoqueStats(),
    {
      refreshInterval: 30000, // Atualizar a cada 30 segundos
      revalidateOnFocus: true,
    }
  );

  return {
    stats: data?.data,
    isLoading,
    error,
    mutate,
  };
}

export function useProdutosEstoqueBaixo() {
  const { data, error, isLoading, mutate } = useSWR(
    "/produtos/estoque-baixo",
    () => produtoService.getProdutosEstoqueBaixo(),
    {
      refreshInterval: 60000, // Atualizar a cada 1 minuto
      revalidateOnFocus: true,
    }
  );

  return {
    produtosEstoqueBaixo: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}