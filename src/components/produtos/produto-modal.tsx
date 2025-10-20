"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSWRConfig } from "swr";
import { createProdutoSchema, type CreateProdutoData } from "@/lib/schemas";
import { ToastService } from "@/lib/toast";
import { Loader2, Package, DollarSign, Hash, Tag, Truck, FileText } from "lucide-react";

interface ProdutoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto?: {
    id: string;
    nome: string;
    descricao?: string;
    codigo: string;
    preco: number;
    quantidade: number;
    quantidadeMinima: number;
    categoria?: string;
    fornecedor?: string;
  } | null;
}

const categoriasComuns = [
  "Motor",
  "Freios",
  "Suspensão",
  "Transmissão",
  "Elétrica",
  "Ar Condicionado",
  "Pneus e Rodas",
  "Filtros",
  "Óleos e Fluidos",
  "Ferramentas",
  "Acessórios",
  "Outros",
];

export function ProdutoModal({ open, onOpenChange, produto }: ProdutoModalProps) {
  const { mutate } = useSWRConfig();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!produto;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<CreateProdutoData>({
    resolver: zodResolver(createProdutoSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      codigo: "",
      preco: 0,
      quantidade: 0,
      quantidadeMinima: 0,
      categoria: "",
      fornecedor: "",
    },
  });

  // Reset form quando modal abre/fecha
  useEffect(() => {
    if (open) {
      if (produto) {
        reset({
          nome: produto.nome || "",
          descricao: produto.descricao || "",
          codigo: produto.codigo || "",
          preco: produto.preco || 0,
          quantidade: produto.quantidade || 0,
          quantidadeMinima: produto.quantidadeMinima || 0,
          categoria: produto.categoria || "",
          fornecedor: produto.fornecedor || "",
        });
      } else {
        reset({
          nome: "",
          descricao: "",
          codigo: "",
          preco: 0,
          quantidade: 0,
          quantidadeMinima: 0,
          categoria: "",
          fornecedor: "",
        });
      }
    }
  }, [open, produto, reset]);

  const onSubmit = async (data: CreateProdutoData) => {
    setIsLoading(true);
    try {
      const url = isEditing ? `/api/produtos/${produto.id}` : "/api/produtos";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} produto`);
      }

      // Atualiza as listas SWR
      await Promise.all([
        mutate("/produtos"),
        mutate("/produtos/estoque/stats"),
        mutate("/produtos/estoque-baixo"),
      ]);

      // Notificação de sucesso
      ToastService.success(
        `Produto ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`,
        `O produto ${data.nome} foi ${isEditing ? 'atualizado' : 'adicionado'} ao estoque.`
      );

      // Fecha modal e reseta form
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} produto:`, error);
      ToastService.error(
        `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} produto`,
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

  // Se o modal não está aberto, não renderiza nada
  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-[95%] mx-auto rounded-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            {isEditing ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
          <p className="text-muted-foreground">
            {isEditing
              ? "Atualize as informações do produto"
              : "Preencha os dados para cadastrar um novo produto no estoque"
            }
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nome" className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Nome do Produto *
              </Label>
              <Input
                id="nome"
                {...register("nome")}
                placeholder="Digite o nome do produto"
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

            {/* Código */}
            <div className="space-y-2">
              <Label htmlFor="codigo" className="text-sm font-medium flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Código *
              </Label>
              <Input
                id="codigo"
                {...register("codigo")}
                placeholder="Ex: MOT001"
                className={`transition-all duration-200 ${errors.codigo ? "border-red-500 focus:border-red-500" : ""
                  }`}
                disabled={isLoading}
              />
              {errors.codigo && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  {errors.codigo.message}
                </p>
              )}
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="categoria" className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Categoria
              </Label>
              <Select
                value={watch("categoria")}
                onValueChange={(value) => setValue("categoria", value)}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.categoria ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasComuns.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoria && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  {errors.categoria.message}
                </p>
              )}
            </div>

            {/* Preço */}
            <div className="space-y-2">
              <Label htmlFor="preco" className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Preço (R$) *
              </Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                min="0"
                {...register("preco", { valueAsNumber: true })}
                placeholder="0.00"
                className={`transition-all duration-200 ${errors.preco ? "border-red-500 focus:border-red-500" : ""
                  }`}
                disabled={isLoading}
              />
              {errors.preco && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  {errors.preco.message}
                </p>
              )}
            </div>

            {/* Quantidade */}
            <div className="space-y-2">
              <Label htmlFor="quantidade" className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Quantidade Atual *
              </Label>
              <Input
                id="quantidade"
                type="number"
                min="0"
                {...register("quantidade", { valueAsNumber: true })}
                placeholder="0"
                className={`transition-all duration-200 ${errors.quantidade ? "border-red-500 focus:border-red-500" : ""
                  }`}
                disabled={isLoading}
              />
              {errors.quantidade && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  {errors.quantidade.message}
                </p>
              )}
            </div>

            {/* Quantidade Mínima */}
            <div className="space-y-2">
              <Label htmlFor="quantidadeMinima" className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Quantidade Mínima *
              </Label>
              <Input
                id="quantidadeMinima"
                type="number"
                min="0"
                {...register("quantidadeMinima", { valueAsNumber: true })}
                placeholder="0"
                className={`transition-all duration-200 ${errors.quantidadeMinima ? "border-red-500 focus:border-red-500" : ""
                  }`}
                disabled={isLoading}
              />
              {errors.quantidadeMinima && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  {errors.quantidadeMinima.message}
                </p>
              )}
            </div>

            {/* Fornecedor */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fornecedor" className="text-sm font-medium flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Fornecedor
              </Label>
              <Input
                id="fornecedor"
                {...register("fornecedor")}
                placeholder="Nome do fornecedor"
                className={`transition-all duration-200 ${errors.fornecedor ? "border-red-500 focus:border-red-500" : ""
                  }`}
                disabled={isLoading}
              />
              {errors.fornecedor && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  {errors.fornecedor.message}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descricao" className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Descrição
              </Label>
              <Textarea
                id="descricao"
                {...register("descricao")}
                placeholder="Descrição detalhada do produto"
                rows={3}
                className={`transition-all duration-200 resize-none ${errors.descricao ? "border-red-500 focus:border-red-500" : ""
                  }`}
                disabled={isLoading}
              />
              {errors.descricao && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  {errors.descricao.message}
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
              disabled={isLoading || !isDirty}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" />
                  {isEditing ? "Atualizar Produto" : "Cadastrar Produto"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
