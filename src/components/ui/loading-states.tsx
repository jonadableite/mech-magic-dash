import { Loader2, RefreshCw, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingState({ message = "Carregando...", size = "md" }: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  showRetry?: boolean;
}

export function ErrorState({
  title = "Algo deu errado",
  message = "Ocorreu um erro inesperado. Tente novamente.",
  onRetry,
  retryLabel = "Tentar novamente",
  showRetry = true
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      </div>
      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title = "Nenhum item encontrado",
  message = "Não há dados para exibir no momento.",
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      {icon}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      </div>
      {action}
    </div>
  );
}

interface NetworkStatusProps {
  isOnline: boolean;
  isReconnecting?: boolean;
}

export function NetworkStatus({ isOnline, isReconnecting }: NetworkStatusProps) {
  if (isOnline && !isReconnecting) return null;

  return (
    <Alert className="fixed top-4 right-4 z-50 w-auto">
      <div className="flex items-center gap-2">
        {isReconnecting ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertDescription>Reconectando...</AlertDescription>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <AlertDescription>Sem conexão com a internet</AlertDescription>
          </>
        )}
      </div>
    </Alert>
  );
}

interface RetryButtonProps {
  onRetry: () => void;
  isLoading?: boolean;
  children?: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function RetryButton({
  onRetry,
  isLoading = false,
  children = "Tentar novamente",
  variant = "outline",
  size = "default"
}: RetryButtonProps) {
  return (
    <Button
      onClick={onRetry}
      disabled={isLoading}
      variant={variant}
      size={size}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      {children}
    </Button>
  );
}

interface InlineLoadingProps {
  size?: "sm" | "md";
  className?: string;
}

export function InlineLoading({ size = "sm", className = "" }: InlineLoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5"
  };

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-primary ${className}`} />
  );
}
