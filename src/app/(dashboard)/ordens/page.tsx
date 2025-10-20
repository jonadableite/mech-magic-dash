"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Wrench, User, Car, Calendar, DollarSign, Mail, Phone } from "lucide-react";
import { useOrdens } from "@/hooks/use-ordens";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrdensPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { ordens, isLoading, error } = useOrdens();

  const filteredOrdens = ordens.filter((ordem) =>
    ordem.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FINALIZADA':
        return 'bg-success/10 text-success';
      case 'EM_ANDAMENTO':
        return 'bg-primary/10 text-primary';
      case 'AGUARDANDO_PECAS':
        return 'bg-warning/10 text-warning';
      case 'CANCELADA':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'URGENTE':
      case 'ALTA':
        return 'bg-destructive/10 text-destructive';
      case 'MEDIA':
        return 'bg-warning/10 text-warning';
      case 'BAIXA':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Ordens de Serviço</h2>
            <p className="text-muted-foreground">Gerencie as ordens de serviço</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Erro ao carregar ordens</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Ordens de Serviço</h2>
          <p className="text-muted-foreground">Gerencie as ordens de serviço</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Nova Ordem
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, cliente ou placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <OrdensSkeleton />
            ) : filteredOrdens.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? "Nenhuma ordem encontrada" : "Nenhuma ordem cadastrada"}
                </p>
              </div>
            ) : (
              filteredOrdens.map((ordem, index) => (
                <div
                  key={ordem.id}
                  className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="space-y-4">
                    {/* Header com número e status */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-lg text-foreground">{ordem.numero}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPrioridadeColor(ordem.prioridade)}`}>
                          {ordem.prioridade}
                        </span>
                      </div>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(ordem.status)}`}>
                        {ordem.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Informações do cliente e veículo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium text-foreground">{ordem.cliente.nome}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {ordem.cliente.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {ordem.cliente.telefone}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Car className="h-4 w-4 text-accent" />
                          <span className="font-medium text-foreground">
                            {ordem.veiculo.marca} {ordem.veiculo.modelo} {ordem.veiculo.ano}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-mono">{ordem.veiculo.placa}</span>
                        </div>
                      </div>
                    </div>

                    {/* Descrição e valor */}
                    <div className="space-y-2">
                      <p className="text-sm text-foreground">{ordem.descricao}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Aberta em: {new Date(ordem.dataAbertura).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <DollarSign className="h-4 w-4" />
                          R$ {ordem.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm" className="flex-1">
                        Ver Detalhes
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Editar
                      </Button>
                      {ordem.status !== 'FINALIZADA' && ordem.status !== 'CANCELADA' && (
                        <Button variant="outline" size="sm" className="flex-1">
                          Finalizar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OrdensSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="p-4 rounded-lg border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
