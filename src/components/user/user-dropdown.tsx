"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, Settings, CreditCard, HelpCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface UserDropdownProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string;
  };
  className?: string;
}

export function UserDropdown({ user, className }: UserDropdownProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      console.log("Iniciando logout...");
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "signout" }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso.",
        });
        router.push("/signin");
      } else {
        throw new Error(`Erro no logout: ${data.error || 'Status ' + response.status}`);
      }
    } catch (error) {
      console.error("Erro no logout:", error);
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao fazer logout. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "destructive";
      case "gerente":
        return "default";
      default:
        return "secondary";
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "Administrador";
      case "gerente":
        return "Gerente";
      default:
        return "Usuário";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`relative h-auto p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 ${className}`}
        >
          <div className="flex items-center space-x-3 w-full">
            <Avatar className="h-8 w-8 ring-2 ring-background ring-offset-2 ring-offset-background">
              <AvatarImage src={user.image || ""} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[120px]">
                {user.name}
              </span>
              <div className="flex items-center space-x-1">
                <Badge
                  variant={getRoleBadgeVariant(user.role)}
                  className="text-xs px-1.5 py-0.5 h-5"
                >
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 p-2 bg-background border border-border shadow-lg"
        align="end"
        side="top"
        sideOffset={8}
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-foreground">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer px-2 py-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            onClick={() => router.push("/perfil")}
          >
            <User className="mr-3 h-4 w-4" />
            <span>Meu Perfil</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer px-2 py-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            onClick={() => router.push("/configuracoes")}
          >
            <Settings className="mr-3 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>

          {/* <DropdownMenuItem
            className="cursor-pointer px-2 py-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            onClick={() => router.push("/assinaturas")}
          >
            <CreditCard className="mr-3 h-4 w-4" />
            <span>Assinatura</span>
          </DropdownMenuItem> */}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer px-2 py-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          onClick={() => router.push("/suporte")}
        >
          <HelpCircle className="mr-3 h-4 w-4" />
          <span>Suporte</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer px-2 py-2 text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={handleSignOut}
          disabled={isLoading}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span>{isLoading ? "Saindo..." : "Sair"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
