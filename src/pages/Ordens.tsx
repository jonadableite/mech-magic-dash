import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Clock, CheckCircle, XCircle } from "lucide-react";

const mockOrdens = [
  {
    id: "#OS-1234",
    cliente: "João Silva",
    veiculo: "Honda Civic 2020",
    servico: "Troca de óleo e filtros",
    status: "em_andamento",
    prioridade: "alta",
    dataAbertura: "22/03/2024",
    valorEstimado: "R$ 450,00",
  },
  {
    id: "#OS-1235",
    cliente: "Maria Santos",
    veiculo: "Toyota Corolla 2019",
    servico: "Revisão completa + Alinhamento",
    status: "aguardando_pecas",
    prioridade: "media",
    dataAbertura: "21/03/2024",
    valorEstimado: "R$ 890,00",
  },
  {
    id: "#OS-1236",
    cliente: "Pedro Oliveira",
    veiculo: "Ford Focus 2021",
    servico: "Troca de pastilhas de freio",
    status: "finalizado",
    prioridade: "baixa",
    dataAbertura: "20/03/2024",
    valorEstimado: "R$ 320,00",
  },
  {
    id: "#OS-1237",
    cliente: "Ana Costa",
    veiculo: "Volkswagen Golf 2018",
    servico: "Diagnóstico elétrico",
    status: "em_andamento",
    prioridade: "alta",
    dataAbertura: "23/03/2024",
    valorEstimado: "R$ 280,00",
  },
];

const statusConfig = {
  em_andamento: { label: "Em Andamento", color: "bg-primary/10 text-primary", icon: Clock },
  aguardando_pecas: { label: "Aguardando Peças", color: "bg-warning/10 text-warning", icon: FileText },
  finalizado: { label: "Finalizado", color: "bg-success/10 text-success", icon: CheckCircle },
  cancelado: { label: "Cancelado", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

const prioridadeConfig = {
  alta: { label: "Alta", color: "bg-destructive/10 text-destructive" },
  media: { label: "Média", color: "bg-warning/10 text-warning" },
  baixa: { label: "Baixa", color: "bg-muted text-muted-foreground" },
};

export default function Ordens() {
  const [filterStatus, setFilterStatus] = useState("todos");

  const filteredOrdens = filterStatus === "todos"
    ? mockOrdens
    : mockOrdens.filter((ordem) => ordem.status === filterStatus);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Ordens de Serviço</h2>
          <p className="text-muted-foreground">Gerencie todas as ordens de serviço</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Ordem
        </Button>
      </div>

      <Tabs defaultValue="todos" onValueChange={setFilterStatus}>
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="todos">Todas</TabsTrigger>
          <TabsTrigger value="em_andamento">Em Andamento</TabsTrigger>
          <TabsTrigger value="aguardando_pecas">Aguardando</TabsTrigger>
          <TabsTrigger value="finalizado">Finalizadas</TabsTrigger>
          <TabsTrigger value="cancelado">Canceladas</TabsTrigger>
        </TabsList>

        <TabsContent value={filterStatus} className="space-y-4 mt-6">
          {filteredOrdens.map((ordem, index) => {
            const StatusIcon = statusConfig[ordem.status as keyof typeof statusConfig].icon;
            
            return (
              <Card
                key={ordem.id}
                className="hover:shadow-lg transition-all cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{ordem.id}</CardTitle>
                        <Badge className={prioridadeConfig[ordem.prioridade as keyof typeof prioridadeConfig].color}>
                          {prioridadeConfig[ordem.prioridade as keyof typeof prioridadeConfig].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <StatusIcon className="h-4 w-4" />
                        <span className={`font-medium ${statusConfig[ordem.status as keyof typeof statusConfig].color.split(' ')[1]}`}>
                          {statusConfig[ordem.status as keyof typeof statusConfig].label}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{ordem.valorEstimado}</p>
                      <p className="text-xs text-muted-foreground">Valor estimado</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Cliente</p>
                      <p className="font-medium text-foreground">{ordem.cliente}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Veículo</p>
                      <p className="font-medium text-foreground">{ordem.veiculo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Serviço</p>
                      <p className="font-medium text-foreground">{ordem.servico}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Data de Abertura</p>
                      <p className="font-medium text-foreground">{ordem.dataAbertura}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">Ver Detalhes</Button>
                    <Button size="sm">Atualizar Status</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredOrdens.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma ordem encontrada nesta categoria</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
