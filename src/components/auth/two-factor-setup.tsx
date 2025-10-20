"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import QRCode from "qrcode";

interface TwoFactorSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const { enable2FA, verify2FA, disable2FA } = useAuth();
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (step === 'setup') {
      handleEnable2FA();
    }
  }, [step]);

  const handleEnable2FA = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await enable2FA();
      if (result) {
        setSecret(result.secret);

        // Gerar QR Code
        const qrCodeData = `otpauth://totp/${encodeURIComponent('Mech Magic')}:${encodeURIComponent('user@example.com')}?secret=${result.secret}&issuer=${encodeURIComponent('Mech Magic')}`;
        const qrCodeUrl = await QRCode.toDataURL(qrCodeData, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCode(qrCodeUrl);
      } else {
        setError('Erro ao configurar 2FA. Tente novamente.');
      }
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      setError('Erro ao configurar 2FA. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Código deve ter 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await verify2FA(verificationCode);
      if (success) {
        setStep('complete');
        onComplete?.();
      } else {
        setError('Código inválido. Tente novamente.');
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      setError('Erro ao verificar código. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Código deve ter 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await disable2FA(verificationCode);
      if (success) {
        onCancel?.();
      } else {
        setError('Código inválido. Tente novamente.');
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      setError('Erro ao desabilitar 2FA. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'setup') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Configurar Autenticação de Dois Fatores</CardTitle>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : qrCode ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Escaneie este código QR com seu aplicativo autenticador:
                </p>
                <div className="flex justify-center">
                  <img src={qrCode} alt="QR Code para 2FA" className="border rounded-lg" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secret">Ou digite esta chave manualmente:</Label>
                <Input
                  id="secret"
                  value={secret}
                  readOnly
                  className="font-mono text-sm"
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Salve esta chave em um local seguro.
                  Você precisará dela para recuperar o acesso se perder seu dispositivo.
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => setStep('verify')}
                className="w-full"
                disabled={isLoading}
              >
                Continuar
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Configurando 2FA...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  if (step === 'verify') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Verificar Código</CardTitle>
          <CardDescription>
            Digite o código de 6 dígitos do seu aplicativo autenticador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="verificationCode">Código de verificação</Label>
            <Input
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="text-center text-2xl font-mono tracking-widest"
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={handleVerify2FA}
            className="w-full"
            disabled={isLoading || verificationCode.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              'Verificar e Ativar 2FA'
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => setStep('setup')}
            className="w-full"
            disabled={isLoading}
          >
            Voltar
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  if (step === 'complete') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-green-600 dark:text-green-400">
            2FA Configurado com Sucesso!
          </CardTitle>
          <CardDescription>
            Sua conta agora está protegida com autenticação de dois fatores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              A partir de agora, você precisará do código do seu aplicativo
              autenticador para fazer login.
            </AlertDescription>
          </Alert>

          <Button
            onClick={onComplete}
            className="w-full"
          >
            Concluir
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
