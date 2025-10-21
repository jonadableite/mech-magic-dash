"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Clock,
  Users,
  Package,
  GraduationCap,
  Star,
  CheckCircle,
  Smartphone,
  Monitor,
  Zap,
  Check,
  List,
  Loader2,
  RotateCcw
} from "lucide-react";
import { useTour } from "@/contexts/tour-context";
import { cn } from "@/lib/utils";

interface TourLauncherProps {
  className?: string;
  onClose?: () => void;
}

export function TourLauncher({ className, onClose }: TourLauncherProps) {
  const { getAvailableTours, getTourProgress, startTour } = useTour();
  const [selectedTour, setSelectedTour] = useState<string | null>(null);

  const tours = getAvailableTours();

  const getTourIcon = (category: string) => {
    switch (category) {
      case "onboarding":
        return <GraduationCap className="h-5 w-5" />;
      case "feature":
        return <Star className="h-5 w-5" />;
      case "advanced":
        return <Zap className="h-5 w-5" />;
      default:
        return <Play className="h-5 w-5" />;
    }
  };

  const getTourProgressData = (tourId: string) => {
    const progress = getTourProgress(tourId);
    if (!progress) return null;

    return {
      completed: progress.isCompleted,
      stepsCompleted: progress.completedSteps.length,
      totalSteps: tours.find(t => t.id === tourId)?.steps.length || 0,
    };
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Moderno */}
      <motion.div
        className="text-center space-y-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center space-x-4 mb-6">
          <motion.div
            className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <GraduationCap className="h-8 w-8 text-primary" />
          </motion.div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Tours Guiados da Plataforma
            </h2>
            <p className="text-sm text-muted-foreground">Aprenda passo a passo</p>
          </div>
        </div>
        <motion.p
          className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          🚀 Explore todas as funcionalidades da plataforma com nossos tours interativos.
          Perfeito para <strong>iniciantes</strong> e para descobrir <strong>recursos avançados</strong>!
        </motion.p>
      </motion.div>

      {/* Dicas de Responsividade */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-4 w-4 text-primary" />
            <span>Funciona no celular</span>
          </div>
          <div className="flex items-center space-x-2">
            <Monitor className="h-4 w-4 text-primary" />
            <span>Funciona no computador</span>
          </div>
        </div>
      </div>

      {/* Lista de Tours */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tours.map((tour, index) => {
          const progress = getTourProgressData(tour.id);
          const isCompleted = progress?.completed;
          const progressPercent = progress
            ? (progress.stepsCompleted / progress.totalSteps) * 100
            : 0;

          return (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  "group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden border-2",
                  selectedTour === tour.id && "ring-2 ring-primary ring-offset-2",
                  isCompleted
                    ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800"
                    : "hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10 border-primary/20 hover:border-primary/40"
                )}
                onClick={() => {
                  setSelectedTour(tour.id);
                  startTour(tour.id);
                  // Fechar o modal imediatamente após iniciar o tour
                  if (onClose) {
                    console.log("Fechando modal do tour launcher");
                    onClose();
                  }
                }}
              >
                {/* Efeito de Brilho */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />

                {/* Indicador de Status - Apenas para tours completados */}
                {isCompleted && (
                  <div className="absolute top-4 right-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Check className="h-4 w-4 text-white" />
                    </motion.div>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-start space-x-4">
                    <motion.div
                      className={cn(
                        "p-3 rounded-2xl shadow-lg",
                        isCompleted
                          ? "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-600 dark:text-green-400"
                          : "bg-gradient-to-br from-primary/20 to-primary/10 text-primary"
                      )}
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {getTourIcon(tour.category)}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex flex-col space-y-2">
                          <Badge
                            variant={tour.category === "onboarding" ? "default" : "secondary"}
                            className="text-xs w-fit"
                          >
                            {tour.category === "onboarding" ? "Iniciante" :
                              tour.category === "feature" ? "Funcionalidade" : "Avançado"}
                          </Badge>
                          <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                            {tour.name}
                          </CardTitle>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                          <Clock className="h-3 w-3" />
                          <span>{tour.estimatedTime}min</span>
                        </div>
                      </div>
                      <CardDescription className="text-sm leading-relaxed">
                        {tour.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  {/* Informações do Tour */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <List className="h-4 w-4" />
                        <span>{tour.steps.length} passos</span>
                      </div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span>Interativo</span>
                      </div>
                    </div>
                    {progress && (
                      <span
                        className={cn(
                          "font-bold text-lg",
                          isCompleted
                            ? "text-green-600 dark:text-green-400"
                            : "text-primary"
                        )}
                      >
                        {progress.stepsCompleted}/{progress.totalSteps}
                      </span>
                    )}
                  </div>

                  {/* Barra de Progresso */}
                  {progress && progressPercent > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progresso</span>
                        <span>{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className={cn(
                            "h-3 rounded-full relative",
                            isCompleted
                              ? "bg-gradient-to-r from-green-500 to-emerald-500"
                              : "bg-gradient-to-r from-primary to-primary/80"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        >
                          {/* Efeito de Brilho na Barra */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 1,
                            }}
                          />
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {/* Botão de Ação */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      size="lg"
                      className={cn(
                        "w-full h-12 text-base font-semibold rounded-xl shadow-lg transition-all duration-300",
                        isCompleted
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                          : "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white"
                      )}
                      disabled={selectedTour === tour.id}
                    >
                      {selectedTour === tour.id ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Iniciando...
                        </>
                      ) : isCompleted ? (
                        <>
                          <RotateCcw className="h-5 w-5 mr-2" />
                          Refazer Tour
                        </>
                      ) : (
                        <>
                          Começar Tour
                        </>
                      )}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Moderno */}
      <motion.div
        className="text-center space-y-4 p-6 bg-gradient-to-r from-primary/5 via-primary/3 to-primary/5 rounded-2xl border border-primary/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          💡 <strong>Dica:</strong> Os tours são interativos e podem ser pausados a qualquer momento.
          Use-os para aprender rapidamente como navegar pela plataforma!
        </p>
        <div className="flex items-center justify-center flex-wrap gap-4 text-xs">
          <motion.div
            className="flex items-center space-x-1 px-3 py-1 bg-primary/10 rounded-full text-primary"
            whileHover={{ scale: 1.05 }}
          >
            <Smartphone className="h-3 w-3" />
            <span>Mobile-friendly</span>
          </motion.div>
          <motion.div
            className="flex items-center space-x-1 px-3 py-1 bg-blue-500/10 rounded-full text-blue-600 dark:text-blue-400"
            whileHover={{ scale: 1.05 }}
          >
            <Zap className="h-3 w-3" />
            <span>Pausável</span>
          </motion.div>
          <motion.div
            className="flex items-center space-x-1 px-3 py-1 bg-green-500/10 rounded-full text-green-600 dark:text-green-400"
            whileHover={{ scale: 1.05 }}
          >
            <RotateCcw className="h-3 w-3" />
            <span>Repetível</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
