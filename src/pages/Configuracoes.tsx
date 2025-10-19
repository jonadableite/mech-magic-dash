import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Bell, Shield, Palette, Database } from "lucide-react";

export default function Configuracoes() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Configurações</h2>
        <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle>Informações da Oficina</CardTitle>
            </div>
            <CardDescription>Dados básicos do estabelecimento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Oficina</Label>
              <Input id="nome" defaultValue="AutoPro Mecânica" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" defaultValue="12.345.678/0001-90" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input id="endereco" defaultValue="Rua das Oficinas, 123" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" defaultValue="(11) 3456-7890" />
            </div>
            <Button>Salvar Alterações</Button>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notificações</CardTitle>
            </div>
            <CardDescription>Configure suas preferências de notificação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Novas Ordens de Serviço</Label>
                <p className="text-sm text-muted-foreground">Receba alertas de novas OS</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Estoque Baixo</Label>
                <p className="text-sm text-muted-foreground">Alertas de estoque abaixo do mínimo</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Ordens Concluídas</Label>
                <p className="text-sm text-muted-foreground">Notificação quando uma OS for finalizada</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Lembretes de Pagamento</Label>
                <p className="text-sm text-muted-foreground">Alertas de pagamentos pendentes</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Segurança</CardTitle>
            </div>
            <CardDescription>Configurações de acesso e segurança</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senha-atual">Senha Atual</Label>
              <Input id="senha-atual" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nova-senha">Nova Senha</Label>
              <Input id="nova-senha" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
              <Input id="confirmar-senha" type="password" placeholder="••••••••" />
            </div>
            <Button variant="outline">Alterar Senha</Button>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Aparência</CardTitle>
            </div>
            <CardDescription>Personalize a interface do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo Escuro</Label>
                <p className="text-sm text-muted-foreground">Ativar tema escuro</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Animações</Label>
                <p className="text-sm text-muted-foreground">Habilitar animações de interface</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compactar Sidebar</Label>
                <p className="text-sm text-muted-foreground">Usar sidebar compacta</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Backup e Dados</CardTitle>
            </div>
            <CardDescription>Gerencie backups e exportação de dados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">Último Backup</p>
                <p className="text-sm text-muted-foreground">23/03/2024 às 03:00</p>
              </div>
              <Button variant="outline">Fazer Backup Agora</Button>
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">Exportar Dados</p>
                <p className="text-sm text-muted-foreground">Baixar todos os dados em formato CSV</p>
              </div>
              <Button variant="outline">Exportar</Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Backup Automático</Label>
                <p className="text-sm text-muted-foreground">Realizar backup diário às 03:00</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
