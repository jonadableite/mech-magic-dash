"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Download, RefreshCw } from "lucide-react";
import { format, subDays, subMonths, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FiltrosRelatorioProps {
  onFiltrosChange: (filtros: FiltrosRelatorio) => void;
  onExportar: () => void;
  isLoading?: boolean;
}

export interface FiltrosRelatorio {
  periodo: "hoje" | "7dias" | "30dias" | "90dias" | "personalizado";
  dataInicio?: string;
  dataFim?: string;
  tipoRelatorio: "fluxo" | "categorias" | "comparativo";
  formatoGrafico: "linha" | "barra" | "pizza";
}

const PERIODOS_PRESET = [
  { value: "hoje", label: "Hoje" },
  { value: "7dias", label: "Últimos 7 dias" },
  { value: "30dias", label: "Últimos 30 dias" },
  { value: "90dias", label: "Últimos 90 dias" },
  { value: "personalizado", label: "Período personalizado" },
];

const TIPOS_RELATORIO = [
  { value: "fluxo", label: "Fluxo de Caixa" },
  { value: "categorias", label: "Por Categorias" },
  { value: "comparativo", label: "Comparativo" },
];

const FORMATOS_GRAFICO = [
  { value: "linha", label: "Linha" },
  { value: "barra", label: "Barras" },
  { value: "pizza", label: "Pizza" },
];

export function FiltrosRelatorio({
  onFiltrosChange,
  onExportar,
  isLoading = false,
}: FiltrosRelatorioProps) {
  const [filtros, setFiltros] = useState<FiltrosRelatorio>({
    periodo: "30dias",
    tipoRelatorio: "fluxo",
    formatoGrafico: "linha",
  });

  const handlePeriodoChange = (periodo: string) => {
    let dataInicio: string | undefined;
    let dataFim: string | undefined;

    const hoje = new Date();

    switch (periodo) {
      case "hoje":
        dataInicio = format(hoje, "yyyy-MM-dd");
        dataFim = format(hoje, "yyyy-MM-dd");
        break;
      case "7dias":
        dataInicio = format(subDays(hoje, 7), "yyyy-MM-dd");
        dataFim = format(hoje, "yyyy-MM-dd");
        break;
      case "30dias":
        dataInicio = format(subDays(hoje, 30), "yyyy-MM-dd");
        dataFim = format(hoje, "yyyy-MM-dd");
        break;
      case "90dias":
        dataInicio = format(subDays(hoje, 90), "yyyy-MM-dd");
        dataFim = format(hoje, "yyyy-MM-dd");
        break;
      case "personalizado":
        dataInicio = format(subDays(hoje, 30), "yyyy-MM-dd");
        dataFim = format(hoje, "yyyy-MM-dd");
        break;
    }

    const novosFiltros = {
      ...filtros,
      periodo: periodo as FiltrosRelatorio["periodo"],
      dataInicio,
      dataFim,
    };

    setFiltros(novosFiltros);
    onFiltrosChange(novosFiltros);
  };

  const handleFiltroChange = (key: keyof FiltrosRelatorio, value: any) => {
    const novosFiltros = { ...filtros, [key]: value };
    setFiltros(novosFiltros);
    onFiltrosChange(novosFiltros);
  };

  const handleGerarRelatorio = () => {
    onFiltrosChange(filtros);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Filtros do Relatório
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Período */}
          <div className="space-y-2">
            <Label htmlFor="periodo">Período</Label>
            <Select
              value={filtros.periodo}
              onValueChange={handlePeriodoChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                {PERIODOS_PRESET.map((periodo) => (
                  <SelectItem key={periodo.value} value={periodo.value}>
                    {periodo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Início */}
          {filtros.periodo === "personalizado" && (
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={filtros.dataInicio || ""}
                onChange={(e) =>
                  handleFiltroChange("dataInicio", e.target.value)
                }
              />
            </div>
          )}

          {/* Data Fim */}
          {filtros.periodo === "personalizado" && (
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={filtros.dataFim || ""}
                onChange={(e) => handleFiltroChange("dataFim", e.target.value)}
              />
            </div>
          )}

          {/* Tipo de Relatório */}
          <div className="space-y-2">
            <Label htmlFor="tipoRelatorio">Tipo de Relatório</Label>
            <Select
              value={filtros.tipoRelatorio}
              onValueChange={(value) =>
                handleFiltroChange("tipoRelatorio", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_RELATORIO.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Formato do Gráfico */}
          <div className="space-y-2">
            <Label htmlFor="formatoGrafico">Formato do Gráfico</Label>
            <Select
              value={filtros.formatoGrafico}
              onValueChange={(value) =>
                handleFiltroChange("formatoGrafico", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o formato" />
              </SelectTrigger>
              <SelectContent>
                {FORMATOS_GRAFICO.map((formato) => (
                  <SelectItem key={formato.value} value={formato.value}>
                    {formato.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleGerarRelatorio} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Gerar Relatório
          </Button>
          <Button variant="outline" onClick={onExportar}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Resumo do Período */}
        {filtros.dataInicio && filtros.dataFim && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Período selecionado:</strong>{" "}
              {format(new Date(filtros.dataInicio), "dd/MM/yyyy", {
                locale: ptBR,
              })}{" "}
              até{" "}
              {format(new Date(filtros.dataFim), "dd/MM/yyyy", {
                locale: ptBR,
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
