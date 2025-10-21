"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Edit, X, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUpdateOrdem } from "@/hooks/use-ordens";
import { useClientes } from "@/hooks/use-clientes";
import { useVeiculos } from "@/hooks/use-veiculos";
import { OrdemServico, ItemOrdemServico } from "@/hooks/use-ordens";

// Schema de validação (Single Responsibility Principle)
const itemSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  quantidade: z.number().min(1, "Quantidade deve ser maior que 0"),
  valorUnitario: z.number().min(0, "Valor unitário deve ser maior ou igual a 0"),
  valorTotal: z.number().min(0, "Valor total deve ser maior ou igual a 0"),
  observacoes: z.string().optional(),
});

const editarOrdemSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  status: z.enum(["ABERTA", "EM_ANDAMENTO", "AGUARDANDO_PECAS", "FINALIZADA", "CANCELADA"]),
  prioridade: z.enum(["BAIXA", "MEDIA", "ALTA", "URGENTE"]),
  observacoes: z.string().optional(),
  clienteId: z.string().min(1, "Cliente é obrigatório"),
  veiculoId: z.string().min(1, "Veículo é obrigatório"),
  itens: z.array(itemSchema).default([]),
});

type EditarOrdemFormData = z.infer<typeof editarOrdemSchema>;
type ItemFormData = z.infer<typeof itemSchema>;

interface EditarOrdemModalProps {
  isOpen: boolean;
  onClose: () => void;
  ordem: OrdemServico | null;
}

export function EditarOrdemModal({ isOpen, onClose, ordem }: EditarOrdemModalProps) {
  const [veiculosFiltrados, setVeiculosFiltrados] = useState<any[]>([]);
  const { toast } = useToast();
  const { updateOrdem, isUpdating } = useUpdateOrdem();
  const { clientes, isLoading: clientesLoading } = useClientes();
  const { veiculos, isLoading: veiculosLoading } = useVeiculos();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<EditarOrdemFormData>({
    resolver: zodResolver(editarOrdemSchema),
  });

  const clienteId = watch("clienteId");

  // Carregar dados da ordem quando modal abre (Dependency Inversion Principle)
  useEffect(() => {
    if (ordem && isOpen) {
      reset({
        descricao: ordem.descricao,
        status: ordem.status,
        prioridade: ordem.prioridade,
        observacoes: ordem.observacoes || "",
        clienteId: ordem.cliente.id,
        veiculoId: ordem.veiculo.id,
        itens: ordem.itens.map(item => ({
          descricao: item.descricao,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          valorTotal: item.valorTotal,
          observacoes: item.observacoes || "",
        })),
      });
    }
  }, [ordem, isOpen, reset]);

  // Filtrar veículos quando cliente muda (Open/Closed Principle)
  useEffect(() => {
    if (clienteId) {
      const veiculosDoCliente = veiculos.filter(
        (veiculo) => veiculo.clienteId === clienteId
      );
      setVeiculosFiltrados(veiculosDoCliente);
    } else {
      setVeiculosFiltrados([]);
    }
  }, [clienteId, veiculos]);

  const onSubmit = async (data: EditarOrdemFormData) => {
    if (!ordem) return;

    try {
      await updateOrdem({
        id: ordem.id,
        ...data,
      });
      toast({
        title: "Sucesso",
        description: "Ordem de serviço atualizada com sucesso!",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar ordem de serviço. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const adicionarItem = () => {
    const itensAtuais = getValues("itens");
    setValue("itens", [
      ...itensAtuais,
      {
        descricao: "",
        quantidade: 1,
        valorUnitario: 0,
        valorTotal: 0,
        observacoes: "",
      },
    ]);
  };

  const removerItem = (index: number) => {
    const itensAtuais = getValues("itens");
    setValue(
      "itens",
      itensAtuais.filter((_, i) => i !== index)
    );
  };

  const atualizarItem = (index: number, campo: keyof ItemFormData, valor: any) => {
    const itensAtuais = getValues("itens");
    const itemAtualizado = { ...itensAtuais[index], [campo]: valor };

    // Calcular valor total do item
    if (campo === "quantidade" || campo === "valorUnitario") {
      itemAtualizado.valorTotal = itemAtualizado.quantidade * itemAtualizado.valorUnitario;
    }

    const novosItens = [...itensAtuais];
    novosItens[index] = itemAtualizado;
    setValue("itens", novosItens);
  };

  const calcularTotal = () => {
    const itens = getValues("itens");
    return itens.reduce((total, item) => total + (item.quantidade * item.valorUnitario), 0);
  };

  if (!ordem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Ordem de Serviço - {ordem.numero}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cliente */}
            <div className="space-y-2">
              <Label htmlFor="clienteId">Cliente *</Label>
              <Select
                value={getValues("clienteId")}
                onValueChange={(value) => setValue("clienteId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientesLoading ? (
                    <SelectItem value="" disabled>Carregando...</SelectItem>
                  ) : (
                    clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.clienteId && (
                <p className="text-sm text-destructive">{errors.clienteId.message}</p>
              )}
            </div>

            {/* Veículo */}
            <div className="space-y-2">
              <Label htmlFor="veiculoId">Veículo *</Label>
              <Select
                value={getValues("veiculoId")}
                onValueChange={(value) => setValue("veiculoId", value)}
                disabled={!clienteId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um veículo" />
                </SelectTrigger>
                <SelectContent>
                  {veiculosLoading ? (
                    <SelectItem value="" disabled>Carregando...</SelectItem>
                  ) : veiculosFiltrados.length === 0 ? (
                    <SelectItem value="" disabled>Nenhum veículo encontrado</SelectItem>
                  ) : (
                    veiculosFiltrados.map((veiculo) => (
                      <SelectItem key={veiculo.id} value={veiculo.id}>
                        {veiculo.marca} {veiculo.modelo} {veiculo.ano} - {veiculo.placa}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.veiculoId && (
                <p className="text-sm text-destructive">{errors.veiculoId.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={getValues("status")}
                onValueChange={(value) => setValue("status", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ABERTA">Aberta</SelectItem>
                  <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                  <SelectItem value="AGUARDANDO_PECAS">Aguardando Peças</SelectItem>
                  <SelectItem value="FINALIZADA">Finalizada</SelectItem>
                  <SelectItem value="CANCELADA">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select
                value={getValues("prioridade")}
                onValueChange={(value) => setValue("prioridade", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAIXA">Baixa</SelectItem>
                  <SelectItem value="MEDIA">Média</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                  <SelectItem value="URGENTE">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              {...register("descricao")}
              placeholder="Descreva o problema ou serviço a ser realizado..."
              className="min-h-[100px]"
            />
            {errors.descricao && (
              <p className="text-sm text-destructive">{errors.descricao.message}</p>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              {...register("observacoes")}
              placeholder="Observações adicionais..."
              className="min-h-[80px]"
            />
          </div>

          {/* Itens da Ordem */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Itens da Ordem</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={adicionarItem}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Adicionar Item
              </Button>
            </div>

            {getValues("itens").map((item, index) => (
              <div
                key={index}
                className="p-4 border border-border rounded-lg space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removerItem(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Descrição *</Label>
                    <Input
                      value={item.descricao}
                      onChange={(e) => atualizarItem(index, "descricao", e.target.value)}
                      placeholder="Descrição do item"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quantidade *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) => atualizarItem(index, "quantidade", parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Valor Unitário *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.valorUnitario}
                      onChange={(e) => atualizarItem(index, "valorUnitario", parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Valor Total</Label>
                    <Input
                      value={`R$ ${(item.quantidade * item.valorUnitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Input
                    value={item.observacoes || ""}
                    onChange={(e) => atualizarItem(index, "observacoes", e.target.value)}
                    placeholder="Observações do item"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold text-primary">
                R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Atualizando..." : "Atualizar Ordem"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
