"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  LayoutDashboard,
  Users,
  Wrench,
  Package,
  Calendar,
  Settings,
  Menu,
  Car,
  Home,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Visão geral do sistema",
  },
  {
    title: "Clientes",
    href: "/clientes",
    icon: Users,
    description: "Gerenciar clientes",
  },
  {
    title: "Veículos",
    href: "/veiculos",
    icon: Car,
    description: "Gerenciar veículos",
  },
  {
    title: "Agendamentos",
    href: "/agendamentos",
    icon: Calendar,
    description: "Agendar serviços",
  },
  {
    title: "Ordens",
    href: "/ordens",
    icon: Wrench,
    description: "Gerenciar ordens",
  },
  {
    title: "Estoque",
    href: "/estoque",
    icon: Package,
    description: "Controle de estoque",
  },
  {
    title: "Financeiro",
    href: "/financeiro",
    icon: DollarSign,
    description: "Controle financeiro",
  },
];

const quickActions = [
  {
    title: "Início",
    href: "/",
    icon: Home,
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

// Função para obter a página ativa baseada no pathname
const getActivePage = (pathname: string) => {
  const basePath = pathname.split('/')[1];
  return basePath || 'dashboard';
};

// Floating Dock para Mobile
export function MobileFloatingDock() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const activePage = getActivePage(pathname);

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 md:hidden">
      <div className="floating-dock glass-effect rounded-3xl shadow-2xl px-3 py-2">
        {/* Indicador da página ativa */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium shadow-lg">
            {navigationItems.find(item => item.href.includes(activePage))?.title || 'Dashboard'}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Botão do menu principal */}
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="dock-item h-14 w-14 rounded-2xl hover:bg-primary/10 group"
              >
                <div className="flex flex-col items-center gap-1">
                  <Menu className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="text-xs font-medium">Menu</span>
                </div>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh] border-0">
              <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-muted" />
              <DrawerHeader className="text-left px-6">
                <DrawerTitle className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                    <Car className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Mech Magic
                    </div>
                    <div className="text-sm text-muted-foreground">Sistema de Gestão Automotiva</div>
                  </div>
                </DrawerTitle>
              </DrawerHeader>
              <div className="px-6 pb-8 overflow-y-auto">
                <nav className="space-y-2">
                  {navigationItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-4 rounded-2xl px-4 py-4 text-sm font-medium transition-all duration-300 group",
                          isActive
                            ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg scale-[1.02]"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:scale-[1.01]"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                          isActive
                            ? "bg-primary-foreground/20"
                            : "bg-accent/50 group-hover:bg-accent"
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold">{item.title}</div>
                          <div className="text-xs opacity-70 truncate">{item.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Separador visual */}
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-border/50 to-transparent mx-2" />

          {/* Ações rápidas */}
          <div className="flex gap-1">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const isActive = pathname === action.href;

              return (
                <Link key={action.href} href={action.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "dock-item h-14 w-14 rounded-2xl group relative overflow-hidden",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shimmer-effect"
                        : "hover:bg-primary/10"
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-xs font-medium">{action.title}</span>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sidebar Desktop
export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:block">
      <NavigationMenu>
        <NavigationMenuList className="flex-col space-x-0 space-y-2 w-full">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <NavigationMenuItem key={item.href} className="w-full">
                <Link href={item.href} legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 w-full",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
