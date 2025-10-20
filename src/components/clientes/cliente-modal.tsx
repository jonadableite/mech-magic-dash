"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSWRConfig } from "swr";
import { createClienteSchema, updateClienteSchema, type CreateClienteData, type UpdateClienteData } from "@/lib/schemas";
import { ToastService } from "@/lib/toast";
import { Loader2, User, Mail, Phone, MapPin } from "lucide-react";

interface ClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    endereco?: string;
  };
}

export function ClienteModal({ open, onOpenChange, cliente }: ClienteModalProps) {
  const { mutate } = useSWRConfig();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!cliente;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<CreateClienteData>({
    resolver: zodResolver(isEditing ? updateClienteSchema : createClienteSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      endereco: "",
    },
  });

  // Reset form quando modal abre/fecha
  useEffect(() => {
    if (open) {
      if (cliente) {
        reset({
          nome: cliente.nome || "",
          email: cliente.email || "",
          telefone: cliente.telefone || "",
          endereco: cliente.endereco || "",
        });
      } else {
        reset({
          nome: "",
          email: "",
          telefone: "",
          endereco: "",
        });
      }
    }
  }, [open, cliente, reset]);

  const onSubmit = async (data: CreateClienteData) => {
    setIsLoading(true);
    try {
      const url = isEditing ? `/api/clientes/${cliente.id}` : "/api/clientes";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} cliente`);
      }

      // Atualiza a lista SWR
      await mutate("/clientes");

      // Notificação de sucesso
      ToastService.success(
        `Cliente ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`,
        `O cliente ${data.nome} foi ${isEditing ? 'atualizado' : 'adicionado'} ao sistema.`
      );

      // Fecha modal e reseta form
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} cliente:`, error);
      ToastService.error(
        `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} cliente`,
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
      <DialogContent className="max-w-lg w-[95%] mx-auto rounded-2xl p-6 space-y-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            {isEditing ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <p className="text-muted-foreground">
            {isEditing
              ? "Atualize as informações do cliente"
              : "Preencha os dados para cadastrar um novo cliente"
            }
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Nome Completo *
            </Label>
            <Input
              id="nome"
              {...register("nome")}
              placeholder="Digite o nome completo"
              className={`transition-all duration-200 ${errors.nome ? "border-red-500 focus:border-red-500" : ""
                }`}
              disabled={isLoading}
            />
            {errors.nome && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                {errors.nome.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="exemplo@email.com"
              className={`transition-all duration-200 ${errors.email ? "border-red-500 focus:border-red-500" : ""
                }`}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="telefone" className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Telefone *
            </Label>
            <Input
              id="telefone"
              {...register("telefone")}
              placeholder="(11) 99999-9999"
              className={`transition-all duration-200 ${errors.telefone ? "border-red-500 focus:border-red-500" : ""
                }`}
              disabled={isLoading}
            />
            {errors.telefone && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                {errors.telefone.message}
              </p>
            )}
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label htmlFor="endereco" className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço
            </Label>
            <Textarea
              id="endereco"
              {...register("endereco")}
              placeholder="Rua, número, bairro, cidade - Estado"
              rows={3}
              className={`transition-all duration-200 resize-none ${errors.endereco ? "border-red-500 focus:border-red-500" : ""
                }`}
              disabled={isLoading}
            />
            {errors.endereco && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                {errors.endereco.message}
              </p>
            )}
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
              disabled={isLoading || !isDirty}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  {isEditing ? "Atualizar Cliente" : "Cadastrar Cliente"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
