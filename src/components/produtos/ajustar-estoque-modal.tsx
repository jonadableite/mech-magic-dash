"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSWRConfig } from "swr";
import { ToastService } from "@/lib/toast";
import { Loader2, Package, TrendingUp, TrendingDown, Calculator } from "lucide-react";
import { z } from "zod";

const ajustarEstoqueSchema = z.object({
  quantidade: z.number().int().min(1, "Quantidade deve ser maior que zero"),
  tipo: z.enum(["entrada", "saida"], {
    errorMap: () => ({ message: "Tipo deve ser 'entrada' ou 'saida'" }),
  }),
});

type AjustarEstoqueData = z.infer<typeof ajustarEstoqueSchema>;

interface AjustarEstoqueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto: {
    id: string;
    nome: string;
    codigo: string;
    quantidade: number;
    quantidadeMinima: number;
  } | null;
}

export function AjustarEstoqueModal({ open, onOpenChange, produto }: AjustarEstoqueModalProps) {
  const { mutate } = useSWRConfig();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<AjustarEstoqueData>({
    resolver: zodResolver(ajustarEstoqueSchema),
    defaultValues: {
      quantidade: 1,
      tipo: "entrada",
    },
  });

  // Se não há produto selecionado, não renderiza o modal
  if (!produto) {
    return null;
  }

  const tipoSelecionado = watch("tipo");
  const quantidadeSelecionada = watch("quantidade");

  // Calcular nova quantidade (após verificar se produto existe)
  const novaQuantidade = tipoSelecionado === "entrada"
    ? produto.quantidade + quantidadeSelecionada
    : produto.quantidade - quantidadeSelecionada;

  const isQuantidadeInvalida = novaQuantidade < 0;

  const onSubmit = async (data: AjustarEstoqueData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/produtos/${produto.id}/ajustar-estoque`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erro ao ajustar estoque");
      }

      // Atualiza as listas SWR
      await Promise.all([
        mutate("/produtos"),
        mutate("/produtos/estoque/stats"),
        mutate("/produtos/estoque-baixo"),
      ]);

      // Notificação de sucesso
      ToastService.success(
        "Estoque ajustado com sucesso!",
        `${data.quantidade} unidades ${data.tipo === "entrada" ? "adicionadas" : "removidas"} do estoque.`
      );

      // Fecha modal e reseta form
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Erro ao ajustar estoque:", error);
      ToastService.error(
        "Erro ao ajustar estoque",
        error instanceof Error ? error.message : "Tente novamente mais tarde."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[95%] mx-auto rounded-2xl p-6 space-y-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            Ajustar Estoque
          </DialogTitle>
          <div className="space-y-1">
            <p className="text-muted-foreground">
              Produto: <span className="font-medium text-foreground">{produto.nome}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Código: {produto.codigo} | Estoque atual: {produto.quantidade} unidades
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo de Ajuste */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tipo de Ajuste *</Label>
            <Select
              value={tipoSelecionado}
              onValueChange={(value) => setValue("tipo", value as "entrada" | "saida")}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Entrada (Adicionar)
                  </div>
                </SelectItem>
                <SelectItem value="saida">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Saída (Remover)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && (
              <p className="text-sm text-red-500">{errors.tipo.message}</p>
            )}
          </div>

          {/* Quantidade */}
          <div className="space-y-2">
            <Label htmlFor="quantidade" className="text-sm font-medium">
              Quantidade *
            </Label>
            <Input
              id="quantidade"
              type="number"
              min="1"
              {...register("quantidade", { valueAsNumber: true })}
              placeholder="Digite a quantidade"
              className={`transition-all duration-200 ${errors.quantidade || isQuantidadeInvalida ? "border-red-500 focus:border-red-500" : ""
                }`}
              disabled={isLoading}
            />
            {errors.quantidade && (
              <p className="text-sm text-red-500">{errors.quantidade.message}</p>
            )}
            {isQuantidadeInvalida && (
              <p className="text-sm text-red-500">
                Quantidade insuficiente em estoque
              </p>
            )}
          </div>

          {/* Preview da Nova Quantidade */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estoque atual:</span>
              <span className="font-mono">{produto.quantidade}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {tipoSelecionado === "entrada" ? "Adicionando:" : "Removendo:"}
              </span>
              <span className="font-mono text-primary">
                {tipoSelecionado === "entrada" ? "+" : "-"}{quantidadeSelecionada}
              </span>
            </div>
            <div className="border-t pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Nova quantidade:</span>
                <span className={`font-mono font-bold ${isQuantidadeInvalida ? "text-red-500" :
                  novaQuantidade <= produto.quantidadeMinima ? "text-orange-500" :
                    "text-green-600"
                  }`}>
                  {novaQuantidade}
                </span>
              </div>
              {novaQuantidade <= produto.quantidadeMinima && novaQuantidade >= 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ Estoque ficará baixo (mínimo: {produto.quantidadeMinima})
                </p>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={isLoading || isQuantidadeInvalida}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ajustando...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" />
                  Ajustar Estoque
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
