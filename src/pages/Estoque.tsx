import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

const mockEstoque = [
  {
    id: 1,
    nome: "Óleo de Motor 5W30",
    categoria: "Lubrificantes",
    quantidade: 45,
    minimo: 20,
    preco: "R$ 35,00",
    fornecedor: "Petrobras",
    ultimaCompra: "15/03/2024",
  },
  {
    id: 2,
    nome: "Filtro de Ar",
    categoria: "Filtros",
    quantidade: 8,
    minimo: 15,
    preco: "R$ 45,00",
    fornecedor: "Mann Filter",
    ultimaCompra: "10/03/2024",
  },
  {
    id: 3,
    nome: "Pastilha de Freio",
    categoria: "Freios",
    quantidade: 3,
    minimo: 10,
    preco: "R$ 120,00",
    fornecedor: "Bosch",
    ultimaCompra: "08/03/2024",
  },
  {
    id: 4,
    nome: "Vela de Ignição",
    categoria: "Sistema Elétrico",
    quantidade: 52,
    minimo: 25,
    preco: "R$ 28,00",
    fornecedor: "NGK",
    ultimaCompra: "18/03/2024",
  },
  {
    id: 5,
    nome: "Correia Dentada",
    categoria: "Transmissão",
    quantidade: 18,
    minimo: 12,
    preco: "R$ 85,00",
    fornecedor: "Gates",
    ultimaCompra: "12/03/2024",
  },
];

export default function Estoque() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEstoque = mockEstoque.filter((item) =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (quantidade: number, minimo: number) => {
    if (quantidade < minimo) {
      return (
        <Badge className="bg-destructive/10 text-destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Estoque Baixo
        </Badge>
      );
    } else if (quantidade < minimo * 1.5) {
      return (
        <Badge className="bg-warning/10 text-warning">
          <TrendingDown className="h-3 w-3 mr-1" />
          Atenção
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-success/10 text-success">
          <TrendingUp className="h-3 w-3 mr-1" />
          Normal
        </Badge>
      );
    }
  };

  const estatisticas = {
    totalItens: mockEstoque.length,
    estoqueTotal: mockEstoque.reduce((acc, item) => acc + item.quantidade, 0),
    itensBaixos: mockEstoque.filter(item => item.quantidade < item.minimo).length,
    valorEstoque: "R$ 15.240,00",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Controle de Estoque</h2>
          <p className="text-muted-foreground">Gerencie peças e produtos</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Item
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in-up">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Itens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{estatisticas.totalItens}</div>
            <p className="text-xs text-muted-foreground mt-1">Produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unidades em Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{estatisticas.estoqueTotal}</div>
            <p className="text-xs text-muted-foreground mt-1">Quantidade total</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Itens com Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{estatisticas.itensBaixos}</div>
            <p className="text-xs text-muted-foreground mt-1">Requer atenção</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{estatisticas.valorEstoque}</div>
            <p className="text-xs text-muted-foreground mt-1">Valor em estoque</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEstoque.map((item, index) => (
              <div
                key={item.id}
                className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/5 transition-all animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.nome}</h3>
                      <p className="text-sm text-muted-foreground">{item.categoria}</p>
                    </div>
                  </div>
                  {getStatusBadge(item.quantidade, item.minimo)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Quantidade</p>
                    <p className="font-semibold text-foreground">
                      {item.quantidade} un. <span className="text-xs text-muted-foreground">/ {item.minimo} mín.</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Preço Unitário</p>
                    <p className="font-semibold text-foreground">{item.preco}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Fornecedor</p>
                    <p className="font-medium text-foreground">{item.fornecedor}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Última Compra</p>
                    <p className="font-medium text-foreground">{item.ultimaCompra}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.quantidade < item.minimo
                          ? "bg-destructive"
                          : item.quantidade < item.minimo * 1.5
                          ? "bg-warning"
                          : "bg-success"
                      }`}
                      style={{ width: `${Math.min((item.quantidade / (item.minimo * 2)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
