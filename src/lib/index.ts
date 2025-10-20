/**
 * Library Index
 * Centralized exports following SOLID principles
 */

// Configuration
export { AppConfig } from "./config/app.config";
export type { AppConfigType } from "./config/app.config";

// Types
export * from "./types/common";
export * from "./types/auth.types";

// Services
export { emailService } from "./services/email.service";
export { urlService } from "./services/url.service";
export type {
  EmailService,
  EmailTemplate,
  EmailTemplates,
  SendEmailParams,
} from "./services/email.service";
export type { UrlService } from "./services/url.service";

// Utilities
export {
  formatBRL,
  formatBRLValue,
  parseCurrency,
  isValidCurrency,
} from "./currency";
export { ToastService } from "./toast";
export { ApiErrorHandler, createError, isExpectedError } from "./error-handler";

// Database
export { prisma } from "./prisma";

// Schemas
export * from "./schemas";
