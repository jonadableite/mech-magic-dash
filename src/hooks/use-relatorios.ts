import useSWR from "swr";
import { FiltrosRelatorio } from "@/components/relatorios/filtros-relatorio";

// Interfaces para os dados dos relatórios
export interface FluxoCaixaData {
  data: string;
  entradas: number;
  saidas: number;
  saldo: number;
}

export interface CategoriaData {
  name: string;
  value: number;
  color: string;
}

export interface RelatorioData {
  fluxoCaixa: FluxoCaixaData[];
  categoriasEntrada: CategoriaData[];
  categoriasSaida: CategoriaData[];
  resumo: {
    totalEntradas: number;
    totalSaidas: number;
    saldoLiquido: number;
    movimentacoes: number;
    ticketMedio: number;
  };
}

// Service para buscar dados de relatórios
class RelatorioService {
  private static baseUrl = "/api/relatorios";

  static async fetchRelatorio(
    filtros: FiltrosRelatorio
  ): Promise<RelatorioData> {
    const params = new URLSearchParams();

    if (filtros.dataInicio) params.set("dataInicio", filtros.dataInicio);
    if (filtros.dataFim) params.set("dataFim", filtros.dataFim);
    params.set("tipoRelatorio", filtros.tipoRelatorio);
    params.set("formatoGrafico", filtros.formatoGrafico);

    const response = await fetch(`${this.baseUrl}?${params}`);
    if (!response.ok) {
      throw new Error("Erro ao buscar dados do relatório");
    }
    return response.json();
  }

  static async exportarRelatorio(
    filtros: FiltrosRelatorio,
    formato: "pdf" | "excel" | "csv"
  ): Promise<Blob> {
    const params = new URLSearchParams();

    if (filtros.dataInicio) params.set("dataInicio", filtros.dataInicio);
    if (filtros.dataFim) params.set("dataFim", filtros.dataFim);
    params.set("tipoRelatorio", filtros.tipoRelatorio);
    params.set("formato", formato);

    const response = await fetch(`${this.baseUrl}/exportar?${params}`);
    if (!response.ok) {
      throw new Error("Erro ao exportar relatório");
    }
    return response.blob();
  }
}

// Hook para buscar dados do relatório
export function useRelatorio(filtros: FiltrosRelatorio) {
  const { data, error, isLoading, mutate } = useSWR(
    ["/api/relatorios", filtros],
    () => RelatorioService.fetchRelatorio(filtros),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    relatorio: data,
    isLoading,
    error,
    mutate,
  };
}

// Hook para exportar relatório
export function useExportarRelatorio() {
  const exportar = async (
    filtros: FiltrosRelatorio,
    formato: "pdf" | "excel" | "csv"
  ) => {
    try {
      const blob = await RelatorioService.exportarRelatorio(filtros, formato);

      // Criar link para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Nome do arquivo baseado no formato e data
      const dataAtual = new Date().toISOString().split("T")[0];
      const nomeArquivo = `relatorio-${filtros.tipoRelatorio}-${dataAtual}.${formato}`;
      link.download = nomeArquivo;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      throw error;
    }
  };

  return { exportar };
}
