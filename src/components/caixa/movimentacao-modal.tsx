"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import { createMovimentacaoSchema, updateMovimentacaoSchema, CreateMovimentacaoData, UpdateMovimentacaoData } from "@/lib/schemas";
import { useCreateMovimentacao, useUpdateMovimentacao } from "@/hooks/use-caixa";
import { ToastService } from "@/lib/toast";

interface MovimentacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caixaId: string;
  movimentacao?: any; // Para edição
  isEditing?: boolean;
}

const TIPOS_MOVIMENTACAO = [
  { value: "ENTRADA", label: "Entrada", icon: TrendingUp, color: "text-green-600" },
  { value: "SAIDA", label: "Saída", icon: TrendingDown, color: "text-red-600" },
];

const CATEGORIAS_MOVIMENTACAO = [
  { value: "VENDAS", label: "Vendas" },
  { value: "SERVICOS", label: "Serviços" },
  { value: "PAGAMENTOS", label: "Pagamentos" },
  { value: "RECEBIMENTOS", label: "Recebimentos" },
  { value: "DESPESAS", label: "Despesas" },
  { value: "INVESTIMENTOS", label: "Investimentos" },
  { value: "OUTROS", label: "Outros" },
];

export function MovimentacaoModal({
  open,
  onOpenChange,
  caixaId,
  movimentacao,
  isEditing = false
}: MovimentacaoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createMovimentacao, isCreating } = useCreateMovimentacao();
  const { updateMovimentacao, isUpdating } = useUpdateMovimentacao();

  const form = useForm<CreateMovimentacaoData | UpdateMovimentacaoData>({
    resolver: zodResolver(isEditing ? updateMovimentacaoSchema : createMovimentacaoSchema),
    defaultValues: {
      tipo: "ENTRADA",
      valor: 0,
      descricao: "",
      categoria: "VENDAS",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditing && movimentacao) {
        form.reset({
          tipo: movimentacao.tipo,
          valor: movimentacao.valor,
          descricao: movimentacao.descricao,
          categoria: movimentacao.categoria,
          observacoes: movimentacao.observacoes || "",
        });
      } else {
        form.reset({
          tipo: "ENTRADA",
          valor: 0,
          descricao: "",
          categoria: "VENDAS",
          observacoes: "",
        });
      }
    }
  }, [open, isEditing, movimentacao, form]);

  const onSubmit = async (data: CreateMovimentacaoData | UpdateMovimentacaoData) => {
    try {
      setIsSubmitting(true);

      if (isEditing && movimentacao) {
        await updateMovimentacao({
          caixaId,
          movimentacaoId: movimentacao.id,
          data: data as UpdateMovimentacaoData,
        });
        ToastService.success("Movimentação atualizada com sucesso!");
      } else {
        await createMovimentacao({
          caixaId,
          data: data as CreateMovimentacaoData,
        });
        ToastService.success("Movimentação registrada com sucesso!");
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar movimentação:", error);
      ToastService.error(
        error instanceof Error ? error.message : "Erro ao salvar movimentação"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTipo = form.watch("tipo");
  const TipoIcon = TIPOS_MOVIMENTACAO.find(t => t.value === selectedTipo)?.icon || TrendingUp;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TipoIcon className="h-5 w-5" />
            {isEditing ? "Editar Movimentação" : "Nova Movimentação"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edite os dados da movimentação"
              : "Registre uma nova movimentação no caixa"
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIPOS_MOVIMENTACAO.map((tipo) => {
                        const Icon = tipo.icon;
                        return (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${tipo.color}`} />
                              {tipo.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descrição da movimentação..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIAS_MOVIMENTACAO.map((categoria) => (
                        <SelectItem key={categoria.value} value={categoria.value}>
                          {categoria.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isCreating || isUpdating}
                className="gap-2"
              >
                {isSubmitting || isCreating || isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {isEditing ? "Atualizar" : "Registrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
