"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wrench, Package, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { useDashboard } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardPage() {
  const { user, isLoading: authLoading, isAuthenticated, isInitialized } = useAuth();
  const { dashboardData, isLoading, error } = useDashboard();

  // Debug: mostrar informações de autenticação (remover em produção)
  console.log("Dashboard - authLoading:", authLoading);
  console.log("Dashboard - isAuthenticated:", isAuthenticated);
  console.log("Dashboard - isInitialized:", isInitialized);
  console.log("Dashboard - user:", user);
  console.log("Dashboard - isLoading:", isLoading);
  console.log("Dashboard - error:", error);
  console.log("Dashboard - data:", dashboardData);

  // Se não está inicializado ou está carregando, mostrar loading
  if (!isInitialized || authLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center">
          <p>Carregando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, mostrar mensagem
  if (!isAuthenticated) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Usuário não autenticado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Erro ao carregar dados do dashboard</p>
            <p className="text-sm text-muted-foreground mt-2">
              Erro: {error?.message || "Erro desconhecido"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = dashboardData?.stats ? [
    {
      title: "Ordens Abertas",
      value: dashboardData.stats.ordensAbertas.toString(),
      change: `+${dashboardData.stats.variacaoOrdens}%`,
      icon: Wrench,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Clientes Ativos",
      value: dashboardData.stats.clientesAtivos.toString(),
      change: `+${dashboardData.stats.variacaoClientes}%`,
      icon: Users,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Itens em Estoque",
      value: dashboardData.stats.itensEstoque.toString(),
      change: `${dashboardData.stats.variacaoEstoque > 0 ? '+' : ''}${dashboardData.stats.variacaoEstoque}%`,
      icon: Package,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      title: "Faturamento Mensal",
      value: `R$ ${dashboardData.stats.faturamentoMensal.toLocaleString('pt-BR')}`,
      change: `+${dashboardData.stats.variacaoFaturamento}%`,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
    },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in" data-tour="dashboard">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-xl border border-primary/20">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-1">Dashboard</h2>
            <p className="text-muted-foreground">Visão geral da sua oficina automotiva</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            className="card-hover fade-in-up hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:border-primary/20"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-3 rounded-xl ${stat.bgColor} hover:scale-110 transition-transform duration-200`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <p className={`text-xs flex items-center gap-1 mt-1 ${stat.change.startsWith('+') ? 'text-success' : 'text-destructive'
                }`}>
                <TrendingUp className="h-3 w-3" />
                {stat.change} vs. mês anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 card-hover fade-in-up" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Ordens de Serviço Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.ordensRecentes?.map((order, index) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{order.numero}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${order.prioridade === 'ALTA' || order.prioridade === 'URGENTE' ? 'bg-destructive/10 text-destructive' :
                        order.prioridade === 'MEDIA' ? 'bg-warning/10 text-warning' :
                          'bg-muted text-muted-foreground'
                        }`}>
                        {order.prioridade}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{order.cliente}</p>
                    <p className="text-xs text-muted-foreground">{order.veiculo}</p>
                  </div>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover fade-in-up" style={{ animationDelay: "500ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.estoqueBaixo?.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-foreground">{item.nome}</span>
                    <span className="text-xs text-destructive font-semibold">
                      {item.quantidade} un.
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-destructive h-2 rounded-full transition-all"
                      style={{ width: `${(item.quantidade / item.quantidadeMinima) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mínimo: {item.quantidadeMinima} unidades
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
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
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}