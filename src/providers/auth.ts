import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { emailOTP, organization, twoFactor } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { AppConfig } from "@/lib/config/app.config";
import { emailService } from "@/lib/services/email.service";
import { urlService } from "@/lib/services/url.service";
import type { Prettify } from "@/lib/types/common";
import type { Organization } from "@/@saas-boilerplate/features/organization";
import type { Membership } from "@/@saas-boilerplate/features/membership";
import type { Invitation } from "@/@saas-boilerplate/features/invitation";

export const auth = betterAuth({
  appName: AppConfig.name,
  baseURL: AppConfig.url,

  secret: AppConfig.providers.auth.secret,

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

  plugins: [
    nextCookies(),
    twoFactor({
      issuer: AppConfig.name,
    }),
    organization({
      sendInvitationEmail: async ({ email, organization, id }) => {
        const result = await emailService.send({
          to: email,
          template: "organization-invite",
          data: {
            email,
            organization: organization.name,
            url: urlService.get(`/auth?invitation=${id}`),
          },
        });

        if (!result.success) {
          throw new Error(
            `Failed to send invitation email: ${result.error?.message}`
          );
        }
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // Define subject based on OTP type using object mapping
        const subjectMap = {
          "sign-in": "Seu Código de Acesso",
          "email-verification": "Verificar Seu Email",
          "forget-password": "Recuperação de Senha",
          default: "Código de Verificação",
        };

        const subject = subjectMap[type] || subjectMap.default;

        // Send the email with the OTP code
        const result = await emailService.send({
          to: email,
          template: "otp-code",
          data: {
            email,
            otpCode: otp,
            expiresInMinutes: 10, // Default expiration time
          },
        });

        if (!result.success) {
          throw new Error(`Failed to send OTP email: ${result.error?.message}`);
        }
      },
    }),
  ],
});

/**
 * @description The session of the application
 */
export type AuthSession = typeof auth.$Infer.Session;
export type AuthOrganization = Prettify<
  Organization & {
    members: Prettify<
      Membership & {
        user: {
          id: string;
          name: string;
          email: string;
          image?: string | null;
        };
      }
    >[];
    invitations: Invitation[];
  }
>;

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
