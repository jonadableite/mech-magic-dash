import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4 sticky top-0 z-10 backdrop-blur-sm bg-card/95">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold text-foreground">Sistema de Gestão - Oficina Mecânica</h1>
          </header>
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
