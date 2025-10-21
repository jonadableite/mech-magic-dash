"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Car, Wrench, Package, TrendingUp } from "lucide-react";
import { useProfileStats } from "@/hooks/use-profile";
import type { ProfileStats } from "@/types/profile.types";

interface ProfileStatsProps {
  className?: string;
}

export function ProfileStats({ className }: ProfileStatsProps) {
  const { stats, isLoading, error } = useProfileStats();

  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="relative overflow-hidden">
            <DottedGlowBackground
              gap={16}
              radius={1.5}
              color="hsl(var(--primary) / 0.3)"
              glowColor="hsl(var(--primary) / 0.8)"
              opacity={0.4}
            />
            <CardHeader className="pb-2 relative z-10">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </CardHeader>
            <CardContent className="relative z-10">
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Erro ao carregar estatísticas
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const statItems = [
    {
      title: "Clientes",
      value: stats.totalClientes,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Veículos",
      value: stats.totalVeiculos,
      icon: Car,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Ordens",
      value: stats.totalOrdens,
      icon: Wrench,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Produtos",
      value: stats.totalProdutos,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title} className="relative overflow-hidden">
            <CardHeader className="pb-2 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">{item.value}</span>
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Total
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
