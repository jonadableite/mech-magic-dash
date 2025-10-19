import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wrench, Package, TrendingUp, DollarSign, AlertCircle } from "lucide-react";

const stats = [
  {
    title: "Ordens Abertas",
    value: "24",
    change: "+12%",
    icon: Wrench,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Clientes Ativos",
    value: "156",
    change: "+8%",
    icon: Users,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    title: "Itens em Estoque",
    value: "842",
    change: "-3%",
    icon: Package,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    title: "Faturamento Mensal",
    value: "R$ 45.230",
    change: "+18%",
    icon: DollarSign,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
];

const recentOrders = [
  { id: "#OS-1234", client: "João Silva", vehicle: "Honda Civic 2020", status: "Em Andamento", priority: "Alta" },
  { id: "#OS-1235", client: "Maria Santos", vehicle: "Toyota Corolla 2019", status: "Aguardando Peças", priority: "Média" },
  { id: "#OS-1236", client: "Pedro Oliveira", vehicle: "Ford Focus 2021", status: "Finalizado", priority: "Baixa" },
  { id: "#OS-1237", client: "Ana Costa", vehicle: "Volkswagen Golf 2018", status: "Em Andamento", priority: "Alta" },
];

const lowStock = [
  { name: "Óleo de Motor 5W30", quantity: 5, min: 20 },
  { name: "Filtro de Ar", quantity: 8, min: 15 },
  { name: "Pastilha de Freio", quantity: 3, min: 10 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            className="overflow-hidden transition-all hover:shadow-lg hover:scale-105 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className={`text-xs flex items-center gap-1 mt-1 ${
                stat.change.startsWith('+') ? 'text-success' : 'text-destructive'
              }`}>
                <TrendingUp className="h-3 w-3" />
                {stat.change} vs. mês anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Ordens de Serviço Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{order.id}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.priority === 'Alta' ? 'bg-destructive/10 text-destructive' :
                        order.priority === 'Média' ? 'bg-warning/10 text-warning' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {order.priority}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{order.client}</p>
                    <p className="text-xs text-muted-foreground">{order.vehicle}</p>
                  </div>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    order.status === 'Finalizado' ? 'bg-success/10 text-success' :
                    order.status === 'Em Andamento' ? 'bg-primary/10 text-primary' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStock.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    <span className="text-xs text-destructive font-semibold">
                      {item.quantity} un.
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-destructive h-2 rounded-full transition-all"
                      style={{ width: `${(item.quantity / item.min) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mínimo: {item.min} unidades
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
