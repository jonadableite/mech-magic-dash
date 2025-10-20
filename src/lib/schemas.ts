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

// Schemas para Agendamentos
export const createAgendamentoSchema = z.object({
  dataHora: z.string().min(1, "Data e hora são obrigatórias"),
  descricao: z
    .string()
    .min(5, "Descrição deve ter pelo menos 5 caracteres")
    .max(500, "Descrição muito longa"),
  observacoes: z.string().max(1000, "Observações muito longas").optional(),
  clienteId: z.string().min(1, "Cliente é obrigatório"),
  veiculoId: z.string().min(1, "Veículo é obrigatório"),
});

export const updateAgendamentoSchema = z.object({
  dataHora: z.string().min(1, "Data e hora são obrigatórias").optional(),
  descricao: z
    .string()
    .min(5, "Descrição deve ter pelo menos 5 caracteres")
    .max(500, "Descrição muito longa")
    .optional(),
  observacoes: z.string().max(1000, "Observações muito longas").optional(),
  status: z
    .enum([
      "AGENDADO",
      "CONFIRMADO",
      "EM_ANDAMENTO",
      "FINALIZADO",
      "CANCELADO",
      "FALTOU",
    ])
    .optional(),
  clienteId: z.string().min(1, "Cliente é obrigatório").optional(),
  veiculoId: z.string().min(1, "Veículo é obrigatório").optional(),
});

export type CreateAgendamentoData = z.infer<typeof createAgendamentoSchema>;
export type UpdateAgendamentoData = z.infer<typeof updateAgendamentoSchema>;

// Interface para Agendamento baseada no schema do Prisma
export interface Agendamento {
  id: string;
  dataHora: string;
  descricao: string;
  status:
    | "AGENDADO"
    | "CONFIRMADO"
    | "EM_ANDAMENTO"
    | "FINALIZADO"
    | "CANCELADO"
    | "FALTOU";
  observacoes?: string | null;
  createdAt: string;
  updatedAt: string;
  clienteId: string;
  veiculoId: string;
}

// ===== SCHEMAS FINANCEIROS =====

// Schemas para Caixa
export const createCaixaSchema = z.object({
  valorInicial: z.number().min(0, "Valor inicial deve ser positivo").default(0),
  observacoes: z.string().max(500, "Observações muito longas").optional(),
});

export const updateCaixaSchema = z.object({
  valorFinal: z.number().min(0, "Valor final deve ser positivo").optional(),
  observacoes: z.string().max(500, "Observações muito longas").optional(),
  status: z.enum(["ABERTO", "FECHADO"]).optional(),
});

// Schemas para Movimentação de Caixa
export const createMovimentacaoSchema = z.object({
  tipo: z.enum(["ENTRADA", "SAIDA"]),
  valor: z.number().min(0.01, "Valor deve ser maior que zero"),
  descricao: z
    .string()
    .min(3, "Descrição deve ter pelo menos 3 caracteres")
    .max(200, "Descrição muito longa"),
  categoria: z.enum([
    "VENDAS",
    "SERVICOS",
    "PAGAMENTOS",
    "RECEBIMENTOS",
    "DESPESAS",
    "INVESTIMENTOS",
    "OUTROS",
  ]),
  observacoes: z.string().max(500, "Observações muito longas").optional(),
  ordemId: z.string().optional(),
});

export const updateMovimentacaoSchema = z.object({
  tipo: z.enum(["ENTRADA", "SAIDA"]).optional(),
  valor: z.number().min(0.01, "Valor deve ser maior que zero").optional(),
  descricao: z
    .string()
    .min(3, "Descrição deve ter pelo menos 3 caracteres")
    .max(200, "Descrição muito longa")
    .optional(),
  categoria: z
    .enum([
      "VENDAS",
      "SERVICOS",
      "PAGAMENTOS",
      "RECEBIMENTOS",
      "DESPESAS",
      "INVESTIMENTOS",
      "OUTROS",
    ])
    .optional(),
  observacoes: z.string().max(500, "Observações muito longas").optional(),
});

// Schemas para Contas a Pagar
export const createContaPagarSchema = z.object({
  descricao: z
    .string()
    .min(3, "Descrição deve ter pelo menos 3 caracteres")
    .max(200, "Descrição muito longa"),
  valor: z.number().min(0.01, "Valor deve ser maior que zero"),
  dataVencimento: z.string().min(1, "Data de vencimento é obrigatória"),
  categoria: z.enum([
    "FORNECEDORES",
    "FUNCIONARIOS",
    "TAXAS",
    "IMPOSTOS",
    "MANUTENCAO",
    "OUTROS",
  ]),
  fornecedor: z.string().max(100, "Nome do fornecedor muito longo").optional(),
  observacoes: z.string().max(500, "Observações muito longas").optional(),
});

export const updateContaPagarSchema = z.object({
  descricao: z
    .string()
    .min(3, "Descrição deve ter pelo menos 3 caracteres")
    .max(200, "Descrição muito longa")
    .optional(),
  valor: z.number().min(0.01, "Valor deve ser maior que zero").optional(),
  dataVencimento: z
    .string()
    .min(1, "Data de vencimento é obrigatória")
    .optional(),
  dataPagamento: z.string().optional(),
  status: z.enum(["PENDENTE", "PAGO", "VENCIDO", "CANCELADO"]).optional(),
  categoria: z
    .enum([
      "FORNECEDORES",
      "FUNCIONARIOS",
      "TAXAS",
      "IMPOSTOS",
      "MANUTENCAO",
      "OUTROS",
    ])
    .optional(),
  fornecedor: z.string().max(100, "Nome do fornecedor muito longo").optional(),
  observacoes: z.string().max(500, "Observações muito longas").optional(),
});

// Schemas para Contas a Receber
export const createContaReceberSchema = z.object({
  descricao: z
    .string()
    .min(3, "Descrição deve ter pelo menos 3 caracteres")
    .max(200, "Descrição muito longa"),
  valor: z.number().min(0.01, "Valor deve ser maior que zero"),
  dataVencimento: z.string().min(1, "Data de vencimento é obrigatória"),
  categoria: z.enum(["CLIENTES", "OUTROS"]),
  clienteId: z.string().optional(),
  observacoes: z.string().max(500, "Observações muito longas").optional(),
});

export const updateContaReceberSchema = z.object({
  descricao: z
    .string()
    .min(3, "Descrição deve ter pelo menos 3 caracteres")
    .max(200, "Descrição muito longa")
    .optional(),
  valor: z.number().min(0.01, "Valor deve ser maior que zero").optional(),
  dataVencimento: z
    .string()
    .min(1, "Data de vencimento é obrigatória")
    .optional(),
  dataRecebimento: z.string().optional(),
  status: z.enum(["PENDENTE", "PAGO", "VENCIDO", "CANCELADO"]).optional(),
  categoria: z.enum(["CLIENTES", "OUTROS"]).optional(),
  clienteId: z.string().optional(),
  observacoes: z.string().max(500, "Observações muito longas").optional(),
});

// Schemas para Comissões
export const createComissaoSchema = z.object({
  funcionario: z
    .string()
    .min(2, "Nome do funcionário deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  valor: z.number().min(0.01, "Valor deve ser maior que zero"),
  percentual: z
    .number()
    .min(0, "Percentual deve ser positivo")
    .max(100, "Percentual não pode ser maior que 100"),
  ordemId: z.string().min(1, "Ordem de serviço é obrigatória"),
  observacoes: z.string().max(500, "Observações muito longas").optional(),
});

export const updateComissaoSchema = z.object({
  funcionario: z
    .string()
    .min(2, "Nome do funcionário deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .optional(),
  valor: z.number().min(0.01, "Valor deve ser maior que zero").optional(),
  percentual: z
    .number()
    .min(0, "Percentual deve ser positivo")
    .max(100, "Percentual não pode ser maior que 100")
    .optional(),
  dataPagamento: z.string().optional(),
  status: z.enum(["PENDENTE", "PAGO", "CANCELADO"]).optional(),
  observacoes: z.string().max(500, "Observações muito longas").optional(),
});

// Types para os schemas
export type CreateCaixaData = z.infer<typeof createCaixaSchema>;
export type UpdateCaixaData = z.infer<typeof updateCaixaSchema>;
export type CreateMovimentacaoData = z.infer<typeof createMovimentacaoSchema>;
export type UpdateMovimentacaoData = z.infer<typeof updateMovimentacaoSchema>;
export type CreateContaPagarData = z.infer<typeof createContaPagarSchema>;
export type UpdateContaPagarData = z.infer<typeof updateContaPagarSchema>;
export type CreateContaReceberData = z.infer<typeof createContaReceberSchema>;
export type UpdateContaReceberData = z.infer<typeof updateContaReceberSchema>;
export type CreateComissaoData = z.infer<typeof createComissaoSchema>;
export type UpdateComissaoData = z.infer<typeof updateComissaoSchema>;
