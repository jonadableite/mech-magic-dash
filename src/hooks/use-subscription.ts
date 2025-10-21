import useSWR from "swr";
import { authClient } from "@/providers/auth-client";
import { useCallback } from "react";
import { toast } from "sonner";
import { Locale } from "date-fns";

// Interfaces para assinaturas (Single Responsibility Principle)
export interface Subscription {
  id: string;
  plan: string;
  referenceId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status: string;
  periodStart?: Date;
  periodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  seats?: number;
  trialStart?: Date;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  name: string;
  priceId: string;
  limits: {
    ordens: number;
    clientes: number;
    veiculos: number;
  };
  freeTrial?: {
    days: number;
  };
}

export interface UpgradeSubscriptionData {
  plan: string;
  annual?: boolean;
  referenceId?: string;
  subscriptionId?: string;
  metadata?: Record<string, any>;
  seats?: number;
  successUrl: string;
  cancelUrl: string;
  returnUrl?: string;
  disableRedirect?: boolean;
}

export interface CancelSubscriptionData {
  referenceId?: string;
  subscriptionId?: string;
  returnUrl: string;
}

export interface RestoreSubscriptionData {
  referenceId?: string;
  subscriptionId?: string;
}

export interface BillingPortalData {
  locale?: string;
  referenceId?: string;
  returnUrl?: string;
}

// Service class para gerenciar assinaturas (Single Responsibility Principle)
class SubscriptionService {
  // Listar assinaturas ativas
  async listSubscriptions(referenceId?: string): Promise<Subscription[]> {
    const response = await authClient.subscription.list({
      query: {
        referenceId,
      },
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return (response.data || []) as unknown as Subscription[];
  }

  // Criar/atualizar assinatura
  async upgradeSubscription(
    data: UpgradeSubscriptionData
  ): Promise<{ url?: string }> {
    const response = await authClient.subscription.upgrade(data);

    if (response.error) {
      throw new Error(response.error.message);
    }

    return { url: response.data?.url || undefined };
  }

  // Cancelar assinatura
  async cancelSubscription(
    data: CancelSubscriptionData
  ): Promise<{ url?: string }> {
    const response = await authClient.subscription.cancel(data);

    if (response.error) {
      throw new Error(response.error.message);
    }

    return { url: response.data?.url || undefined };
  }

  // Restaurar assinatura
  async restoreSubscription(data: RestoreSubscriptionData): Promise<void> {
    const response = await authClient.subscription.restore(data);

    if (response.error) {
      throw new Error(response.error.message);
    }
  }

  // Criar sessão do portal de cobrança
  async createBillingPortal(
    data: BillingPortalData
  ): Promise<{ url?: string }> {
    // Ajuste: Garantir tipo correto para o locale
    const { locale, ...rest } = data;
    const apiData = {
      ...rest,
      // Garantir que locale seja string ou undefined
      // Corrigido: só inclui 'locale' se for um valor definido
      ...(locale !== undefined ? { locale } : {}),
    };
    const response = await authClient.subscription.billingPortal(
      apiData as any
    );

    if (response.error) {
      throw new Error(response.error.message);
    }

    return { url: response.data?.url || undefined };
  }
}

// Instância do serviço (Singleton Pattern)
const subscriptionService = new SubscriptionService();

// Hooks personalizados (Custom Hooks Pattern)
export function useSubscriptions(referenceId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    referenceId ? `subscriptions-${referenceId}` : "subscriptions",
    () => subscriptionService.listSubscriptions(referenceId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 segundos
    }
  );

  return {
    subscriptions: data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useUpgradeSubscription() {
  const { mutate } = useSubscriptions();

  const upgrade = useCallback(
    async (data: UpgradeSubscriptionData) => {
      try {
        const result = await subscriptionService.upgradeSubscription(data);

        toast.success("Redirecionando para o checkout...");

        // Revalidar dados após upgrade
        await mutate();

        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro ao atualizar assinatura";
        toast.error(message);
        throw error;
      }
    },
    [mutate]
  );

  return { upgrade };
}

export function useCancelSubscription() {
  const { mutate } = useSubscriptions();

  const cancel = useCallback(
    async (data: CancelSubscriptionData) => {
      try {
        const result = await subscriptionService.cancelSubscription(data);

        toast.success("Redirecionando para o portal de cobrança...");

        // Revalidar dados após cancelamento
        await mutate();

        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro ao cancelar assinatura";
        toast.error(message);
        throw error;
      }
    },
    [mutate]
  );

  return { cancel };
}

export function useRestoreSubscription() {
  const { mutate } = useSubscriptions();

  const restore = useCallback(
    async (data: RestoreSubscriptionData) => {
      try {
        await subscriptionService.restoreSubscription(data);

        toast.success("Assinatura restaurada com sucesso!");

        // Revalidar dados após restauração
        await mutate();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro ao restaurar assinatura";
        toast.error(message);
        throw error;
      }
    },
    [mutate]
  );

  return { restore };
}

export function useBillingPortal() {
  const createPortal = useCallback(async (data: BillingPortalData) => {
    try {
      const result = await subscriptionService.createBillingPortal(data);

      toast.success("Redirecionando para o portal de cobrança...");

      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao abrir portal de cobrança";
      toast.error(message);
      throw error;
    }
  }, []);

  return { createPortal };
}

// Utilitários para verificar limites (Utility Functions)
export function checkSubscriptionLimits(
  subscription: Subscription | null,
  planLimits: Record<string, number>
): Record<string, { used: number; limit: number; unlimited: boolean }> {
  const limits: Record<
    string,
    { used: number; limit: number; unlimited: boolean }
  > = {};

  Object.entries(planLimits).forEach(([key, limit]) => {
    limits[key] = {
      used: 0, // TODO: Implementar contagem real de uso
      limit,
      unlimited: limit === -1,
    };
  });

  return limits;
}

export function isSubscriptionActive(
  subscription: Subscription | null
): boolean {
  if (!subscription) return false;

  return subscription.status === "active" || subscription.status === "trialing";
}

export function isSubscriptionTrialing(
  subscription: Subscription | null
): boolean {
  if (!subscription) return false;

  return subscription.status === "trialing";
}

export function getSubscriptionStatusText(
  subscription: Subscription | null
): string {
  if (!subscription) return "Sem assinatura";

  switch (subscription.status) {
    case "active":
      return "Ativa";
    case "trialing":
      return "Período de teste";
    case "canceled":
      return "Cancelada";
    case "incomplete":
      return "Incompleta";
    case "incomplete_expired":
      return "Expirada";
    case "past_due":
      return "Vencida";
    case "unpaid":
      return "Não paga";
    default:
      return "Desconhecido";
  }
}

// Planos de assinatura (Configuration)
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: "basic",
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || "",
    limits: {
      ordens: 50,
      clientes: 100,
      veiculos: 200,
    },
  },
  {
    name: "pro",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "",
    limits: {
      ordens: 500,
      clientes: 1000,
      veiculos: 2000,
    },
    freeTrial: {
      days: 14,
    },
  },
  {
    name: "enterprise",
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || "",
    limits: {
      ordens: -1, // Ilimitado
      clientes: -1,
      veiculos: -1,
    },
  },
];

export function getPlanByName(name: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.name === name);
}

export function getPlanByPriceId(
  priceId: string
): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.priceId === priceId);
}
