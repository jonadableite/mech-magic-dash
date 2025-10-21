/**
 * Email Service
 * Simplified email service for development
 */

import type { ServiceResult } from "@/lib/types/common";

export interface EmailTemplate {
  subject: string;
  render: (props: any) => { __html: string };
}

export interface EmailTemplates {
  "organization-invite": EmailTemplate;
  "otp-code": EmailTemplate;
  "password-reset": EmailTemplate;
  "email-verification": EmailTemplate;
  welcome: EmailTemplate;
  "caixa-opened": EmailTemplate;
  "caixa-closed": EmailTemplate;
  "low-stock-alert": EmailTemplate;
  "appointment-reminder": EmailTemplate;
  "payment-confirmation": EmailTemplate;
}

export interface SendEmailParams<T extends keyof EmailTemplates> {
  to: string;
  template: T;
  data: EmailTemplates[T] extends EmailTemplate
    ? Parameters<EmailTemplates[T]["render"]>[0]
    : never;
  subject?: string;
  scheduledAt?: Date;
}

export interface EmailService {
  send<T extends keyof EmailTemplates>(
    params: SendEmailParams<T>
  ): Promise<ServiceResult<void>>;

  schedule<T extends keyof EmailTemplates>(
    params: SendEmailParams<T>,
    date: Date
  ): Promise<ServiceResult<void>>;

  sendBulk<T extends keyof EmailTemplates>(
    params: Array<SendEmailParams<T>>
  ): Promise<ServiceResult<void>>;

  validateEmail(email: string): boolean;

  getTemplates(): EmailTemplates;
}

class EmailServiceImpl implements EmailService {
  private templates: EmailTemplates;

  constructor() {
    this.templates = this.initializeTemplates();
  }

  async send<T extends keyof EmailTemplates>(
    params: SendEmailParams<T>
  ): Promise<ServiceResult<void>> {
    try {
      if (!this.validateEmail(params.to)) {
        return {
          success: false,
          error: {
            message: "Invalid email address",
            code: "INVALID_EMAIL",
            statusCode: 400,
          },
        };
      }

      // Para desenvolvimento, apenas logar o email
      console.log(`📧 [DEV] Email would be sent to ${params.to}`);
      console.log(
        `📧 [DEV] Subject: ${params.subject || this.templates[params.template].subject}`
      );
      console.log(`📧 [DEV] Template: ${params.template}`);
      console.log(`📧 [DEV] Data:`, params.data);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          code: "EMAIL_SEND_FAILED",
          statusCode: 500,
        },
      };
    }
  }

  async schedule<T extends keyof EmailTemplates>(
    params: SendEmailParams<T>,
    date: Date
  ): Promise<ServiceResult<void>> {
    try {
      if (!this.validateEmail(params.to)) {
        return {
          success: false,
          error: {
            message: "Invalid email address",
            code: "INVALID_EMAIL",
            statusCode: 400,
          },
        };
      }

      if (date.getTime() <= Date.now()) {
        return {
          success: false,
          error: {
            message: "Schedule date must be in the future",
            code: "INVALID_SCHEDULE_DATE",
            statusCode: 400,
          },
        };
      }

      // Para desenvolvimento, apenas logar o agendamento
      console.log(
        `📧 [DEV] Email scheduled for ${date.toISOString()} to ${params.to}`
      );
      console.log(`📧 [DEV] Template: ${params.template}`);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          code: "EMAIL_SCHEDULE_FAILED",
          statusCode: 500,
        },
      };
    }
  }

  async sendBulk<T extends keyof EmailTemplates>(
    params: Array<SendEmailParams<T>>
  ): Promise<ServiceResult<void>> {
    try {
      const results = await Promise.allSettled(
        params.map((param) => this.send(param))
      );

      const failures = results.filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected"
      );

      if (failures.length > 0) {
        return {
          success: false,
          error: {
            message: `${failures.length} emails failed to send`,
            code: "BULK_EMAIL_PARTIAL_FAILURE",
            statusCode: 207,
            details: failures.map((f) => f.reason),
          },
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          code: "BULK_EMAIL_FAILED",
          statusCode: 500,
        },
      };
    }
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getTemplates(): EmailTemplates {
    return this.templates;
  }

  private initializeTemplates(): EmailTemplates {
    return {
      "organization-invite": {
        subject: "Convite para organização",
        render: ({ email, organization, url }) => ({
          __html: `
            <div>
              <h1>Você foi convidado para ${organization}</h1>
              <p>Olá, você foi convidado para participar da organização ${organization}.</p>
              <p>Clique no link abaixo para aceitar o convite:</p>
              <a href="${url}">Aceitar Convite</a>
            </div>
          `,
        }),
      },
      "otp-code": {
        subject: "Código de verificação",
        render: ({ email, otpCode, expiresInMinutes }) => ({
          __html: `
            <div>
              <h1>Código de verificação</h1>
              <p>Seu código de verificação é: <strong>${otpCode}</strong></p>
              <p>Este código expira em ${expiresInMinutes} minutos.</p>
            </div>
          `,
        }),
      },
      "password-reset": {
        subject: "Redefinir senha",
        render: ({ email, url, expiresInMinutes }) => ({
          __html: `
            <div>
              <h1>Redefinir senha</h1>
              <p>Clique no link abaixo para redefinir sua senha:</p>
              <a href="${url}">Redefinir Senha</a>
              <p>Este link expira em ${expiresInMinutes} minutos.</p>
            </div>
          `,
        }),
      },
      "email-verification": {
        subject: "Verificar email",
        render: ({ email, url, expiresInMinutes }) => ({
          __html: `
            <div>
              <h1>Verificar email</h1>
              <p>Clique no link abaixo para verificar seu email:</p>
              <a href="${url}">Verificar Email</a>
              <p>Este link expira em ${expiresInMinutes} minutos.</p>
            </div>
          `,
        }),
      },
      welcome: {
        subject: "Bem-vindo ao Mech Magic Dash",
        render: ({ name, organization }) => ({
          __html: `
            <div>
              <h1>Bem-vindo, ${name}!</h1>
              <p>Seja bem-vindo ao Mech Magic Dash${organization ? ` - ${organization}` : ""}.</p>
              <p>Comece explorando as funcionalidades disponíveis.</p>
            </div>
          `,
        }),
      },
      "caixa-opened": {
        subject: "Caixa aberto",
        render: ({ valorInicial, usuario, observacoes }) => ({
          __html: `
            <div>
              <h1>Caixa aberto</h1>
              <p>O caixa foi aberto por ${usuario} com valor inicial de R$ ${valorInicial}.</p>
              ${observacoes ? `<p>Observações: ${observacoes}</p>` : ""}
            </div>
          `,
        }),
      },
      "caixa-closed": {
        subject: "Caixa fechado",
        render: ({ valorFinal, usuario, observacoes, movimentacoes }) => ({
          __html: `
            <div>
              <h1>Caixa fechado</h1>
              <p>O caixa foi fechado por ${usuario} com valor final de R$ ${valorFinal}.</p>
              <p>Total de movimentações: ${movimentacoes}</p>
              ${observacoes ? `<p>Observações: ${observacoes}</p>` : ""}
            </div>
          `,
        }),
      },
      "low-stock-alert": {
        subject: "Alerta de estoque baixo",
        render: ({ produtos }) => ({
          __html: `
            <div>
              <h1>Alerta de estoque baixo</h1>
              <p>Os seguintes produtos estão com estoque baixo:</p>
              <ul>
                ${produtos
                  .map(
                    (produto: any) => `
                  <li>
                    ${produto.nome} - Estoque: ${produto.quantidade} (Mínimo: ${produto.quantidadeMinima})
                  </li>
                `
                  )
                  .join("")}
              </ul>
            </div>
          `,
        }),
      },
      "appointment-reminder": {
        subject: "Lembrete de agendamento",
        render: ({ cliente, veiculo, data, hora, servico }) => ({
          __html: `
            <div>
              <h1>Lembrete de agendamento</h1>
              <p>Olá ${cliente},</p>
              <p>Este é um lembrete do seu agendamento:</p>
              <ul>
                <li>Veículo: ${veiculo}</li>
                <li>Data: ${data}</li>
                <li>Hora: ${hora}</li>
                <li>Serviço: ${servico}</li>
              </ul>
            </div>
          `,
        }),
      },
      "payment-confirmation": {
        subject: "Confirmação de pagamento",
        render: ({ valor, metodo, data, referencia }) => ({
          __html: `
            <div>
              <h1>Pagamento confirmado</h1>
              <p>Seu pagamento foi processado com sucesso:</p>
              <ul>
                <li>Valor: R$ ${valor}</li>
                <li>Método: ${metodo}</li>
                <li>Data: ${data}</li>
                <li>Referência: ${referencia}</li>
              </ul>
            </div>
          `,
        }),
      },
    };
  }
}

// Singleton instance
export const emailService = new EmailServiceImpl();

// Export types for external use
export type {
  EmailTemplate as EmailTemplateType,
  EmailTemplates as EmailTemplatesType,
  SendEmailParams as SendEmailParamsType,
};
