"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { useProdutos, useProdutosEstoqueBaixo } from "@/hooks/use-produtos";
import { Skeleton } from "@/components/ui/skeleton";

export default function EstoquePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { produtos, isLoading, error } = useProdutos();
  const { produtosEstoqueBaixo, isLoading: isLoadingEstoqueBaixo } = useProdutosEstoqueBaixo();

  const filteredProdutos = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (produto.categoria && produto.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getEstoqueStatus = (quantidade: number, quantidadeMinima: number) => {
    if (quantidade === 0) return { status: 'Sem estoque', color: 'text-destructive' };
    if (quantidade <= quantidadeMinima) return { status: 'Estoque baixo', color: 'text-destructive' };
    if (quantidade <= quantidadeMinima * 2) return { status: 'Estoque médio', color: 'text-warning' };
    return { status: 'Estoque ok', color: 'text-success' };
  };

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Estoque</h2>
            <p className="text-muted-foreground">Gerencie seu estoque de peças</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Erro ao carregar produtos</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Estoque</h2>
          <p className="text-muted-foreground">Gerencie seu estoque de peças</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Alertas de estoque baixo */}
      {produtosEstoqueBaixo.length > 0 && (
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

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, código ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <ProdutosSkeleton />
            ) : filteredProdutos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
                </p>
              </div>
            ) : (
              filteredProdutos.map((produto, index) => {
                const estoqueStatus = getEstoqueStatus(produto.quantidade, produto.quantidadeMinima);
                return (
                  <div
                    key={produto.id}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-lg text-foreground">{produto.nome}</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                          <div className="text-muted-foreground">
                            <span className="font-medium">Código:</span> {produto.codigo}
                          </div>
                          {produto.categoria && (
                            <div className="text-muted-foreground">
                              <span className="font-medium">Categoria:</span> {produto.categoria}
                            </div>
                          )}
                          {produto.fornecedor && (
                            <div className="text-muted-foreground">
                              <span className="font-medium">Fornecedor:</span> {produto.fornecedor}
                            </div>
                          )}
                          <div className="text-muted-foreground">
                            <span className="font-medium">Preço:</span> R$ {produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>

                        {produto.descricao && (
                          <p className="text-sm text-muted-foreground">{produto.descricao}</p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">{produto.quantidade}</div>
                          <div className="text-sm text-muted-foreground">unidades</div>
                          <div className={`text-xs font-medium ${estoqueStatus.color}`}>
                            {estoqueStatus.status}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                          <Button variant="outline" size="sm">
                            Ajustar Estoque
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Barra de progresso do estoque */}
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Estoque atual: {produto.quantidade}</span>
                        <span>Mínimo: {produto.quantidadeMinima}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${produto.quantidade === 0 ? 'bg-destructive' :
                            produto.quantidade <= produto.quantidadeMinima ? 'bg-destructive' :
                              produto.quantidade <= produto.quantidadeMinima * 2 ? 'bg-warning' :
                                'bg-success'
                            }`}
                          style={{
                            width: `${Math.min((produto.quantidade / (produto.quantidadeMinima * 3)) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
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
        <div key={index} className="p-4 rounded-lg border">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-center">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
