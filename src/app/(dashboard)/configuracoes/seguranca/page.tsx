"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TwoFactorSetup } from "@/components/auth/two-factor-setup";
import { useAuth } from "@/contexts/auth-context";
import { Shield, CheckCircle, AlertCircle, Settings } from "lucide-react";

export default function SegurancaPage() {
  const { user } = useAuth();
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [show2FADisable, setShow2FADisable] = useState(false);

  const is2FAEnabled = user?.twoFactorEnabled || false;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Segurança</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações de segurança da sua conta
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Status de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Status de Segurança
            </CardTitle>
            <CardDescription>
              Visão geral das configurações de segurança da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Email verificado</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.email} • Verificado
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Ativo
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${is2FAEnabled
                    ? 'bg-green-100 dark:bg-green-900'
                    : 'bg-orange-100 dark:bg-orange-900'
                  }`}>
                  {is2FAEnabled ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Autenticação de dois fatores</p>
                  <p className="text-sm text-muted-foreground">
                    {is2FAEnabled
                      ? 'Proteção adicional ativada'
                      : 'Adicione uma camada extra de segurança'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={is2FAEnabled ? "secondary" : "outline"}
                  className={is2FAEnabled
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                  }
                >
                  {is2FAEnabled ? 'Ativo' : 'Inativo'}
                </Badge>
                {!is2FAEnabled && (
                  <Button
                    size="sm"
                    onClick={() => setShow2FASetup(true)}
                  >
                    Configurar
                  </Button>
                )}
                {is2FAEnabled && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShow2FADisable(true)}
                  >
                    Desabilitar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de 2FA */}
        {!is2FAEnabled && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurar 2FA
              </CardTitle>
              <CardDescription>
                A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Por que usar 2FA?</strong><br />
                  • Protege sua conta mesmo se sua senha for comprometida<br />
                  • Requer um código do seu dispositivo móvel para fazer login<br />
                  • Padrão de segurança recomendado pela indústria
                </AlertDescription>
              </Alert>

              <div className="mt-6">
                <Button onClick={() => setShow2FASetup(true)} className="w-full">
                  <Shield className="mr-2 h-4 w-4" />
                  Configurar Autenticação de Dois Fatores
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle>Dicas de Segurança</CardTitle>
            <CardDescription>
              Mantenha sua conta segura seguindo estas práticas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Senha forte</h4>
                <p className="text-sm text-muted-foreground">
                  Use uma combinação de letras, números e símbolos
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Não compartilhe credenciais</h4>
                <p className="text-sm text-muted-foreground">
                  Nunca compartilhe sua senha ou códigos 2FA
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Logout em dispositivos públicos</h4>
                <p className="text-sm text-muted-foreground">
                  Sempre faça logout em computadores compartilhados
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Monitore sua conta</h4>
                <p className="text-sm text-muted-foreground">
                  Verifique regularmente as atividades da sua conta
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modais */}
      {show2FASetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-md w-full">
            <TwoFactorSetup
              onComplete={() => {
                setShow2FASetup(false);
                // Atualizar o contexto de autenticação
                window.location.reload();
              }}
              onCancel={() => setShow2FASetup(false)}
            />
          </div>
        </div>
      )}

      {show2FADisable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Desabilitar 2FA</h3>
            <p className="text-muted-foreground mb-6">
              Tem certeza que deseja desabilitar a autenticação de dois fatores?
              Isso reduzirá a segurança da sua conta.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShow2FADisable(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  // Implementar desabilitação
                  setShow2FADisable(false);
                }}
              >
                Desabilitar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
