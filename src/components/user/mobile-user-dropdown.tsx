"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, Settings, CreditCard, HelpCircle, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface MobileUserDropdownProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string;
  };
  className?: string;
}

export function MobileUserDropdown({ user, className }: MobileUserDropdownProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await authApi.signout();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      router.push("/signin");
      setIsOpen(false);
    } catch (error) {
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

  const menuItems = [
    {
      icon: User,
      label: "Meu Perfil",
      onClick: () => {
        router.push("/perfil");
        setIsOpen(false);
      },
    },
    {
      icon: Settings,
      label: "Configurações",
      onClick: () => {
        router.push("/configuracoes");
        setIsOpen(false);
      },
    },
    {
      icon: CreditCard,
      label: "Assinatura",
      onClick: () => {
        router.push("/billing" as any);
        setIsOpen(false);
      },
    },
    {
      icon: HelpCircle,
      label: "Suporte",
      onClick: () => {
        router.push("/suporte");
        setIsOpen(false);
      },
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative h-10 w-10 rounded-full p-0 hover:bg-accent/50 transition-all duration-200 ${className}`}
        >
          <Avatar className="h-8 w-8 ring-2 ring-background ring-offset-2 ring-offset-background">
            <AvatarImage src={user.image || ""} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 ring-2 ring-background ring-offset-2 ring-offset-background">
                <AvatarImage src={user.image || ""} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-medium">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <SheetTitle className="text-left text-lg font-semibold">
                  {user.name}
                </SheetTitle>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
                <Badge
                  variant={getRoleBadgeVariant(user.role)}
                  className="text-xs px-2 py-1 h-6 w-fit"
                >
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
            </div>
          </SheetHeader>

          <Separator />

          {/* Menu Items */}
          <div className="flex-1 p-6 pt-4">
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="w-full justify-start h-12 px-4 hover:bg-accent/50 transition-all duration-200"
                  onClick={item.onClick}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span className="text-base">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Footer */}
          <div className="p-6 pt-4">
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-4 text-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
              onClick={handleSignOut}
              disabled={isLoading}
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span className="text-base">{isLoading ? "Saindo..." : "Sair"}</span>
            </Button>

            <div className="mt-4 text-center text-xs text-muted-foreground">
              <p className="font-medium">Versão 1.0.0</p>
              <p>© 2025 Mech Magic</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
