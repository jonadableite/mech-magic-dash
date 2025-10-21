"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Calculator,
  MoreVertical,
  Filter,
  BarChart3,
  DollarSign,
  Hash,
  Tag,
  Truck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useProdutos, useProdutosEstoqueBaixo, useEstoqueStats } from "@/hooks/use-produtos";
import { Skeleton } from "@/components/ui/skeleton";
import { ProdutoModal } from "@/components/produtos/produto-modal";
import { AjustarEstoqueModal } from "@/components/produtos/ajustar-estoque-modal";
import { ToastService } from "@/lib/toast";
import { useSWRConfig } from "swr";
import { formatBRL } from "@/lib/currency";

export default function EstoquePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [showEstoqueBaixo, setShowEstoqueBaixo] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openAjustarModal, setOpenAjustarModal] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<any>(null);

  const { produtos, isLoading, error, mutate } = useProdutos({
    categoria: categoriaFilter || undefined,
    estoqueBaixo: showEstoqueBaixo || undefined,
  });
  const { produtosEstoqueBaixo, isLoading: isLoadingEstoqueBaixo } = useProdutosEstoqueBaixo();
  const { stats, isLoading: isLoadingStats } = useEstoqueStats();
  const { mutate: globalMutate } = useSWRConfig();

  // Filtro otimizado com useMemo
  const filteredProdutos = useMemo(() => {
    if (!searchTerm.trim()) return produtos;

    const term = searchTerm.toLowerCase();
    return produtos.filter((produto) =>
      produto.nome.toLowerCase().includes(term) ||
      produto.codigo.toLowerCase().includes(term) ||
      (produto.categoria && produto.categoria.toLowerCase().includes(term)) ||
      (produto.fornecedor && produto.fornecedor.toLowerCase().includes(term))
    );
  }, [produtos, searchTerm]);

  const getEstoqueStatus = (quantidade: number, quantidadeMinima: number) => {
    if (quantidade === 0) return { status: 'Sem estoque', color: 'text-destructive', bgColor: 'bg-destructive' };
    if (quantidade <= quantidadeMinima) return { status: 'Estoque baixo', color: 'text-destructive', bgColor: 'bg-destructive' };
    if (quantidade <= quantidadeMinima * 2) return { status: 'Estoque médio', color: 'text-orange-600', bgColor: 'bg-orange-500' };
    return { status: 'Estoque ok', color: 'text-green-600', bgColor: 'bg-green-500' };
  };

  const handleDeleteProduto = async (produtoId: string, produtoNome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o produto ${produtoNome}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/produtos/${produtoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir produto");
      }

      await Promise.all([
        mutate(),
        globalMutate("/produtos/estoque/stats"),
        globalMutate("/produtos/estoque-baixo"),
      ]);

      ToastService.success("Produto excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      ToastService.error("Erro ao excluir produto", "Tente novamente mais tarde.");
    }
  };

  const handleEditProduto = (produto: any) => {
    setSelectedProduto(produto);
    setOpenModal(true);
  };

  const handleAjustarEstoque = (produto: any) => {
    setSelectedProduto(produto);
    setOpenAjustarModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedProduto(null);
  };

  const handleCloseAjustarModal = () => {
    setOpenAjustarModal(false);
    setSelectedProduto(null);
  };

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const categorias = stats?.categorias || [];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Erro ao carregar estoque</h3>
          <p className="text-muted-foreground">Tente recarregar a página</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Recarregar Página
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-tour="estoque">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Estoque</h2>
          </div>
          <p className="text-muted-foreground">
            Gerencie seu estoque de peças e materiais
          </p>
          {!isLoading && (
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">
                {filteredProdutos.length} produto{filteredProdutos.length !== 1 ? 's' : ''}
              </Badge>
              {stats && (
                <Badge variant="outline">
                  Valor total: {formatBRL(stats.totalValor)}
                </Badge>
              )}
            </div>
          )}
        </div>
        <Button
          className="gap-2 w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => setOpenModal(true)}
        >
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <ProdutoModal
        open={openModal}
        onOpenChange={handleCloseModal}
        produto={selectedProduto}
      />

      <AjustarEstoqueModal
        open={openAjustarModal}
        onOpenChange={handleCloseAjustarModal}
        produto={selectedProduto}
      />

      {/* Estatísticas do Estoque */}
      {stats && !isLoadingStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Produtos</p>
                <p className="text-2xl font-bold">{stats.totalProdutos}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">
                  {formatBRL(stats.totalValor)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold text-orange-600">{stats.produtosEstoqueBaixo}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sem Estoque</p>
                <p className="text-2xl font-bold text-red-600">{stats.produtosSemEstoque}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Alertas de estoque baixo */}
      {produtosEstoqueBaixo.length > 0 && !isLoadingEstoqueBaixo && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Estoque Baixo ({produtosEstoqueBaixo.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {produtosEstoqueBaixo.map((produto) => (
                <div key={produto.id} className="p-3 rounded-lg border border-destructive/20 bg-background">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{produto.nome}</p>
                      <p className="text-xs text-muted-foreground">{produto.codigo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-destructive">{produto.quantidade}</p>
                      <p className="text-xs text-muted-foreground">min: {produto.quantidadeMinima}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            <div>
              <select
                value={categoriaFilter}
                onChange={(e) => setCategoriaFilter(e.target.value)}
                className="w-full h-12 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">Todas as categorias</option>
                {categorias.map((cat) => (
                  <option key={cat.categoria} value={cat.categoria}>
                    {cat.categoria} ({cat.quantidade})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                variant={showEstoqueBaixo ? "default" : "outline"}
                onClick={() => setShowEstoqueBaixo(!showEstoqueBaixo)}
                className="flex-1 gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Estoque Baixo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Produtos em Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <ProdutosSkeleton />
            ) : filteredProdutos.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <Package className="h-16 w-16 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {searchTerm || categoriaFilter || showEstoqueBaixo
                      ? "Nenhum produto encontrado"
                      : "Nenhum produto cadastrado"
                    }
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || categoriaFilter || showEstoqueBaixo
                      ? "Tente ajustar os filtros de busca"
                      : "Comece cadastrando seu primeiro produto"
                    }
                  </p>
                </div>
                {!searchTerm && !categoriaFilter && !showEstoqueBaixo && (
                  <Button onClick={() => setOpenModal(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Cadastrar Primeiro Produto
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredProdutos.map((produto, index) => {
                  const estoqueStatus = getEstoqueStatus(produto.quantidade, produto.quantidadeMinima);
                  return (
                    <div
                      key={produto.id}
                      className="group p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/5 transition-all duration-200 animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(produto.nome)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Produto Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                                {produto.nome}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Hash className="h-3 w-3" />
                                  {produto.codigo}
                                </div>
                                {produto.categoria && (
                                  <div className="flex items-center gap-1">
                                    <Tag className="h-3 w-3" />
                                    {produto.categoria}
                                  </div>
                                )}
                                {produto.fornecedor && (
                                  <div className="flex items-center gap-1">
                                    <Truck className="h-3 w-3" />
                                    {produto.fornecedor}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions Menu */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditProduto(produto)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAjustarEstoque(produto)}>
                                  <Calculator className="h-4 w-4 mr-2" />
                                  Ajustar Estoque
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteProduto(produto.id, produto.nome)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Detalhes do Produto */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="text-muted-foreground">
                                Preço: <span className="font-medium text-foreground">
                                  {formatBRL(produto.preco)}
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Package className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="text-muted-foreground">
                                Mínimo: <span className="font-medium text-foreground">
                                  {produto.quantidadeMinima} unidades
                                </span>
                              </span>
                            </div>
                            {produto.descricao && (
                              <div className="sm:col-span-2">
                                <p className="text-sm text-muted-foreground">{produto.descricao}</p>
                              </div>
                            )}
                          </div>

                          {/* Status do Estoque */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-foreground">{produto.quantidade}</div>
                                <div className="text-sm text-muted-foreground">unidades</div>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${estoqueStatus.color} bg-opacity-10`}>
                                {estoqueStatus.status}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditProduto(produto)}
                                className="gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAjustarEstoque(produto)}
                                className="gap-2"
                              >
                                <Calculator className="h-4 w-4" />
                                Ajustar
                              </Button>
                            </div>
                          </div>

                          {/* Barra de progresso do estoque */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Estoque atual: {produto.quantidade}</span>
                              <span>Mínimo: {produto.quantidadeMinima}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${estoqueStatus.bgColor}`}
                                style={{
                                  width: `${Math.min((produto.quantidade / Math.max(produto.quantidadeMinima * 3, 1)) * 100, 100)}%`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProdutosSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="p-4 rounded-xl border">
          <div className="flex items-start gap-4">
            {/* Avatar Skeleton */}
            <Skeleton className="h-12 w-12 rounded-full" />

            {/* Content Skeleton */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full sm:col-span-2" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center space-y-1">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
