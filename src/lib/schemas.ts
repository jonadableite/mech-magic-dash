import { z } from "zod";

// Esquemas de validação para clientes
export const createClienteSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  telefone: z
    .string()
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .max(20, "Telefone muito longo"),
  endereco: z.string().max(255, "Endereço muito longo").optional(),
});

export const updateClienteSchema = createClienteSchema.partial().extend({
  id: z.string().cuid("ID inválido"),
});

// Esquemas de validação para produtos
export const createProdutoSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  descricao: z.string().max(500, "Descrição muito longa").optional(),
  codigo: z
    .string()
    .min(1, "Código é obrigatório")
    .max(50, "Código muito longo"),
  preco: z.number().positive("Preço deve ser positivo"),
  quantidade: z.number().int().min(0, "Quantidade não pode ser negativa"),
  quantidadeMinima: z
    .number()
    .int()
    .min(0, "Quantidade mínima não pode ser negativa"),
  categoria: z.string().max(100, "Categoria muito longa").optional(),
  fornecedor: z.string().max(100, "Fornecedor muito longo").optional(),
});

export const updateProdutoSchema = createProdutoSchema.partial().extend({
  id: z.string().cuid("ID inválido"),
});

// Esquemas de validação para ordens de serviço
export const createOrdemServicoSchema = z.object({
  clienteId: z.string().cuid("ID do cliente inválido"),
  veiculoId: z.string().cuid("ID do veículo inválido"),
  descricao: z
    .string()
    .min(5, "Descrição deve ter pelo menos 5 caracteres")
    .max(500, "Descrição muito longa"),
  prioridade: z.enum(["BAIXA", "MEDIA", "ALTA", "URGENTE"]),
  observacoes: z.string().max(500, "Observações muito longas").optional(),
});

export const updateOrdemServicoSchema = createOrdemServicoSchema
  .partial()
  .extend({
    id: z.string().cuid("ID inválido"),
    status: z
      .enum([
        "ABERTA",
        "EM_ANDAMENTO",
        "AGUARDANDO_PECAS",
        "FINALIZADA",
        "CANCELADA",
      ])
      .optional(),
  });

// Esquemas de validação para veículos
export const createVeiculoSchema = z.object({
  clienteId: z.string().cuid("ID do cliente inválido"),
  marca: z
    .string()
    .min(2, "Marca deve ter pelo menos 2 caracteres")
    .max(50, "Marca muito longa"),
  modelo: z
    .string()
    .min(2, "Modelo deve ter pelo menos 2 caracteres")
    .max(50, "Modelo muito longo"),
  ano: z
    .number()
    .int()
    .min(1900, "Ano inválido")
    .max(new Date().getFullYear() + 1, "Ano muito futuro"),
  placa: z
    .string()
    .min(7, "Placa deve ter pelo menos 7 caracteres")
    .max(8, "Placa muito longa"),
  cor: z.string().max(30, "Cor muito longa").optional(),
  observacoes: z.string().max(500, "Observações muito longas").optional(),
});

export const updateVeiculoSchema = createVeiculoSchema.partial().extend({
  id: z.string().cuid("ID inválido"),
});

// Tipos TypeScript inferidos dos esquemas
export type CreateClienteData = z.infer<typeof createClienteSchema>;
export type UpdateClienteData = z.infer<typeof updateClienteSchema>;
export type CreateProdutoData = z.infer<typeof createProdutoSchema>;
export type UpdateProdutoData = z.infer<typeof updateProdutoSchema>;
export type CreateOrdemServicoData = z.infer<typeof createOrdemServicoSchema>;
export type UpdateOrdemServicoData = z.infer<typeof updateOrdemServicoSchema>;
export type CreateVeiculoData = z.infer<typeof createVeiculoSchema>;
export type UpdateVeiculoData = z.infer<typeof updateVeiculoSchema>;
