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
import { Loader2, Wallet, X } from "lucide-react";
import { createCaixaSchema, updateCaixaSchema, CreateCaixaData, UpdateCaixaData } from "@/lib/schemas";
import { useCreateCaixa, useUpdateCaixa, useCaixaAtivo } from "@/hooks/use-caixa";
import { ToastService } from "@/lib/toast";

interface CaixaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caixa?: any; // Para edição
  isEditing?: boolean;
}

export function CaixaModal({ open, onOpenChange, caixa, isEditing = false }: CaixaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createCaixa, isCreating } = useCreateCaixa();
  const { updateCaixa, isUpdating } = useUpdateCaixa();
  const { caixaAtivo, mutate: mutateCaixaAtivo } = useCaixaAtivo();

  const form = useForm<CreateCaixaData | UpdateCaixaData>({
    resolver: zodResolver(isEditing ? updateCaixaSchema : createCaixaSchema),
    defaultValues: {
      valorInicial: 0,
      observacoes: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditing && caixa) {
        form.reset({
          valorInicial: caixa.valorInicial || 0,
          observacoes: caixa.observacoes || "",
        });
      } else {
        form.reset({
          valorInicial: 0,
          observacoes: "",
        });
      }
    }
  }, [open, isEditing, caixa, form]);

  const onSubmit = async (data: CreateCaixaData | UpdateCaixaData) => {
    try {
      setIsSubmitting(true);

      if (isEditing && caixa) {
        await updateCaixa({
          id: caixa.id,
          data: data as UpdateCaixaData,
        });
        ToastService.success("Caixa atualizado com sucesso!");
      } else {
        await createCaixa(data as CreateCaixaData);
        ToastService.success("Caixa aberto com sucesso!");
      }

      // Revalidar dados
      mutateCaixaAtivo();

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar caixa:", error);
      ToastService.error(
        error instanceof Error ? error.message : "Erro ao salvar caixa"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {isEditing ? "Fechar Caixa" : "Abrir Caixa"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Feche o caixa atual e registre o valor final"
              : "Abra um novo caixa com o valor inicial"
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="valorInicial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEditing ? "Valor Final" : "Valor Inicial"}
                  </FormLabel>
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
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre o caixa..."
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
                  <Wallet className="h-4 w-4" />
                )}
                {isEditing ? "Fechar Caixa" : "Abrir Caixa"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
