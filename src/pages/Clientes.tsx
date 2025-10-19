import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Mail, Phone, Car } from "lucide-react";

const mockClientes = [
  {
    id: 1,
    nome: "João Silva",
    email: "joao.silva@email.com",
    telefone: "(11) 98765-4321",
    veiculo: "Honda Civic 2020",
    ultimaVisita: "15/03/2024",
  },
  {
    id: 2,
    nome: "Maria Santos",
    email: "maria.santos@email.com",
    telefone: "(11) 97654-3210",
    veiculo: "Toyota Corolla 2019",
    ultimaVisita: "20/03/2024",
  },
  {
    id: 3,
    nome: "Pedro Oliveira",
    email: "pedro.oliveira@email.com",
    telefone: "(11) 96543-2109",
    veiculo: "Ford Focus 2021",
    ultimaVisita: "18/03/2024",
  },
  {
    id: 4,
    nome: "Ana Costa",
    email: "ana.costa@email.com",
    telefone: "(11) 95432-1098",
    veiculo: "Volkswagen Golf 2018",
    ultimaVisita: "22/03/2024",
  },
];

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClientes = mockClientes.filter((cliente) =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Clientes</h2>
          <p className="text-muted-foreground">Gerencie seus clientes e histórico</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClientes.map((cliente, index) => (
              <div
                key={cliente.id}
                className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-lg text-foreground">{cliente.nome}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 text-primary" />
                        {cliente.email}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 text-primary" />
                        {cliente.telefone}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Car className="h-4 w-4 text-accent" />
                        {cliente.veiculo}
                      </div>
                      <div className="text-muted-foreground">
                        Última visita: <span className="font-medium text-foreground">{cliente.ultimaVisita}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Histórico
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
