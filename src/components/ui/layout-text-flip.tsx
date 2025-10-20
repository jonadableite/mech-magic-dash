"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export const LayoutTextFlip = ({
  text = "Build Amazing",
  words = ["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"],
  duration = 3000,
  className = "",
}: {
  text: string;
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [duration, words.length]);

  return (
    <div className={cn("flex flex-col items-start space-y-2", className)}>
      <motion.span
        layoutId="subtext"
        className="text-2xl font-bold tracking-tight drop-shadow-lg md:text-4xl lg:text-5xl xl:text-6xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
      >
        {text}
      </motion.span>

      <div className="relative h-16 sm:h-20 lg:h-24 xl:h-28 flex items-center">
        <motion.div
          layout
          className="relative w-fit overflow-hidden font-sans text-2xl font-bold tracking-tight md:text-4xl lg:text-5xl xl:text-6xl"
        >
          <AnimatePresence mode="popLayout">
            <motion.span
              key={currentIndex}
              initial={{ y: -40, filter: "blur(10px)", opacity: 0 }}
              animate={{
                y: 0,
                filter: "blur(0px)",
                opacity: 1,
              }}
              exit={{ y: 50, filter: "blur(10px)", opacity: 0 }}
              transition={{
                duration: 0.6,
                ease: "easeInOut",
              }}
              className={cn("inline-block whitespace-nowrap bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent")}
            >
              {words[currentIndex]}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
