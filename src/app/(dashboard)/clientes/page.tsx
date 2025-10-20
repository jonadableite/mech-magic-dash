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
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClientes } from "@/hooks/use-clientes";
import { Skeleton } from "@/components/ui/skeleton";
import { ClienteModal } from "@/components/clientes/cliente-modal";
import { ToastService } from "@/lib/toast";
import { useSWRConfig } from "swr";

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const { clientes, isLoading, error, mutate } = useClientes();
  const { mutate: globalMutate } = useSWRConfig();

  // Filtro otimizado com useMemo
  const filteredClientes = useMemo(() => {
    if (!searchTerm.trim()) return clientes;

    const term = searchTerm.toLowerCase();
    return clientes.filter((cliente) =>
      cliente.nome.toLowerCase().includes(term) ||
      cliente.email.toLowerCase().includes(term) ||
      cliente.telefone.includes(term)
    );
  }, [clientes, searchTerm]);

  const handleDeleteCliente = async (clienteId: string, clienteNome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente ${clienteNome}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/clientes/${clienteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir cliente");
      }

      await mutate();
      ToastService.success("Cliente excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      ToastService.error("Erro ao excluir cliente", "Tente novamente mais tarde.");
    }
  };

  const handleEditCliente = (cliente: any) => {
    setSelectedCliente(cliente);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCliente(null);
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
          <h3 className="text-lg font-semibold text-foreground">Erro ao carregar clientes</h3>
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
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Clientes</h2>
          </div>
          <p className="text-muted-foreground">
            Gerencie seus clientes e histórico de serviços
          </p>
          {!isLoading && (
            <Badge variant="secondary" className="mt-2">
              {filteredClientes.length} cliente{filteredClientes.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <Button
          className="gap-2 w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => setOpenModal(true)}
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <ClienteModal
        open={openModal}
        onOpenChange={handleCloseModal}
        cliente={selectedCliente}
      />

      {/* Search Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clientes List */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <ClientesSkeleton />
            ) : filteredClientes.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <Users className="h-16 w-16 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "Tente ajustar os termos de busca"
                      : "Comece cadastrando seu primeiro cliente"
                    }
                  </p>
                </div>
                {!searchTerm && (
                  <Button onClick={() => setOpenModal(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Cadastrar Primeiro Cliente
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredClientes.map((cliente, index) => (
                  <div
                    key={cliente.id}
                    className="group p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/5 transition-all duration-200 animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(cliente.nome)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Cliente Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                              {cliente.nome}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              Cadastrado em {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}
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
                              <DropdownMenuItem onClick={() => handleEditCliente(cliente)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Histórico
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteCliente(cliente.id, cliente.nome)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground truncate">{cliente.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">{cliente.telefone}</span>
                          </div>
                          {cliente.endereco && (
                            <div className="flex items-center gap-2 text-sm sm:col-span-2">
                              <MapPin className="h-4 w-4 text-accent flex-shrink-0" />
                              <span className="text-muted-foreground">{cliente.endereco}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Histórico
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Ordem
                          </Button>
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

function ClientesSkeleton() {
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
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full sm:col-span-2" />
              </div>

              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
