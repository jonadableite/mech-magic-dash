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
  Car,
  User,
  Calendar,
  MoreVertical,
  Filter,
  Edit,
  Trash2,
  Hash,
  Tag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useVeiculos } from "@/hooks/use-veiculos";
import { Skeleton } from "@/components/ui/skeleton";
import { VeiculoModal } from "@/components/veiculos/veiculo-modal";
import { ToastService } from "@/lib/toast";
import { useSWRConfig } from "swr";

export default function VeiculosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedVeiculo, setSelectedVeiculo] = useState<any>(null);

  const { veiculos, isLoading, error, mutate } = useVeiculos();

  // Filtro otimizado com useMemo
  const filteredVeiculos = useMemo(() => {
    if (!searchTerm.trim()) return veiculos;

    const term = searchTerm.toLowerCase();
    return veiculos.filter((veiculo) =>
      veiculo.marca.toLowerCase().includes(term) ||
      veiculo.modelo.toLowerCase().includes(term) ||
      veiculo.placa.toLowerCase().includes(term) ||
      veiculo.cliente.nome.toLowerCase().includes(term)
    );
  }, [veiculos, searchTerm]);

  const handleDeleteVeiculo = async (veiculoId: string, veiculoPlaca: string) => {
    if (!confirm(`Tem certeza que deseja excluir o veículo ${veiculoPlaca}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/veiculos/${veiculoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir veículo");
      }

      await mutate();
      ToastService.success("Veículo excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir veículo:", error);
      ToastService.error("Erro ao excluir veículo", "Tente novamente mais tarde.");
    }
  };

  const handleEditVeiculo = (veiculo: any) => {
    setSelectedVeiculo(veiculo);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedVeiculo(null);
  };

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Erro ao carregar veículos</h3>
          <p className="text-muted-foreground">Tente recarregar a página</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Recarregar Página
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Veículos</h2>
          </div>
          <p className="text-muted-foreground">
            Gerencie os veículos dos clientes
          </p>
          {!isLoading && (
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">
                {filteredVeiculos.length} veículo{filteredVeiculos.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </div>
        <Button
          className="gap-2 w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => setOpenModal(true)}
        >
          <Plus className="h-4 w-4" />
          Novo Veículo
        </Button>
      </div>

      <VeiculoModal
        open={openModal}
        onOpenChange={handleCloseModal}
        veiculo={selectedVeiculo}
      />

      {/* Filtros */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar veículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Veículos */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Veículos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <VeiculosSkeleton />
            ) : filteredVeiculos.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <Car className="h-16 w-16 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {searchTerm
                      ? "Nenhum veículo encontrado"
                      : "Nenhum veículo cadastrado"
                    }
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "Tente ajustar os filtros de busca"
                      : "Comece cadastrando seu primeiro veículo"
                    }
                  </p>
                </div>
                {!searchTerm && (
                  <Button onClick={() => setOpenModal(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Cadastrar Primeiro Veículo
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredVeiculos.map((veiculo, index) => (
                  <div
                    key={veiculo.id}
                    className="group p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/5 transition-all duration-200 animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(veiculo.marca)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Veículo Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                              {veiculo.marca} {veiculo.modelo} {veiculo.ano}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                {veiculo.placa}
                              </div>
                              {veiculo.cor && (
                                <div className="flex items-center gap-1">
                                  <Tag className="h-3 w-3" />
                                  {veiculo.cor}
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
                              <DropdownMenuItem onClick={() => handleEditVeiculo(veiculo)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteVeiculo(veiculo.id, veiculo.placa)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Cliente Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-primary" />
                            <span className="font-medium text-foreground">Cliente:</span>
                            <span className="text-muted-foreground">{veiculo.cliente.nome}</span>
                          </div>
                          {veiculo.observacoes && (
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">
                                <strong>Observações:</strong> {veiculo.observacoes}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditVeiculo(veiculo)}
                              className="gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Editar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VeiculosSkeleton() {
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
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}