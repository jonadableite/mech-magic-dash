"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { toast } from "sonner";
import type { Tour, TourProgress, TourState, TourContextValue } from "@/types/tour.types";

// Tours disponíveis
const AVAILABLE_TOURS: Tour[] = [
  {
    id: "onboarding-completo",
    name: "Tour Completo da Plataforma",
    description: "Aprenda a usar todas as funcionalidades principais da plataforma",
    category: "onboarding",
    estimatedTime: 15,
    steps: [
      {
        id: "welcome",
        title: "Bem-vindo ao Mech Magic Dash! 🚗",
        description: "Vamos conhecer sua nova plataforma de gestão de oficina. Este tour vai te ensinar tudo que você precisa saber para aproveitar ao máximo o sistema.",
        target: "body",
        position: "center",
        nextButtonText: "Começar Tour",
        skipButtonText: "Pular Tour",
        highlight: false,
      },
      {
        id: "dashboard-overview",
        title: "Dashboard Principal 📊",
        description: "Aqui você vê um resumo geral da sua oficina: clientes, veículos, ordens de serviço e produtos em estoque. É seu centro de controle!",
        target: "[data-tour='dashboard']",
        position: "bottom",
        nextButtonText: "Próximo",
        highlight: true,
      },
      {
        id: "sidebar-navigation",
        title: "Navegação Principal 🧭",
        description: "Use o menu lateral para navegar entre as diferentes seções: Clientes, Veículos, Estoque, Ordens de Serviço, Financeiro e mais.",
        target: "[data-tour='sidebar']",
        position: "right",
        nextButtonText: "Entendi",
        highlight: true,
      },
      {
        id: "clientes-intro",
        title: "Gestão de Clientes 👥",
        description: "Cadastre e gerencie seus clientes. Aqui você pode adicionar informações completas, histórico de serviços e veículos de cada cliente.",
        target: "[data-tour='clientes']",
        position: "bottom",
        nextButtonText: "Ver Como Usar",
        highlight: true,
        action: "navigate",
        actionData: { url: "/clientes" },
      },
      {
        id: "estoque-intro",
        title: "Controle de Estoque 📦",
        description: "Gerencie seu estoque de peças e produtos. Acompanhe quantidades, preços, fornecedores e receba alertas de estoque baixo.",
        target: "[data-tour='estoque']",
        position: "bottom",
        nextButtonText: "Continuar",
        highlight: true,
        action: "navigate",
        actionData: { url: "/estoque" },
      },
      {
        id: "ordens-intro",
        title: "Ordens de Serviço 🔧",
        description: "Crie e gerencie ordens de serviço completas. Associe clientes, veículos, produtos e acompanhe o progresso dos trabalhos.",
        target: "[data-tour='ordens']",
        position: "bottom",
        nextButtonText: "Próximo",
        highlight: true,
        action: "navigate",
        actionData: { url: "/ordens" },
      },
      {
        id: "financeiro-intro",
        title: "Controle Financeiro 💰",
        description: "Acompanhe receitas, despesas, comissões e relatórios financeiros. Mantenha sua oficina organizada financeiramente.",
        target: "[data-tour='financeiro']",
        position: "bottom",
        nextButtonText: "Ver Relatórios",
        highlight: true,
        action: "navigate",
        actionData: { url: "/financeiro" },
      },
      {
        id: "perfil-config",
        title: "Seu Perfil 👤",
        description: "Configure suas informações pessoais, altere sua senha e personalize sua experiência na plataforma.",
        target: "[data-tour='perfil']",
        position: "bottom",
        nextButtonText: "Configurar",
        highlight: true,
        action: "navigate",
        actionData: { url: "/perfil" },
      },
      {
        id: "mobile-tips",
        title: "Dica: Uso no Celular 📱",
        description: "A plataforma é totalmente responsiva! Use no celular, tablet ou computador. Todos os recursos estão disponíveis em qualquer dispositivo.",
        target: "body",
        position: "center",
        nextButtonText: "Legal!",
        highlight: false,
      },
      {
        id: "tour-complete",
        title: "Tour Concluído! 🎉",
        description: "Parabéns! Você agora conhece os principais recursos da plataforma. Explore cada seção para descobrir todas as funcionalidades disponíveis. Precisa de ajuda? Use o botão de suporte!",
        target: "body",
        position: "center",
        nextButtonText: "Começar a Usar",
        highlight: false,
      },
    ],
  },
  {
    id: "clientes-tutorial",
    name: "Como Gerenciar Clientes",
    description: "Aprenda a cadastrar e gerenciar clientes de forma eficiente",
    category: "feature",
    estimatedTime: 5,
    steps: [
      {
        id: "clientes-add",
        title: "Adicionar Novo Cliente 👤",
        description: "Clique no botão 'Novo Cliente' para cadastrar um cliente. Preencha nome, email, telefone e endereço.",
        target: "[data-tour='add-cliente']",
        position: "bottom",
        action: "click",
        nextButtonText: "Fazer Agora",
      },
      {
        id: "clientes-search",
        title: "Buscar Clientes 🔍",
        description: "Use a barra de busca para encontrar clientes rapidamente por nome, email ou telefone.",
        target: "[data-tour='search-cliente']",
        position: "bottom",
        nextButtonText: "Próximo",
      },
      {
        id: "clientes-actions",
        title: "Ações com Clientes ⚙️",
        description: "Para cada cliente, você pode visualizar, editar ou excluir. Clique nos três pontos para ver as opções.",
        target: "[data-tour='cliente-actions']",
        position: "left",
        nextButtonText: "Entendi",
      },
    ],
  },
  {
    id: "estoque-tutorial",
    name: "Como Gerenciar Estoque",
    description: "Aprenda a controlar seu estoque de peças e produtos",
    category: "feature",
    estimatedTime: 5,
    steps: [
      {
        id: "estoque-add",
        title: "Adicionar Produto 📦",
        description: "Clique em 'Novo Produto' para adicionar peças ao estoque. Defina nome, categoria, preço e quantidade.",
        target: "[data-tour='add-produto']",
        position: "bottom",
        nextButtonText: "Adicionar",
      },
      {
        id: "estoque-filter",
        title: "Filtrar Produtos 🔍",
        description: "Use os filtros para encontrar produtos por categoria, estoque baixo ou fornecedor.",
        target: "[data-tour='filter-produtos']",
        position: "bottom",
        nextButtonText: "Filtrar",
      },
      {
        id: "estoque-alerts",
        title: "Alertas de Estoque ⚠️",
        description: "Produtos com estoque baixo aparecem destacados. Configure alertas automáticos para reposição.",
        target: "[data-tour='estoque-baixo']",
        position: "top",
        nextButtonText: "Ver Alertas",
      },
    ],
  },
];

// Estado inicial
const initialState: TourState = {
  isActive: false,
  currentTour: null,
  currentStep: 0,
  progress: null,
  isPaused: false,
};

// Reducer para gerenciar estado
type TourAction =
  | { type: "START_TOUR"; payload: { tour: Tour } }
  | { type: "NEXT_STEP" }
  | { type: "PREVIOUS_STEP" }
  | { type: "SKIP_TOUR" }
  | { type: "PAUSE_TOUR" }
  | { type: "RESUME_TOUR" }
  | { type: "COMPLETE_TOUR" }
  | { type: "UPDATE_PROGRESS"; payload: TourProgress };

function tourReducer(state: TourState, action: TourAction): TourState {
  switch (action.type) {
    case "START_TOUR":
      return {
        ...state,
        isActive: true,
        currentTour: action.payload.tour,
        currentStep: 0,
        progress: {
          tourId: action.payload.tour.id,
          currentStep: 0,
          completedSteps: [],
          isCompleted: false,
          startedAt: new Date(),
        },
        isPaused: false,
      };

    case "NEXT_STEP":
      if (!state.currentTour || !state.progress) return state;

      const nextStep = state.currentStep + 1;
      const isCompleted = nextStep >= state.currentTour.steps.length;

      return {
        ...state,
        currentStep: nextStep,
        progress: {
          ...state.progress,
          currentStep: nextStep,
          completedSteps: [...state.progress.completedSteps, state.currentTour.steps[state.currentStep].id],
          isCompleted,
          completedAt: isCompleted ? new Date() : undefined,
        },
        isActive: !isCompleted,
      };

    case "PREVIOUS_STEP":
      if (!state.currentTour || state.currentStep <= 0) return state;

      return {
        ...state,
        currentStep: state.currentStep - 1,
        progress: state.progress ? {
          ...state.progress,
          currentStep: state.currentStep - 1,
        } : null,
      };

    case "SKIP_TOUR":
      return {
        ...state,
        isActive: false,
        currentTour: null,
        currentStep: 0,
        progress: null,
        isPaused: false,
      };

    case "PAUSE_TOUR":
      return {
        ...state,
        isPaused: true,
      };

    case "RESUME_TOUR":
      return {
        ...state,
        isPaused: false,
      };

    case "COMPLETE_TOUR":
      return {
        ...state,
        isActive: false,
        currentTour: null,
        currentStep: 0,
        progress: null,
        isPaused: false,
      };

    case "UPDATE_PROGRESS":
      return {
        ...state,
        progress: action.payload,
      };

    default:
      return state;
  }
}

// Context
const TourContext = createContext<TourContextValue | undefined>(undefined);

// Provider
export function TourProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tourReducer, initialState);

  // Carregar progresso salvo
  useEffect(() => {
    const savedProgress = localStorage.getItem("tour-progress");
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        dispatch({ type: "UPDATE_PROGRESS", payload: progress });
      } catch (error) {
        console.error("Erro ao carregar progresso do tour:", error);
      }
    }
  }, []);

  // Salvar progresso
  useEffect(() => {
    if (state.progress) {
      localStorage.setItem("tour-progress", JSON.stringify(state.progress));
    }
  }, [state.progress]);

  const startTour = (tourId: string) => {
    const tour = AVAILABLE_TOURS.find(t => t.id === tourId);
    if (tour) {
      dispatch({ type: "START_TOUR", payload: { tour } });
      toast.success(`Tour "${tour.name}" iniciado!`);
    } else {
      toast.error("Tour não encontrado");
    }
  };

  const nextStep = () => {
    dispatch({ type: "NEXT_STEP" });
  };

  const previousStep = () => {
    dispatch({ type: "PREVIOUS_STEP" });
  };

  const skipTour = () => {
    dispatch({ type: "SKIP_TOUR" });
    toast.info("Tour cancelado");
  };

  const pauseTour = () => {
    dispatch({ type: "PAUSE_TOUR" });
    toast.info("Tour pausado");
  };

  const resumeTour = () => {
    dispatch({ type: "RESUME_TOUR" });
    toast.info("Tour retomado");
  };

  const completeTour = () => {
    dispatch({ type: "COMPLETE_TOUR" });
    toast.success("Tour concluído! 🎉");
  };

  const getAvailableTours = () => AVAILABLE_TOURS;

  const getTourProgress = (tourId: string) => {
    if (state.progress && state.progress.tourId === tourId) {
      return state.progress;
    }
    return null;
  };

  const value: TourContextValue = {
    state,
    startTour,
    nextStep,
    previousStep,
    skipTour,
    pauseTour,
    resumeTour,
    completeTour,
    getAvailableTours,
    getTourProgress,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
}

// Hook para usar o contexto
export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error("useTour deve ser usado dentro de um TourProvider");
  }
  return context;
}
