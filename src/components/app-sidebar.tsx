"use client";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Wrench, Package, Settings, Car, Calendar, DollarSign, CreditCard, User, GraduationCap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserDropdown } from "@/components/user/user-dropdown";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { TourButton } from "@/components/tour/tour-button";
import { Button } from "./ui/button";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clientes",
    url: "/clientes",
    icon: Users,
  },
  {
    title: "Veículos",
    url: "/veiculos",
    icon: Car,
  },
  {
    title: "Agendamentos",
    url: "/agendamentos",
    icon: Calendar,
  },
  {
    title: "Ordens de Serviço",
    url: "/ordens",
    icon: Wrench,
  },
  {
    title: "Estoque",
    url: "/estoque",
    icon: Package,
  },
  {
    title: "Financeiro",
    url: "/financeiro",
    icon: DollarSign,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar-background backdrop-blur-md" data-tour="sidebar">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <Car className="h-5 w-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-bold text-lg text-sidebar-foreground">Mech Magic</span>
            <span className="truncate text-xs text-sidebar-foreground/70">
              Oficina Automotiva
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarMenu className="space-y-2">
          {menuItems.map((item, index) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                className={`w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-target ${pathname === item.url
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm border border-sidebar-border'
                  : ''
                  }`}
                tooltip={item.title}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link
                  href={item.url as any}
                  className="flex items-center gap-3 w-full"
                  data-tour={item.url.replace('/', '')}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent/50 transition-colors duration-200 group-hover:bg-sidebar-accent">
                    <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 text-sidebar-foreground" />
                  </div>
                  <span className="font-medium text-sidebar-foreground">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="space-y-3">
          {/* Botão Tutorial Diferenciado */}
          {/* <div className="px-2">
            <TourButton variant="minimal" className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 hover:from-primary/20 hover:to-primary/10 hover:border-primary/30 transition-all duration-300" />
          </div> */}

          {/* User Dropdown */}
          {isLoading ? (
            <div className="flex items-center space-x-3 p-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ) : user ? (
            <UserDropdown user={user} className="w-full" />
          ) : (
            <div className="text-center text-xs text-sidebar-foreground/70">
              <p>Usuário não encontrado</p>
            </div>
          )}

          {/* Version Info */}
          <div className="text-xs text-sidebar-foreground/70 text-center pt-2 border-t border-sidebar-border/50">
            <p className="font-medium">Versão 1.0.0</p>
            <p>© 2025 Mech Magic</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
