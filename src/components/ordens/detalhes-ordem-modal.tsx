"use client";

import { Eye, User, Car, Calendar, DollarSign, Mail, Phone, Wrench, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrdemServico } from "@/hooks/use-ordens";

interface DetalhesOrdemModalProps {
  isOpen: boolean;
  onClose: () => void;
  ordem: OrdemServico | null;
}

export function DetalhesOrdemModal({ isOpen, onClose, ordem }: DetalhesOrdemModalProps) {
  if (!ordem) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FINALIZADA':
        return 'bg-success/10 text-success border-success/20';
      case 'EM_ANDAMENTO':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'AGUARDANDO_PECAS':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'CANCELADA':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'URGENTE':
      case 'ALTA':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'MEDIA':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'BAIXA':
        return 'bg-muted text-muted-foreground border-muted';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalhes da Ordem - {ordem.numero}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header com status e prioridade */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Wrench className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-2xl font-bold text-foreground">{ordem.numero}</h2>
                <p className="text-sm text-muted-foreground">
                  Criada em: {new Date(ordem.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={`px-3 py-1 ${getStatusColor(ordem.status)}`}>
                {ordem.status.replace('_', ' ')}
              </Badge>
              <Badge className={`px-3 py-1 ${getPrioridadeColor(ordem.prioridade)}`}>
                {ordem.prioridade}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold text-foreground">{ordem.cliente.nome}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {ordem.cliente.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {ordem.cliente.telefone}
                </div>
              </CardContent>
            </Card>

            {/* Informações do Veículo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Veículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold text-foreground">
                    {ordem.veiculo.marca} {ordem.veiculo.modelo} {ordem.veiculo.ano}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-mono bg-muted px-2 py-1 rounded">
                    {ordem.veiculo.placa}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Descrição */}
          <Card>
            <CardHeader>
              <CardTitle>Descrição do Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-wrap">{ordem.descricao}</p>
            </CardContent>
          </Card>

          {/* Observações */}
          {ordem.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{ordem.observacoes}</p>
              </CardContent>
            </Card>
          )}

          {/* Itens da Ordem */}
          {ordem.itens && ordem.itens.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Itens da Ordem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ordem.itens.map((item, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-foreground">{item.descricao}</h4>
                        <span className="font-bold text-primary">
                          R$ {item.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Quantidade:</span> {item.quantidade}
                        </div>
                        <div>
                          <span className="font-medium">Valor Unitário:</span> R$ {item.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      {item.observacoes && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium">Observações:</span> {item.observacoes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resumo Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Valor Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    R$ {ordem.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Data de Abertura:</span>
                    <br />
                    {new Date(ordem.dataAbertura).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  {ordem.dataFechamento && (
                    <div>
                      <span className="font-medium">Data de Fechamento:</span>
                      <br />
                      {new Date(ordem.dataFechamento).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
