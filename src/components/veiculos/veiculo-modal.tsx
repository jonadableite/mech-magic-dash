"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car, User, Calendar, Hash, Tag, X } from "lucide-react";
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
import { createVeiculoSchema, updateVeiculoSchema, CreateVeiculoData, UpdateVeiculoData } from "@/lib/schemas";
import { useClientes } from "@/hooks/use-clientes";
import { useCreateVeiculo, useUpdateVeiculo } from "@/hooks/use-veiculos";
import { ToastService } from "@/lib/toast";
import { useSWRConfig } from "swr";
import { Loader2 } from "lucide-react";

interface VeiculoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  veiculo?: any;
}

export function VeiculoModal({ open, onOpenChange, veiculo }: VeiculoModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: globalMutate } = useSWRConfig();
  const { clientes } = useClientes();
  const { createVeiculo } = useCreateVeiculo();
  const { updateVeiculo } = useUpdateVeiculo();

  const isEditing = !!veiculo;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateVeiculoData>({
    resolver: zodResolver(isEditing ? updateVeiculoSchema : createVeiculoSchema),
    defaultValues: {
      marca: "",
      modelo: "",
      ano: new Date().getFullYear(),
      placa: "",
      cor: "",
      observacoes: "",
      clienteId: "",
    },
  });

  // Reset form quando modal abre/fecha ou veículo muda
  useEffect(() => {
    if (open) {
      if (veiculo) {
        setValue("marca", veiculo.marca || "");
        setValue("modelo", veiculo.modelo || "");
        setValue("ano", veiculo.ano || new Date().getFullYear());
        setValue("placa", veiculo.placa || "");
        setValue("cor", veiculo.cor || "");
        setValue("observacoes", veiculo.observacoes || "");
        setValue("clienteId", veiculo.clienteId || "");
      } else {
        reset();
      }
    }
  }, [open, veiculo, setValue, reset]);

  const onSubmit = async (data: CreateVeiculoData) => {
    setIsLoading(true);
    try {
      if (isEditing) {
        await updateVeiculo({ id: veiculo.id, data: data as UpdateVeiculoData });
        ToastService.success(
          "Veículo atualizado com sucesso!",
          "As informações do veículo foram atualizadas."
        );
      } else {
        await createVeiculo(data);
        ToastService.success(
          "Veículo criado com sucesso!",
          "O veículo foi adicionado ao sistema."
        );
      }

      await globalMutate("/veiculos");
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} veículo:`, error);
      ToastService.error(
        `Erro ao ${isEditing ? 'atualizar' : 'criar'} veículo`,
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
            <Car className="h-5 w-5 text-primary" />
            {isEditing ? "Editar Veículo" : "Novo Veículo"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Marca */}
            <div className="space-y-2">
              <Label htmlFor="marca" className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                Marca *
              </Label>
              <Input
                id="marca"
                placeholder="Ex: Toyota, Honda, Ford..."
                {...register("marca")}
                className={errors.marca ? "border-destructive" : ""}
              />
              {errors.marca && (
                <p className="text-sm text-destructive">{errors.marca.message}</p>
              )}
            </div>

            {/* Modelo */}
            <div className="space-y-2">
              <Label htmlFor="modelo" className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                Modelo *
              </Label>
              <Input
                id="modelo"
                placeholder="Ex: Corolla, Civic, Focus..."
                {...register("modelo")}
                className={errors.modelo ? "border-destructive" : ""}
              />
              {errors.modelo && (
                <p className="text-sm text-destructive">{errors.modelo.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ano */}
            <div className="space-y-2">
              <Label htmlFor="ano" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Ano *
              </Label>
              <Input
                id="ano"
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                {...register("ano", { valueAsNumber: true })}
                className={errors.ano ? "border-destructive" : ""}
              />
              {errors.ano && (
                <p className="text-sm text-destructive">{errors.ano.message}</p>
              )}
            </div>

            {/* Placa */}
            <div className="space-y-2">
              <Label htmlFor="placa" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Placa *
              </Label>
              <Input
                id="placa"
                placeholder="Ex: ABC-1234"
                {...register("placa")}
                className={errors.placa ? "border-destructive" : ""}
                style={{ textTransform: "uppercase" }}
              />
              {errors.placa && (
                <p className="text-sm text-destructive">{errors.placa.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cor */}
            <div className="space-y-2">
              <Label htmlFor="cor" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Cor
              </Label>
              <Input
                id="cor"
                placeholder="Ex: Branco, Preto, Prata..."
                {...register("cor")}
                className={errors.cor ? "border-destructive" : ""}
              />
              {errors.cor && (
                <p className="text-sm text-destructive">{errors.cor.message}</p>
              )}
            </div>

            {/* Cliente */}
            <div className="space-y-2">
              <Label htmlFor="clienteId" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente *
              </Label>
              <Select
                value={watch("clienteId")}
                onValueChange={(value) => setValue("clienteId", value)}
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

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações adicionais sobre o veículo (opcional)..."
              {...register("observacoes")}
              className={errors.observacoes ? "border-destructive" : ""}
              rows={3}
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
                <Car className="h-4 w-4 mr-2" />
              )}
              {isLoading
                ? "Salvando..."
                : isEditing
                  ? "Atualizar Veículo"
                  : "Criar Veículo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}