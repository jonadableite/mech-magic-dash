import { createAuthClient } from "better-auth/client";
import { nextCookies } from "better-auth/next-js";
import { stripeClient } from "@better-auth/stripe/client";

// Client de autenticação com Stripe (Single Responsibility Principle)
export const authClient = createAuthClient({
  baseURL: process.env.APP_URL || "http://localhost:3000",
  plugins: [
    nextCookies(),
    stripeClient({
      subscription: true, // Habilitar gerenciamento de assinaturas
    }),
  ],
});

// Re-export types for convenience
export type {
  User,
  Session,
  AuthState,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  ChangePasswordData,
  UpdateProfileData,
  TwoFactorSetupData,
  TwoFactorVerifyData,
  EmailOTPData,
  SocialProvider,
  AuthProvider,
  AuthService,
  AuthRepository,
  UserRole,
} from "@/lib/types/auth.types";
