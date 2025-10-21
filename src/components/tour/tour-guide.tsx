"use client";

import { useTour } from "@/contexts/tour-context";
import { useCallback, useEffect } from "react";
import { TourOverlay } from "./tour-overlay";
import { TourTooltip } from "./tour-tooltip";

export function TourGuide() {
  const tourContext = useTour();
  const {
    state,
    nextStep,
    previousStep,
    skipTour,
    completeTour,
  } = tourContext;

  // Funções auxiliares
  const getCurrentStep = useCallback(() => {
    if (!state.currentTour || !state.isActive) return null;
    return state.currentTour.steps[state.currentStep] || null;
  }, [state.currentTour, state.isActive, state.currentStep]);

  const isCurrentStepValid = useCallback(() => {
    const currentStep = getCurrentStep();
    if (!currentStep) return false;
    return true;
  }, [getCurrentStep]);

  const currentStep = getCurrentStep();
  const stepValid = isCurrentStepValid();
  const isActive = state.isActive && currentStep && stepValid;

  // Scroll para o elemento quando o passo mudar
  useEffect(() => {
    if (!isActive || !currentStep) return;

    const scrollToTarget = () => {
      const element = document.querySelector(currentStep.target);
      if (element && currentStep.position !== "center") {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }
    };

    // Delay para garantir que o elemento existe
    const timer = setTimeout(scrollToTarget, 100);
    return () => clearTimeout(timer);
  }, [isActive, currentStep]);

  // Executar ações do passo
  useEffect(() => {
    if (!isActive || !currentStep) return;

    const executeAction = () => {
      if (currentStep.highlight) {
        const element = document.querySelector(currentStep.target);
        if (element) {
          element.classList.add("tour-highlight");
          return () => element.classList.remove("tour-highlight");
        }
      }
    };

    const cleanup = executeAction();
    return cleanup;
  }, [isActive, currentStep]);

  // Navegação entre páginas
  useEffect(() => {
    if (!isActive || !currentStep) return;

    if (currentStep.action === "navigate" && currentStep.actionData?.url) {
      const currentUrl = window.location.pathname;
      const targetUrl = currentStep.actionData.url;

      if (currentUrl !== targetUrl) {
        console.log("Navegando para:", targetUrl);
        window.location.href = targetUrl;
      }
    }
  }, [isActive, currentStep]);

  if (!isActive || !currentStep) {
    return null;
  }
  return (
    <>
      {/* Overlay de destaque */}
      <TourOverlay
        target={currentStep.target}
        isVisible={isActive}
        onClose={skipTour}
      />

      {/* Tooltip com conteúdo */}
      <TourTooltip
        step={currentStep}
        currentStepIndex={state.currentStep}
        totalSteps={state.currentTour?.steps.length || 0}
        onNext={nextStep}
        onPrevious={previousStep}
        onSkip={skipTour}
        onFinish={completeTour}
        isVisible={isActive}
      />
    </>
  );
}
