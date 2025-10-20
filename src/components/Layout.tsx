"use client";

import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { SimpleThemeToggle } from "./simple-theme-toggle";
import { Button } from "@/components/ui/button";
import { PanelLeft, PanelRight } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

interface LayoutProps {
  children: ReactNode;
}

function HeaderContent() {
  const { toggleSidebar, state } = useSidebar();

  return (
    <header className="h-16 border-b border-border glass-effect flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50 backdrop-blur-md bg-card/95 shadow-sm">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-10 w-10 touch-target hover:bg-primary/10 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <div className="relative">
            {state === "collapsed" ? (
              <PanelRight className="h-5 w-5 transition-transform duration-200" />
            ) : (
              <PanelLeft className="h-5 w-5 transition-transform duration-200" />
            )}
          </div>
          <span className="sr-only">Alternar sidebar</span>
        </Button>

        <div className="flex flex-col slide-in-left">
          <h1 className="text-lg font-bold text-foreground hidden sm:block">
            Sistema de Gestão - Oficina Mecânica
          </h1>
          <h1 className="text-lg font-bold text-foreground sm:hidden">
            Mech Magic
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Gestão completa para oficinas automotivas
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 slide-in-right">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">Tema:</span>
          <SimpleThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-h-screen">
          <HeaderContent />
          <div className="flex-1 p-4 sm:p-6 container-mobile mobile-safe-area">
            <div className="fade-in-up">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}