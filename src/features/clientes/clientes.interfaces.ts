import { z } from "zod";
import { BaseEntity, StatusOrdem, Prioridade } from "../shared";

// Schemas de validação para clientes
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

// Interfaces TypeScript
export interface Cliente extends BaseEntity {
  nome: string;
  email: string;
  telefone: string;
  endereco?: string;
  veiculos?: Veiculo[];
  ordens?: OrdemServico[];
}

export interface Veiculo extends BaseEntity {
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  cor?: string;
  observacoes?: string;
  clienteId: string;
  cliente?: Cliente;
}

export interface OrdemServico extends BaseEntity {
  numero: string;
  descricao: string;
  status: StatusOrdem;
  prioridade: Prioridade;
  valorTotal: number;
  dataAbertura: string;
  dataFechamento?: string;
  observacoes?: string;
  clienteId: string;
  veiculoId: string;
  cliente?: Cliente;
  veiculo?: Veiculo;
  itens?: ItemOrdemServico[];
}

export interface ItemOrdemServico extends BaseEntity {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  observacoes?: string;
  ordemId: string;
  ordem?: OrdemServico;
}

// Tipos inferidos dos schemas
export type CreateClienteData = z.infer<typeof createClienteSchema>;
export type UpdateClienteData = z.infer<typeof updateClienteSchema>;

// Tipos para operações específicas
export interface ClienteWithRelations extends Cliente {
  veiculos: Veiculo[];
  ordens: OrdemServico[];
}

export interface ClienteStats {
  totalClientes: number;
  clientesAtivos: number;
  ordensEmAndamento: number;
  receitaTotal: number;
}
