"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, User, Bell, Shield, Database, Palette } from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Configurações</h2>
        <p className="text-muted-foreground">Configure seu sistema</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configurações de Perfil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Perfil do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Gerencie suas informações pessoais e preferências de conta.
              </p>
            </div>
            <Button variant="outline" className="w-full">
              Editar Perfil
            </Button>
          </CardContent>
        </Card>

        {/* Configurações de Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Configure como você deseja receber notificações do sistema.
              </p>
            </div>
            <Button variant="outline" className="w-full">
              Configurar Notificações
            </Button>
          </CardContent>
        </Card>

        {/* Configurações de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Gerencie senhas, autenticação e configurações de segurança.
              </p>
            </div>
            <Button variant="outline" className="w-full">
              Configurações de Segurança
            </Button>
          </CardContent>
        </Card>

        {/* Configurações de Aparência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Aparência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Personalize a aparência do sistema e tema.
              </p>
            </div>
            <Button variant="outline" className="w-full">
              Configurar Aparência
            </Button>
          </CardContent>
        </Card>

        {/* Configurações do Sistema */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Backup de Dados</h4>
                  <p className="text-sm text-muted-foreground">
                    Faça backup dos seus dados e configurações.
                  </p>
                </div>
                <Button variant="outline" className="w-full">
                  Fazer Backup
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Limpeza de Cache</h4>
                  <p className="text-sm text-muted-foreground">
                    Limpe o cache do sistema para melhorar a performance.
                  </p>
                </div>
                <Button variant="outline" className="w-full">
                  Limpar Cache
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-medium">Versão</h4>
                <p className="text-sm text-muted-foreground">v1.0.0</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Última Atualização</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Status</h4>
                <p className="text-sm text-success">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
