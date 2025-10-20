"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface FloatingElementsProps {
  className?: string;
}

export const FloatingElements = ({ className }: FloatingElementsProps) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Elementos flutuantes animados */}
      <motion.div
        className="absolute top-20 left-10 w-2 h-2 bg-primary/30 rounded-full"
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-32 right-16 w-1 h-1 bg-primary/40 rounded-full"
        animate={{
          y: [0, -15, 0],
          x: [0, 10, 0],
          opacity: [0.4, 0.9, 0.4],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-primary/25 rounded-full"
        animate={{
          y: [0, -25, 0],
          opacity: [0.25, 0.7, 0.25],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <motion.div
        className="absolute bottom-20 right-12 w-1 h-1 bg-primary/35 rounded-full"
        animate={{
          y: [0, -18, 0],
          x: [0, -8, 0],
          opacity: [0.35, 0.8, 0.35],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      {/* Linhas de conexão sutis */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-px h-20 bg-gradient-to-b from-primary/20 to-transparent"
        animate={{
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/3 right-1/3 w-px h-16 bg-gradient-to-t from-primary/20 to-transparent"
        animate={{
          opacity: [0, 0.4, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />
    </div>
  );
};
