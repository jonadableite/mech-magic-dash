"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Clock, User, Car, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAgendamentoSchema, updateAgendamentoSchema, CreateAgendamentoData, UpdateAgendamentoData } from "@/lib/schemas";
import { useClientes } from "@/hooks/use-clientes";
import { useVeiculos } from "@/hooks/use-veiculos";
import { useCreateAgendamento, useUpdateAgendamento } from "@/hooks/use-agendamentos";
import { ToastService } from "@/lib/toast";
import { useSWRConfig } from "swr";
import { Loader2 } from "lucide-react";

interface AgendamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamento?: any;
}

export function AgendamentoModal({ open, onOpenChange, agendamento }: AgendamentoModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState("");
  const [veiculosCliente, setVeiculosCliente] = useState<any[]>([]);

  const { mutate: globalMutate } = useSWRConfig();
  const { clientes } = useClientes();
  const { veiculos } = useVeiculos();
  const { createAgendamento } = useCreateAgendamento();
  const { updateAgendamento } = useUpdateAgendamento();

  const isEditing = !!agendamento;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateAgendamentoData>({
    resolver: zodResolver(isEditing ? updateAgendamentoSchema : createAgendamentoSchema),
    defaultValues: {
      dataHora: "",
      descricao: "",
      observacoes: "",
      clienteId: "",
      veiculoId: "",
    },
  });

  // Reset form quando modal abre/fecha ou agendamento muda
  useEffect(() => {
    if (open) {
      if (agendamento) {
        setValue("dataHora", agendamento.dataHora ? new Date(agendamento.dataHora).toISOString().slice(0, 16) : "");
        setValue("descricao", agendamento.descricao || "");
        setValue("observacoes", agendamento.observacoes || "");
        setValue("clienteId", agendamento.clienteId || "");
        setValue("veiculoId", agendamento.veiculoId || "");
        setSelectedClienteId(agendamento.clienteId || "");
      } else {
        reset();
        setSelectedClienteId("");
        setVeiculosCliente([]);
      }
    }
  }, [open, agendamento, setValue, reset]);

  // Carregar veículos quando cliente muda
  useEffect(() => {
    if (selectedClienteId) {
      const veiculosDoCliente = veiculos.filter(v => v.clienteId === selectedClienteId);
      setVeiculosCliente(veiculosDoCliente);

      // Se não há veículos, limpar seleção
      if (veiculosDoCliente.length === 0) {
        setValue("veiculoId", "");
      }
    } else {
      setVeiculosCliente([]);
      setValue("veiculoId", "");
    }
  }, [selectedClienteId, veiculos, setValue]);

  const onSubmit = async (data: CreateAgendamentoData) => {
    setIsLoading(true);
    try {
      if (isEditing) {
        await updateAgendamento({ id: agendamento.id, data: data as UpdateAgendamentoData });
        ToastService.success(
          "Agendamento atualizado com sucesso!",
          "As informações do agendamento foram atualizadas."
        );
      } else {
        await createAgendamento(data);
        ToastService.success(
          "Agendamento criado com sucesso!",
          "O agendamento foi adicionado ao sistema."
        );
      }

      await globalMutate("/agendamentos");
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} agendamento:`, error);
      ToastService.error(
        `Erro ao ${isEditing ? 'atualizar' : 'criar'} agendamento`,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {isEditing ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data e Hora */}
            <div className="space-y-2">
              <Label htmlFor="dataHora" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Data e Hora *
              </Label>
              <Input
                id="dataHora"
                type="datetime-local"
                {...register("dataHora")}
                className={errors.dataHora ? "border-destructive" : ""}
              />
              {errors.dataHora && (
                <p className="text-sm text-destructive">{errors.dataHora.message}</p>
              )}
            </div>

            {/* Cliente */}
            <div className="space-y-2">
              <Label htmlFor="clienteId" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente *
              </Label>
              <Select
                value={selectedClienteId}
                onValueChange={(value) => {
                  setSelectedClienteId(value);
                  setValue("clienteId", value);
                }}
              >
                <SelectTrigger className={errors.clienteId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clienteId && (
                <p className="text-sm text-destructive">{errors.clienteId.message}</p>
              )}
            </div>
          </div>

          {/* Veículo */}
          <div className="space-y-2">
            <Label htmlFor="veiculoId" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Veículo *
            </Label>
            <Select
              value={watch("veiculoId")}
              onValueChange={(value) => setValue("veiculoId", value)}
              disabled={!selectedClienteId || veiculosCliente.length === 0}
            >
              <SelectTrigger className={errors.veiculoId ? "border-destructive" : ""}>
                <SelectValue
                  placeholder={
                    !selectedClienteId
                      ? "Selecione um cliente primeiro"
                      : veiculosCliente.length === 0
                        ? "Cliente não possui veículos"
                        : "Selecione um veículo"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {veiculosCliente.map((veiculo) => (
                  <SelectItem key={veiculo.id} value={veiculo.id}>
                    {veiculo.marca} {veiculo.modelo} {veiculo.ano} - {veiculo.placa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.veiculoId && (
              <p className="text-sm text-destructive">{errors.veiculoId.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Descrição do Serviço *
            </Label>
            <Textarea
              id="descricao"
              placeholder="Descreva o serviço a ser realizado..."
              {...register("descricao")}
              className={errors.descricao ? "border-destructive" : ""}
              rows={3}
            />
            {errors.descricao && (
              <p className="text-sm text-destructive">{errors.descricao.message}</p>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações adicionais (opcional)..."
              {...register("observacoes")}
              className={errors.observacoes ? "border-destructive" : ""}
              rows={2}
            />
            {errors.observacoes && (
              <p className="text-sm text-destructive">{errors.observacoes.message}</p>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              {isLoading
                ? "Salvando..."
                : isEditing
                  ? "Atualizar Agendamento"
                  : "Criar Agendamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
