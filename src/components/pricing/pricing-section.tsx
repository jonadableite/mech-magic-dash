"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  X,
  Crown,
  Zap,
  Building2,
  CreditCard,
  Users,
  FileText,
  Car,
  Calendar,
  Shield,
  Headphones,
  ArrowRight
} from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/hooks/use-subscription";
import Link from "next/link";

// Componente para exibir um plano de preços (Single Responsibility Principle)
function PricingCard({
  plan,
  isPopular = false,
  onSelectPlan
}: {
  plan: typeof SUBSCRIPTION_PLANS[0];
  isPopular?: boolean;
  onSelectPlan: (planName: string) => void;
}) {
  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case "basic":
        return <Zap className="h-6 w-6" />;
      case "pro":
        return <Crown className="h-6 w-6" />;
      case "enterprise":
        return <Building2 className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case "basic":
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950";
      case "pro":
        return "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950";
      case "enterprise":
        return "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950";
      default:
        return "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950";
    }
  };

  const getPlanPrice = (planName: string) => {
    switch (planName) {
      case "basic":
        return { price: "R$ 29,90", period: "/mês" };
      case "pro":
        return { price: "R$ 79,90", period: "/mês" };
      case "enterprise":
        return { price: "Sob consulta", period: "" };
      default:
        return { price: "Gratuito", period: "" };
    }
  };

  const getPlanFeatures = (planName: string) => {
    const baseFeatures = [
      "Gestão completa de clientes",
      "Controle de veículos",
      "Ordens de serviço",
      "Relatórios básicos",
      "Suporte por email",
      "Backup automático",
    ];

    switch (planName) {
      case "basic":
        return [
          ...baseFeatures,
          "Até 50 ordens/mês",
          "Até 100 clientes",
          "Até 200 veículos",
        ];
      case "pro":
        return [
          ...baseFeatures,
          "Até 500 ordens/mês",
          "Até 1000 clientes",
          "Até 2000 veículos",
          "Relatórios avançados",
          "Integração com APIs",
          "Suporte prioritário",
          "14 dias grátis",
        ];
      case "enterprise":
        return [
          ...baseFeatures,
          "Ordens ilimitadas",
          "Clientes ilimitados",
          "Veículos ilimitados",
          "Relatórios personalizados",
          "Integrações customizadas",
          "Suporte dedicado",
          "Treinamento personalizado",
          "SLA garantido",
        ];
      default:
        return baseFeatures;
    }
  };

  const features = getPlanFeatures(plan.name);
  const pricing = getPlanPrice(plan.name);

  return (
    <Card className={`relative ${isPopular ? getPlanColor(plan.name) : ""} hover:shadow-lg transition-all duration-300 hover:scale-105`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge variant="default" className="px-4 py-1">
            Mais Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-full ${isPopular ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            {getPlanIcon(plan.name)}
          </div>
        </div>

        <CardTitle className="text-2xl font-bold capitalize">
          {plan.name === "basic" ? "Básico" :
            plan.name === "pro" ? "Profissional" :
              plan.name === "enterprise" ? "Empresarial" : plan.name}
        </CardTitle>

        <CardDescription className="text-lg">
          <span className="text-3xl font-bold text-primary">{pricing.price}</span>
          <span className="text-muted-foreground">{pricing.period}</span>
        </CardDescription>

        {plan.freeTrial && (
          <Badge variant="secondary" className="mt-2">
            {plan.freeTrial.days} dias grátis
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Lista de recursos */}
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Botão de ação */}
        <div className="space-y-2">
          <Button
            onClick={() => onSelectPlan(plan.name)}
            className="w-full"
            variant={isPopular ? "default" : "outline"}
            size="lg"
          >
            {plan.name === "enterprise" ? "Falar com Vendas" : "Começar Agora"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          {plan.name !== "enterprise" && (
            <p className="text-xs text-center text-muted-foreground">
              Cancele a qualquer momento
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente principal da seção de preços
export default function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const handleSelectPlan = (planName: string) => {
    if (planName === "enterprise") {
      // Redirecionar para contato
      window.open("mailto:contato@mechmagic.com?subject=Interesse no Plano Empresarial", "_blank");
      return;
    }

    // Redirecionar para página de assinaturas
    window.location.href = `/assinaturas?plan=${planName}`;
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Cabeçalho */}
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Planos que Crescem com Você
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para sua oficina. Todos incluem recursos essenciais
            para gerenciar seu negócio com eficiência.
          </p>
        </div>

        {/* Toggle de período de cobrança */}
        <div className="flex justify-center mb-8">
          <div className="bg-muted p-1 rounded-lg">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${billingPeriod === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${billingPeriod === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Anual
              <Badge variant="secondary" className="ml-2 text-xs">
                -20%
              </Badge>
            </button>
          </div>
        </div>

        {/* Cards de preços */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan, index) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              isPopular={plan.name === "pro"}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </div>

        {/* Informações adicionais */}
        <div className="mt-16 text-center space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Segurança Garantida</h3>
              <p className="text-sm text-muted-foreground text-center">
                Seus dados protegidos com criptografia de nível bancário
              </p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 rounded-full bg-primary/10">
                <Headphones className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Suporte 24/7</h3>
              <p className="text-sm text-muted-foreground text-center">
                Nossa equipe está sempre disponível para ajudar
              </p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Atualizações Constantes</h3>
              <p className="text-sm text-muted-foreground text-center">
                Novos recursos e melhorias regularmente
              </p>
            </div>
          </div>

          {/* FAQ básico */}
          <div className="bg-muted/50 rounded-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold mb-6">Perguntas Frequentes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-medium mb-2">Posso cancelar a qualquer momento?</h4>
                <p className="text-sm text-muted-foreground">
                  Sim, você pode cancelar sua assinatura a qualquer momento sem taxas adicionais.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Há período de teste?</h4>
                <p className="text-sm text-muted-foreground">
                  O plano Profissional inclui 14 dias grátis para você testar todos os recursos.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Meus dados estão seguros?</h4>
                <p className="text-sm text-muted-foreground">
                  Sim, utilizamos criptografia de ponta e seguimos as melhores práticas de segurança.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Posso alterar de plano?</h4>
                <p className="text-sm text-muted-foreground">
                  Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
                </p>
              </div>
            </div>
          </div>

          {/* CTA final */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Pronto para Transformar sua Oficina?</h3>
            <p className="text-muted-foreground">
              Junte-se a centenas de oficinas que já confiam no Mech Magic
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/assinaturas">
                  Começar Agora
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={"/contato" as any}>
                  Falar com Vendas
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
