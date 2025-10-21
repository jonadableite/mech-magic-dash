"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Download,
  FileText,
  Table,
} from "lucide-react";
import { formatBRL } from "@/lib/currency";
import { FiltrosRelatorio, type FiltrosRelatorioProps } from "./filtros-relatorio";
import { GraficoFluxoCaixa } from "./grafico-fluxo-caixa";
import { GraficoCategorias } from "./grafico-categorias";
import { useRelatorio, useExportarRelatorio } from "@/hooks/use-relatorios";
import { ToastService } from "@/lib/toast";

export function RelatoriosDashboard() {
  const [filtros, setFiltros] = useState<FiltrosRelatorio>({
    periodo: "30dias",
    tipoRelatorio: "fluxo",
    formatoGrafico: "linha",
  });

  const { relatorio, isLoading, error } = useRelatorio(filtros);
  const { exportar } = useExportarRelatorio();

  const handleFiltrosChange = (novosFiltros: FiltrosRelatorio) => {
    setFiltros(novosFiltros);
  };

  const handleExportar = async () => {
    try {
      await exportar(filtros, "pdf");
      ToastService.success("Relatório exportado com sucesso!");
    } catch (error) {
      ToastService.error("Erro ao exportar relatório");
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Erro ao carregar relatórios
          </h3>
          <p className="text-muted-foreground">
            Tente recarregar a página ou verificar sua conexão
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Recarregar Página
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <FiltrosRelatorio
        onFiltrosChange={handleFiltrosChange}
        onExportar={handleExportar}
        isLoading={isLoading}
      />

      {/* Resumo */}
      {relatorio && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatBRL(relatorio.resumo.totalEntradas)}
              </div>
              <p className="text-xs text-muted-foreground">
                {relatorio.resumo.movimentacoes} movimentações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatBRL(relatorio.resumo.totalSaidas)}
              </div>
              <p className="text-xs text-muted-foreground">
                Ticket médio: {formatBRL(relatorio.resumo.ticketMedio)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${relatorio.resumo.saldoLiquido >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                {formatBRL(relatorio.resumo.saldoLiquido)}
              </div>
              <p className="text-xs text-muted-foreground">
                {relatorio.resumo.saldoLiquido >= 0 ? "Positivo" : "Negativo"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Movimentações</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {relatorio.resumo.movimentacoes}
              </div>
              <p className="text-xs text-muted-foreground">
                No período selecionado
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : relatorio ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fluxo de Caixa */}
          <GraficoFluxoCaixa
            data={relatorio.fluxoCaixa}
            tipo={filtros.formatoGrafico === "pizza" ? "linha" : filtros.formatoGrafico}
            periodo={`${filtros.dataInicio || "Últimos 30 dias"}`}
          />

          {/* Categorias */}
          {filtros.tipoRelatorio === "categorias" && (
            <GraficoCategorias
              data={relatorio.categoriasEntrada}
              title="Entradas por Categoria"
            />
          )}

          {filtros.tipoRelatorio === "categorias" && (
            <GraficoCategorias
              data={relatorio.categoriasSaida}
              title="Saídas por Categoria"
            />
          )}

          {/* Comparativo */}
          {filtros.tipoRelatorio === "comparativo" && (
            <div className="space-y-6">
              <GraficoCategorias
                data={relatorio.categoriasEntrada}
                title="Entradas por Categoria"
              />
              <GraficoCategorias
                data={relatorio.categoriasSaida}
                title="Saídas por Categoria"
              />
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Nenhum dado encontrado
                </h3>
                <p className="text-muted-foreground">
                  Selecione um período e gere o relatório
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações Rápidas */}
      {relatorio && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportar Relatório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => exportar(filtros, "pdf")}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => exportar(filtros, "excel")}
                className="gap-2"
              >
                <Table className="h-4 w-4" />
                Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => exportar(filtros, "csv")}
                className="gap-2"
              >
                <Table className="h-4 w-4" />
                CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
