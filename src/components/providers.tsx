"use client";

import { ThemeProvider } from "next-themes";
import { SWRConfig } from "swr";
import { TooltipProvider } from "@/components/ui/tooltip";

// Função para fazer fetch com tratamento de erro
const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.') as any;
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        refreshInterval: 30000, // Refresh a cada 30 segundos
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 2000, // Deduplicar requests por 2 segundos
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        onError: (error: any) => {
          console.error('SWR Error:', error);
        },
      }}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </ThemeProvider>
    </SWRConfig>
  );
}
