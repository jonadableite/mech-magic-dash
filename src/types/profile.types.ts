/**
 * Tipos para o perfil do usuário (Single Responsibility Principle)
 */

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  avatar?: string;
  role: "ADMIN" | "GERENTE" | "USUARIO";
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileData {
  nome?: string;
  telefone?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  senhaAtual: string;
  novaSenha: string;
  confirmarSenha: string;
}

export interface ProfileFormData {
  nome: string;
  email: string;
  telefone: string;
  avatar?: File;
}

export interface ProfileStats {
  totalClientes: number;
  totalVeiculos: number;
  totalOrdens: number;
  totalProdutos: number;
}
