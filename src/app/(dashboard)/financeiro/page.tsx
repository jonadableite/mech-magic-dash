"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Eye,
  Settings,
  BarChart3,
  CreditCard,
  Receipt,
  Users,
  Edit,
  Trash2,
} from "lucide-react";
import { useCaixaAtivo, useCaixaStats, useAbrirCaixa, useFecharCaixa, useAddMovimentacao, useUpdateMovimentacao, useDeleteMovimentacao } from "@/hooks/use-caixa";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBRL } from "@/lib/currency";
import { ToastService } from "@/lib/toast";
import { CaixaModal } from "@/components/caixa/caixa-modal";
import { MovimentacaoModal } from "@/components/caixa/movimentacao-modal";
import { RelatoriosDashboard } from "@/components/relatorios/relatorios-dashboard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function FinanceiroPage() {
  const [activeTab, setActiveTab] = useState("caixa");
  const [isCaixaModalOpen, setIsCaixaModalOpen] = useState(false);
  const [isMovimentacaoModalOpen, setIsMovimentacaoModalOpen] = useState(false);
  const [editingMovimentacao, setEditingMovimentacao] = useState(null);

  const { caixaAtivo, isLoading: isLoadingCaixa, error: errorCaixa, mutate: mutateCaixaAtivo } = useCaixaAtivo();
  const { stats, isLoading: isLoadingStats, error: errorStats, mutate: mutateStats } = useCaixaStats(
    caixaAtivo?.id || ""
  );

  const { trigger: abrirCaixa, isMutating: isOpeningCaixa } = useAbrirCaixa();
  const { trigger: fecharCaixa, isMutating: isClosingCaixa } = useFecharCaixa(caixaAtivo?.id || "");
  const { trigger: addMovimentacao, isMutating: isAddingMovimentacao } = useAddMovimentacao(caixaAtivo?.id || "");
  const { trigger: updateMovimentacao, isMutating: isUpdatingMovimentacao } = useUpdateMovimentacao(caixaAtivo?.id || "", "");
  const { trigger: deleteMovimentacao, isMutating: isDeletingMovimentacao } = useDeleteMovimentacao(caixaAtivo?.id || "", "");

  const handleAbrirCaixa = () => {
    setIsCaixaModalOpen(true);
  };

  const handleFecharCaixa = () => {
    setIsCaixaModalOpen(true);
  };

  const handleNovaMovimentacao = () => {
    setEditingMovimentacao(null);
    setIsMovimentacaoModalOpen(true);
  };

  const handleEditMovimentacao = (movimentacao: any) => {
    setEditingMovimentacao(movimentacao);
    setIsMovimentacaoModalOpen(true);
  };

  const handleDeleteMovimentacao = async (movimentacaoId: string) => {
    if (confirm("Tem certeza que deseja excluir esta movimentação?")) {
      try {
        await deleteMovimentacao({ movimentacaoId });
        ToastService.success("Movimentação excluída com sucesso!");
        mutateStats();
        mutateCaixaAtivo();
      } catch (error) {
        ToastService.error("Erro ao excluir movimentação");
      }
    }
  };

  if (errorCaixa || errorStats) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Erro ao carregar dados financeiros</h3>
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
            <DollarSign className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Controle Financeiro</h2>
          </div>
          <p className="text-muted-foreground">
            Gerencie caixa, contas a pagar/receber e comissões
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setActiveTab("relatorios")}
          >
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </Button>
          <Button
            className="gap-2"
            onClick={caixaAtivo ? handleFecharCaixa : handleAbrirCaixa}
          >
            <Wallet className="h-4 w-4" />
            {caixaAtivo ? "Fechar Caixa" : "Abrir Caixa"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: "caixa", label: "Caixa", icon: Wallet },
          { id: "contas-pagar", label: "Contas a Pagar", icon: CreditCard },
          { id: "contas-receber", label: "Contas a Receber", icon: Receipt },
          { id: "comissoes", label: "Comissões", icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === "caixa" && (
        <div className="space-y-6">
          {/* Status do Caixa */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Status do Caixa
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingCaixa ? (
                <CaixaSkeleton />
              ) : caixaAtivo ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Aberto
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Aberto em {new Date(caixaAtivo.dataAbertura).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Responsável: {caixaAtivo.usuario.nome}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">
                        {formatBRL(Number(caixaAtivo.valorInicial))}
                      </p>
                      <p className="text-sm text-muted-foreground">Valor Inicial</p>
                    </div>
                  </div>

                  {caixaAtivo.observacoes && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Observações:</strong> {caixaAtivo.observacoes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={handleNovaMovimentacao} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Nova Movimentação
                    </Button>
                  </div>

                  {/* Lista de Movimentações Recentes */}
                  {caixaAtivo.movimentacoes && caixaAtivo.movimentacoes.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Movimentações Recentes
                      </h4>
                      <div className="space-y-2">
                        {caixaAtivo.movimentacoes.slice(0, 5).map((mov: any) => (
                          <div
                            key={mov.id}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {mov.tipo === "ENTRADA" ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                              <div>
                                <p className="text-sm font-medium">{mov.descricao}</p>
                                <p className="text-xs text-muted-foreground">
                                  {mov.categoria} • {new Date(mov.dataHora).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-sm font-medium",
                                mov.tipo === "ENTRADA" ? "text-green-600" : "text-red-600"
                              )}>
                                {mov.tipo === "ENTRADA" ? "+" : "-"}{formatBRL(mov.valor)}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditMovimentacao(mov)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteMovimentacao(mov.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <Wallet className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Nenhum caixa aberto
                    </h3>
                    <p className="text-muted-foreground">
                      Abra um caixa para começar a registrar movimentações
                    </p>
                  </div>
                  <Button onClick={handleAbrirCaixa} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Abrir Caixa
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estatísticas do Caixa */}
          {caixaAtivo && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {isLoadingStats ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="shadow-sm">
                    <CardContent className="p-6">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card className="shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Entradas</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatBRL(stats?.totalEntradas || 0)}
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Saídas</p>
                          <p className="text-2xl font-bold text-red-600">
                            {formatBRL(stats?.totalSaidas || 0)}
                          </p>
                        </div>
                        <TrendingDown className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Saldo Atual</p>
                          <p className="text-2xl font-bold text-primary">
                            {formatBRL(stats?.saldoAtual || 0)}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Movimentações Hoje</p>
                          <p className="text-2xl font-bold text-foreground">
                            {stats?.movimentacoesHoje || 0}
                          </p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Relatórios */}
      {activeTab === "relatorios" && <RelatoriosDashboard />}

      {/* Outras tabs - Placeholder */}
      {activeTab !== "caixa" && activeTab !== "relatorios" && (
        <Card className="shadow-sm">
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <Settings className="h-16 w-16 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {activeTab === "contas-pagar" && "Contas a Pagar"}
                  {activeTab === "contas-receber" && "Contas a Receber"}
                  {activeTab === "comissoes" && "Comissões"}
                </h3>
                <p className="text-muted-foreground">
                  Esta funcionalidade será implementada em breve
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modais */}
      <CaixaModal
        open={isCaixaModalOpen}
        onOpenChange={setIsCaixaModalOpen}
        caixa={caixaAtivo}
        isEditing={!!caixaAtivo}
      />

      <MovimentacaoModal
        open={isMovimentacaoModalOpen}
        onOpenChange={setIsMovimentacaoModalOpen}
        caixaId={caixaAtivo?.id || ""}
        movimentacao={editingMovimentacao}
        isEditing={!!editingMovimentacao}
      />
    </div>
  );
}

function CaixaSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}
