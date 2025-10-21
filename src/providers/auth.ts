import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { emailOTP, organization, twoFactor } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { AppConfig } from "@/lib/config/app.config";
import { emailService } from "@/lib/services/email.service";
import { urlService } from "@/lib/services/url.service";

// Configuração do Stripe (Single Responsibility Principle)
let stripeClient: Stripe | null = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil", // Versão compatível com Stripe v18
    });
  }
} catch (error) {
  console.warn("Stripe não configurado:", error);
}

import type { Prettify } from "@/lib/types/common";

export const auth = betterAuth({
  appName: "Mech Magic Dash",
  baseURL: process.env.APP_URL || "http://localhost:3000",

  secret:
    process.env.BETTER_AUTH_SECRET ||
    "6oQe9EL7dnzk7Kqd1gAV0p1eHwDTysR3mK8pL9nQ2rS4tU6vW7xY8zA1bC3dE5fG",

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Habilita autenticação por email e senha
  emailAndPassword: {
    enabled: true,
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
    },
  },

  socialProviders: {
    github: {
      clientId: AppConfig.providers.auth.providers.github.clientId,
      clientSecret: AppConfig.providers.auth.providers.github.clientSecret,
    },
    google: {
      clientId: AppConfig.providers.auth.providers.google.clientId,
      clientSecret: AppConfig.providers.auth.providers.google.clientSecret,
    },
  },

  account: {
    accountLinking: {
      enabled: true,
    },
  },

  plugins: [nextCookies()],
});

/**
 * @description The session of the application
 */
export type AuthSession = typeof auth.$Infer.Session;

// Re-export types for convenience
export type {
  User,
  Organization,
  Membership,
  Invitation,
  Session,
  AuthState,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  ChangePasswordData,
  UpdateProfileData,
  CreateOrganizationData,
  UpdateOrganizationData,
  InviteUserData,
  AcceptInvitationData,
  RejectInvitationData,
  UpdateMembershipData,
  RemoveMembershipData,
  TwoFactorSetupData,
  TwoFactorVerifyData,
  EmailOTPData,
  SocialProvider,
  AuthProvider,
  AuthConfig,
  AuthService,
  OrganizationService,
  AuthRepository,
  UserRole,
  MembershipRole,
  MembershipStatus,
  InvitationStatus,
} from "@/lib/types/auth.types";
