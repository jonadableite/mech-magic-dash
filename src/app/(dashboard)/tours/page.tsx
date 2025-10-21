"use client";

import React from "react";
import { TourLauncher } from "@/components/tour/tour-launcher";
import { TourProvider } from "@/contexts/tour-context";

export default function ToursPage() {
  return (
    <TourProvider>
      <div className="container mx-auto p-6 space-y-8">
        <TourLauncher />
      </div>
    </TourProvider>
  );
}
