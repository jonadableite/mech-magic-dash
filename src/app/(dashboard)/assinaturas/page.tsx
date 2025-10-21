"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Building2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Planos de assinatura
const PLANS = [
  {
    name: "basic",
    title: "Básico",
    description: "Perfeito para pequenas oficinas",
    price: "R$ 29,90",
    period: "/mês",
    limits: {
      ordens: 50,
      clientes: 100,
      veiculos: 200,
    },
    features: [
      "Até 50 ordens de serviço",
      "Até 100 clientes",
      "Até 200 veículos",
      "Suporte por email",
      "Relatórios básicos",
    ],
    icon: Zap,
    popular: false,
  },
  {
    name: "pro",
    title: "Profissional",
    description: "Ideal para oficinas em crescimento",
    price: "R$ 79,90",
    period: "/mês",
    limits: {
      ordens: 500,
      clientes: 1000,
      veiculos: 2000,
    },
    features: [
      "Até 500 ordens de serviço",
      "Até 1000 clientes",
      "Até 2000 veículos",
      "Suporte prioritário",
      "Relatórios avançados",
      "Integração com sistemas",
      "14 dias de teste grátis",
    ],
    icon: Crown,
    popular: true,
  },
  {
    name: "enterprise",
    title: "Empresarial",
    description: "Para grandes operações",
    price: "R$ 199,90",
    period: "/mês",
    limits: {
      ordens: -1,
      clientes: -1,
      veiculos: -1,
    },
    features: [
      "Ordens ilimitadas",
      "Clientes ilimitados",
      "Veículos ilimitados",
      "Suporte 24/7",
      "Relatórios personalizados",
      "API completa",
      "Treinamento dedicado",
    ],
    icon: Building2,
    popular: false,
  },
];

export default function AssinaturasPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Planos de Assinatura
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Escolha o plano ideal para sua oficina e tenha acesso a todas as funcionalidades do Mech Magic Dash
        </p>
      </div>

      {/* Aviso */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema de Pagamentos em Desenvolvimento:</strong> O sistema de assinaturas com Stripe está sendo implementado.
          Por enquanto, você pode visualizar os planos disponíveis.
        </AlertDescription>
      </Alert>

      {/* Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.name}
              className={`relative transition-all duration-200 hover:shadow-lg ${plan.popular
                  ? "ring-2 ring-primary shadow-lg scale-105"
                  : "hover:shadow-md"
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Mais Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">{plan.title}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Limites */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Limites do Plano
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Ordens de Serviço</span>
                      <Badge variant="outline">
                        {plan.limits.ordens === -1 ? "Ilimitado" : plan.limits.ordens}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Clientes</span>
                      <Badge variant="outline">
                        {plan.limits.clientes === -1 ? "Ilimitado" : plan.limits.clientes}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Veículos</span>
                      <Badge variant="outline">
                        {plan.limits.veiculos === -1 ? "Ilimitado" : plan.limits.veiculos}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Recursos Inclusos
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Botão de Ação */}
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  disabled
                >
                  {plan.name === "pro" ? "Teste Grátis por 14 dias" : "Em Breve"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Informações Adicionais */}
      <div className="text-center space-y-4 pt-8">
        <h3 className="text-2xl font-semibold text-foreground">
          Dúvidas sobre os planos?
        </h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Entre em contato conosco para esclarecer dúvidas sobre os planos ou
          para solicitar um plano personalizado para sua oficina.
        </p>
      </div>
    </div>
  );
}