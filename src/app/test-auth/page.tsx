"use client";

import { useAuth } from "@/hooks/use-auth";
import { UserDropdown } from "@/components/user/user-dropdown";
import { MobileUserDropdown } from "@/components/user/mobile-user-dropdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestAuthPage() {
  const { user, isLoading, isAuthenticated, refetch } = useAuth();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Autenticação</CardTitle>
          <CardDescription>
            Página para testar os componentes de dropdown do usuário
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Desktop User Dropdown */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Desktop User Dropdown</h3>
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Carregando...</div>
              ) : user ? (
                <UserDropdown user={user} />
              ) : (
                <div className="text-sm text-muted-foreground">Usuário não encontrado</div>
              )}
            </div>

            {/* Mobile User Dropdown */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Mobile User Dropdown</h3>
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Carregando...</div>
              ) : user ? (
                <MobileUserDropdown user={user} />
              ) : (
                <div className="text-sm text-muted-foreground">Usuário não encontrado</div>
              )}
            </div>
          </div>

          {/* Status da Sessão */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Status da Sessão</h3>
            <div className="text-sm space-y-1">
              <p><strong>Autenticado:</strong> {isAuthenticated ? "Sim" : "Não"}</p>
              <p><strong>Carregando:</strong> {isLoading ? "Sim" : "Não"}</p>
              {user && (
                <>
                  <p><strong>Nome:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Role:</strong> {user.role || "Não definido"}</p>
                </>
              )}
            </div>
            <Button onClick={refetch} variant="outline" size="sm">
              Recarregar Sessão
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
