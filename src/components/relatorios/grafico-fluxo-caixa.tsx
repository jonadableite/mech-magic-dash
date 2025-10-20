"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBRL } from "@/lib/currency";

interface FluxoCaixaData {
  data: string;
  entradas: number;
  saidas: number;
  saldo: number;
}

interface GraficoFluxoCaixaProps {
  data: FluxoCaixaData[];
  tipo: "linha" | "barra";
  periodo: string;
}

export function GraficoFluxoCaixa({ data, tipo, periodo }: GraficoFluxoCaixaProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm">
            {format(new Date(label), "dd/MM/yyyy", { locale: ptBR })}
          </p>
          <div className="space-y-1">
            <p className="text-green-600 text-sm">
              Entradas: {formatBRL(payload[0]?.value || 0)}
            </p>
            <p className="text-red-600 text-sm">
              Saídas: {formatBRL(payload[1]?.value || 0)}
            </p>
            <p className="text-primary font-medium text-sm">
              Saldo: {formatBRL(payload[2]?.value || 0)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Fluxo de Caixa</span>
          <span className="text-sm font-normal text-muted-foreground">
            ({periodo})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {tipo === "linha" ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="data"
                  tickFormatter={(value) =>
                    format(new Date(value), "dd/MM", { locale: ptBR })
                  }
                  className="text-xs"
                />
                <YAxis
                  tickFormatter={(value) => formatBRL(value)}
                  className="text-xs"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="entradas"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                  name="Entradas"
                />
                <Line
                  type="monotone"
                  dataKey="saidas"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                  name="Saídas"
                />
                <Line
                  type="monotone"
                  dataKey="saldo"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                  name="Saldo"
                />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="data"
                  tickFormatter={(value) =>
                    format(new Date(value), "dd/MM", { locale: ptBR })
                  }
                  className="text-xs"
                />
                <YAxis
                  tickFormatter={(value) => formatBRL(value)}
                  className="text-xs"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="entradas" fill="#22c55e" name="Entradas" />
                <Bar dataKey="saidas" fill="#ef4444" name="Saídas" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
