import { z } from "zod";

// Schemas compartilhados para validação

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const idSchema = z.object({
  id: z.string().cuid("ID inválido"),
});

export const searchSchema = z.object({
  q: z.string().min(1, "Termo de busca é obrigatório"),
});

// Schemas para validação de campos comuns
export const nomeSchema = z
  .string()
  .min(2, "Nome deve ter pelo menos 2 caracteres")
  .max(100, "Nome muito longo");

export const emailSchema = z
  .string()
  .email("Email inválido")
  .max(255, "Email muito longo");

export const telefoneSchema = z
  .string()
  .min(10, "Telefone deve ter pelo menos 10 dígitos")
  .max(20, "Telefone muito longo");

export const enderecoSchema = z
  .string()
  .max(255, "Endereço muito longo")
  .optional();

export const observacoesSchema = z
  .string()
  .max(500, "Observações muito longas")
  .optional();

// Enums para validação
export const statusOrdemSchema = z.enum([
  "ABERTA",
  "EM_ANDAMENTO",
  "AGUARDANDO_PECAS",
  "FINALIZADA",
  "CANCELADA",
]);

export const prioridadeSchema = z.enum(["BAIXA", "MEDIA", "ALTA", "URGENTE"]);
