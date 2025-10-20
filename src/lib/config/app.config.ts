/**
 * Application Configuration
 * Centralized configuration following SOLID principles
 */

export interface AppConfigType {
  name: string;
  url: string;
  environment: "development" | "production" | "test";
  providers: {
    auth: {
      secret: string;
      providers: {
        github: {
          clientId: string;
          clientSecret: string;
        };
        google: {
          clientId: string;
          clientSecret: string;
        };
      };
    };
    mail: {
      secret: string;
      from: string;
      adapter: "smtp" | "resend";
    };
    database: {
      url: string;
    };
  };
}

export const AppConfig: AppConfigType = {
  name: process.env.APP_NAME || "Mech Magic Dash",
  url: process.env.APP_URL || "http://localhost:3000",
  environment:
    (process.env.NODE_ENV as AppConfigType["environment"]) || "development",
  providers: {
    auth: {
      secret:
        process.env.BETTER_AUTH_SECRET ||
        "6oQe9EL7dnzk7Kqd1gAV0p1eHwDTysR3mK8pL9nQ2rS4tU6vW7xY8zA1bC3dE5fG",
      providers: {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID || "",
          clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        },
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID || "",
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
      },
    },
    mail: {
      adapter: (process.env.MAIL_ADAPTER as "smtp" | "resend") || "smtp",
      from:
        process.env.SMTP_SENDER_EMAIL || "WhatLead <contato@whatlead.com.br>",
      secret: `smtp://${encodeURIComponent(
        process.env.SMTP_USERNAME ?? ""
      )}:${encodeURIComponent(process.env.SMTP_PASSWORD ?? "")}@${
        process.env.SMTP_HOST ?? "smtp.zoho.com"
      }:${process.env.SMTP_PORT ?? "587"}`,
    },

    database: {
      url:
        process.env.DATABASE_URL ||
        "postgres://postgres:91238983Jonadab@painel.whatlead.com.br:5432/oficina",
    },
  },
};
