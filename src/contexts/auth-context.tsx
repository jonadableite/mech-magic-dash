"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  enable2FA: () => Promise<{ qrCode: string; secret: string } | null>;
  verify2FA: (code: string) => Promise<boolean>;
  disable2FA: (code: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isInitialized: false,
  });

  const fetchSession = async () => {
    try {
      console.log("fetchSession: Iniciando busca de sessão");
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await fetch("/api/auth/session");
      console.log("fetchSession: Response status:", response.status);

      const data = await response.json();
      console.log("fetchSession: Response data:", data);

      if (data.user) {
        console.log("fetchSession: Usuário encontrado:", data.user);
        setState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          isInitialized: true,
        });
      } else {
        console.log("fetchSession: Nenhum usuário encontrado");
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          isInitialized: true,
        });
      }
    } catch (error) {
      console.error("Failed to fetch session:", error);
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        isInitialized: true,
      });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, action: "signin" }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        await fetchSession();
        toast({
          title: "Login realizado",
          description: "Bem-vindo de volta!",
        });
        return true;
      } else {
        toast({
          title: "Erro no login",
          description: data.error || "Credenciais inválidas",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, action: "signup" }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        await fetchSession();
        toast({
          title: "Conta criada",
          description: "Sua conta foi criada com sucesso!",
        });
        return true;
      } else {
        toast({
          title: "Erro no cadastro",
          description: data.error || "Erro ao criar conta",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Register error:", error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "signout" }),
      });

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        isInitialized: true,
      });
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      router.push("/signin");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao fazer logout.",
        variant: "destructive",
      });
    }
  };

  const refreshSession = async (): Promise<void> => {
    await fetchSession();
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      // Implementar atualização de perfil
      // const response = await authApi.updateProfile(data);
      // if (response.success) {
      //   await fetchSession();
      //   return true;
      // }
      return false;
    } catch (error) {
      console.error("Update profile error:", error);
      return false;
    }
  };

  const enable2FA = async (): Promise<{ qrCode: string; secret: string } | null> => {
    try {
      // TODO: Implementar 2FA
      return null;
    } catch (error) {
      console.error("Enable 2FA error:", error);
      return null;
    }
  };

  const verify2FA = async (code: string): Promise<boolean> => {
    try {
      // TODO: Implementar verificação 2FA
      return false;
    } catch (error) {
      console.error("Verify 2FA error:", error);
      return false;
    }
  };

  const disable2FA = async (code: string): Promise<boolean> => {
    try {
      // TODO: Implementar desabilitação 2FA
      return false;
    } catch (error) {
      console.error("Disable 2FA error:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshSession,
    updateProfile,
    enable2FA,
    verify2FA,
    disable2FA,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
