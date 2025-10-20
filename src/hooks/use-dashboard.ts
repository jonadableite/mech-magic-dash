import useSWR from "swr";
import { apiClient, ApiResponse } from "@/lib/api";

// Interfaces para tipagem (Interface Segregation Principle)
export interface DashboardStats {
  ordensAbertas: number;
  clientesAtivos: number;
  itensEstoque: number;
  faturamentoMensal: number;
  variacaoOrdens: number;
  variacaoClientes: number;
  variacaoEstoque: number;
  variacaoFaturamento: number;
}

export interface OrdemRecente {
  id: string;
  numero: string;
  cliente: string;
  veiculo: string;
  status: string;
  prioridade: string;
}

export interface ItemEstoqueBaixo {
  id: string;
  nome: string;
  quantidade: number;
  quantidadeMinima: number;
}

export interface DashboardData {
  stats: DashboardStats;
  ordensRecentes: OrdemRecente[];
  estoqueBaixo: ItemEstoqueBaixo[];
}

// Classe para gerenciar operações do dashboard (Single Responsibility Principle)
class DashboardService {
  private client = apiClient;

  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    return this.client.get<DashboardData>("/dashboard");
  }
}

// Instância singleton do serviço
const dashboardService = new DashboardService();

// Hook SWR para dashboard
export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR(
    "/dashboard",
    () => dashboardService.getDashboardData(),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh a cada 30 segundos
    }
  );

  return {
    dashboardData: data?.data,
    isLoading,
    error,
    mutate,
  };
}
