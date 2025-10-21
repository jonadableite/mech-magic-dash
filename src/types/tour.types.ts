export interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // Seletor CSS do elemento alvo
  position: "top" | "bottom" | "left" | "right" | "center";
  action?: "click" | "type" | "scroll" | "wait" | "navigate";
  actionData?: any;
  nextButtonText?: string;
  skipButtonText?: string;
  highlight?: boolean;
  image?: string;
  video?: string;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  steps: TourStep[];
  category: "onboarding" | "feature" | "advanced";
  estimatedTime: number; // em minutos
  requiredRole?: "ADMIN" | "GERENTE" | "USUARIO";
}

export interface TourProgress {
  tourId: string;
  currentStep: number;
  completedSteps: string[];
  isCompleted: boolean;
  startedAt: Date;
  completedAt?: Date;
}

export interface TourState {
  isActive: boolean;
  currentTour: Tour | null;
  currentStep: number;
  progress: TourProgress | null;
  isPaused: boolean;
}

export interface TourContextValue {
  state: TourState;
  startTour: (tourId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTour: () => void;
  pauseTour: () => void;
  resumeTour: () => void;
  completeTour: () => void;
  getAvailableTours: () => Tour[];
  getTourProgress: (tourId: string) => TourProgress | null;
}
