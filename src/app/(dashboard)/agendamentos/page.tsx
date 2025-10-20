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
  Calendar,
  Clock,
  User,
  Car,
  FileText,
  MoreVertical,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Edit,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAgendamentos, useUpdateStatusAgendamento, useDeleteAgendamento } from "@/hooks/use-agendamentos";
import { Skeleton } from "@/components/ui/skeleton";
import { AgendamentoModal } from "@/components/agendamentos/agendamento-modal";
import { ToastService } from "@/lib/toast";
import { useSWRConfig } from "swr";
import { formatBRL } from "@/lib/currency";

export default function AgendamentosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<any>(null);

  const { agendamentos, isLoading, error, mutate } = useAgendamentos({
    search: searchTerm || undefined,
    status: statusFilter && statusFilter !== "all" ? statusFilter : undefined,
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
  });

  const { updateStatus } = useUpdateStatusAgendamento();
  const { deleteAgendamento } = useDeleteAgendamento();
  const { mutate: globalMutate } = useSWRConfig();

  // Filtro otimizado com useMemo
  const filteredAgendamentos = useMemo(() => {
    return agendamentos;
  }, [agendamentos]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'AGENDADO':
        return {
          label: 'Agendado',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
          icon: Calendar
        };
      case 'CONFIRMADO':
        return {
          label: 'Confirmado',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          icon: CheckCircle
        };
      case 'EM_ANDAMENTO':
        return {
          label: 'Em Andamento',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
          icon: PlayCircle
        };
      case 'FINALIZADO':
        return {
          label: 'Finalizado',
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
          icon: CheckCircle
        };
      case 'CANCELADO':
        return {
          label: 'Cancelado',
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
          icon: XCircle
        };
      case 'FALTOU':
        return {
          label: 'Faltou',
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
          icon: AlertCircle
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
          icon: Calendar
        };
    }
  };

  const handleEditAgendamento = (agendamento: any) => {
    setSelectedAgendamento(agendamento);
    setOpenModal(true);
  };

  const handleUpdateStatus = async (agendamentoId: string, status: string) => {
    try {
      await updateStatus({ id: agendamentoId, status });
      await globalMutate("/agendamentos");
      ToastService.success("Status atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      ToastService.error("Erro ao atualizar status", "Tente novamente mais tarde.");
    }
  };

  const handleDeleteAgendamento = async (agendamentoId: string, clienteNome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o agendamento de ${clienteNome}?`)) {
      return;
    }

    try {
      await deleteAgendamento(agendamentoId);
      await globalMutate("/agendamentos");
      ToastService.success("Agendamento excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
      ToastService.error("Erro ao excluir agendamento", "Tente novamente mais tarde.");
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAgendamento(null);
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
          <h3 className="text-lg font-semibold text-foreground">Erro ao carregar agendamentos</h3>
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
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Agendamentos</h2>
          </div>
          <p className="text-muted-foreground">
            Gerencie os agendamentos de serviços
          </p>
          {!isLoading && (
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">
                {filteredAgendamentos.length} agendamento{filteredAgendamentos.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </div>
        <Button
          className="gap-2 w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => setOpenModal(true)}
        >
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <AgendamentoModal
        open={openModal}
        onOpenChange={handleCloseModal}
        agendamento={selectedAgendamento}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar agendamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="AGENDADO">Agendado</SelectItem>
                  <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                  <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                  <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                  <SelectItem value="FALTOU">Faltou</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Input
                type="date"
                placeholder="Data início"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="h-12"
              />
            </div>

            <div>
              <Input
                type="date"
                placeholder="Data fim"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="h-12"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Agendamentos */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <AgendamentosSkeleton />
            ) : filteredAgendamentos.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {searchTerm || statusFilter || dataInicio || dataFim
                      ? "Nenhum agendamento encontrado"
                      : "Nenhum agendamento cadastrado"
                    }
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter || dataInicio || dataFim
                      ? "Tente ajustar os filtros de busca"
                      : "Comece criando seu primeiro agendamento"
                    }
                  </p>
                </div>
                {!searchTerm && !statusFilter && !dataInicio && !dataFim && (
                  <Button onClick={() => setOpenModal(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Criar Primeiro Agendamento
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredAgendamentos.map((agendamento, index) => {
                  const statusInfo = getStatusInfo(agendamento.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={agendamento.id}
                      className="group p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/5 transition-all duration-200 animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(agendamento.cliente.nome)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Agendamento Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                                {agendamento.cliente.nome}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Car className="h-3 w-3" />
                                  {agendamento.veiculo.marca} {agendamento.veiculo.modelo} {agendamento.veiculo.ano}
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="font-mono">{agendamento.veiculo.placa}</span>
                                </div>
                              </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-2">
                              <StatusIcon className="h-4 w-4" />
                              <Badge className={statusInfo.color}>
                                {statusInfo.label}
                              </Badge>
                            </div>
                          </div>

                          {/* Data e Hora */}
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span className="text-muted-foreground">
                                {new Date(agendamento.dataHora).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="text-muted-foreground">
                                {new Date(agendamento.dataHora).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Descrição */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="font-medium text-foreground">Serviço:</span>
                            </div>
                            <p className="text-sm text-muted-foreground pl-6">
                              {agendamento.descricao}
                            </p>
                            {agendamento.observacoes && (
                              <p className="text-sm text-muted-foreground pl-6 italic">
                                Obs: {agendamento.observacoes}
                              </p>
                            )}
                          </div>

                          {/* Ações */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditAgendamento(agendamento)}
                                className="gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Editar
                              </Button>

                              {agendamento.status === 'AGENDADO' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(agendamento.id, 'CONFIRMADO')}
                                  className="gap-2"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Confirmar
                                </Button>
                              )}

                              {agendamento.status === 'CONFIRMADO' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(agendamento.id, 'EM_ANDAMENTO')}
                                  className="gap-2"
                                >
                                  <PlayCircle className="h-4 w-4" />
                                  Iniciar
                                </Button>
                              )}

                              {agendamento.status === 'EM_ANDAMENTO' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(agendamento.id, 'FINALIZADO')}
                                  className="gap-2"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Finalizar
                                </Button>
                              )}
                            </div>

                            {/* Menu de ações */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditAgendamento(agendamento)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                {agendamento.status !== 'FINALIZADO' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateStatus(agendamento.id, 'CANCELADO')}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Cancelar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteAgendamento(agendamento.id, agendamento.cliente.nome)}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
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

function AgendamentosSkeleton() {
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
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>

              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
