"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTour } from "@/contexts/tour-context";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, CheckCircle, HelpCircle, Play, GraduationCap } from "lucide-react";

interface TourButtonProps {
  variant?: "default" | "floating" | "minimal";
  className?: string;
}

export function TourButton({ variant = "default", className }: TourButtonProps) {
  const { startTour, getAvailableTours, getTourProgress } = useTour();

  const tours = getAvailableTours();
  const isTourCompleted = (tourId: string) => {
    const progress = getTourProgress(tourId);
    return progress?.isCompleted || false;
  };

  const handleStartTour = (tourId: string) => {
    try {
      startTour(tourId);
    } catch (error) {
      console.error("Erro ao iniciar tour:", error);
    }
  };

  if (variant === "floating") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "fixed bottom-6 right-6 z-[9999]",
            className
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="lg"
                className="rounded-full w-16 h-16 bg-gradient-to-r from-primary via-primary/80 to-primary/60 hover:from-primary/90 hover:via-primary/70 hover:to-primary/50 text-white border-0 shadow-2xl shadow-primary/50 transition-all duration-300"
                title="Iniciar Como Usar a Plataforma"
              >
                <HelpCircle className="w-7 h-7" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-background/95 backdrop-blur-xl border-primary/30">
              <DropdownMenuLabel className="text-foreground">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Tours Disponíveis
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-primary/30" />
              {tours.map((tour) => (
                <DropdownMenuItem
                  key={tour.id}
                  onClick={() => handleStartTour(tour.id)}
                  className="text-foreground hover:bg-primary/20 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      <div>
                        <p className="font-medium">{tour.name}</p>
                        <p className="text-xs text-muted-foreground">{tour.description}</p>
                      </div>
                    </div>
                    {isTourCompleted(tour.id) && (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (variant === "minimal") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleStartTour("onboarding-completo")}
        className={cn("text-muted-foreground hover:text-foreground hover:bg-accent", className)}
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        Como Usar a Plataforma
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "bg-background/50 border-primary/20 text-foreground hover:bg-primary/10",
            className
          )}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Como Usar a Plataforma
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-background/95 backdrop-blur-xl border-primary/30">
        <DropdownMenuLabel className="text-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Tours Disponíveis
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-primary/30" />
        {tours.map((tour) => (
          <DropdownMenuItem
            key={tour.id}
            onClick={() => handleStartTour(tour.id)}
            className="text-foreground hover:bg-primary/20 cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                <div>
                  <p className="font-medium">{tour.name}</p>
                  <p className="text-xs text-muted-foreground">{tour.description}</p>
                </div>
              </div>
              {isTourCompleted(tour.id) && (
                <CheckCircle className="w-4 h-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}