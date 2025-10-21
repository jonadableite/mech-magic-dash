/**
 * Hook para gerenciar perfil do usuário (Single Responsibility Principle)
 */

import { useState, useCallback } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { apiClient, ApiResponse } from "@/lib/api";
import type {
  UserProfile,
  UpdateProfileData,
  ChangePasswordData,
  ProfileStats,
} from "@/types/profile.types";

// Service class para gerenciar perfil (Single Responsibility Principle)
class ProfileService {
  // Buscar perfil do usuário
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>("/profile");
    if (!response.success) {
      throw new Error(response.message || "Erro ao buscar perfil");
    }
    return response.data;
  }

  // Atualizar perfil
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>("/profile", data);
    if (!response.success) {
      throw new Error(response.message || "Erro ao atualizar perfil");
    }
    return response.data;
  }

  // Alterar senha
  async changePassword(data: ChangePasswordData): Promise<void> {
    const response = await apiClient.put<void>("/profile/password", data);
    if (!response.success) {
      throw new Error(response.message || "Erro ao alterar senha");
    }
  }

  // Upload de avatar
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await apiClient.post<{ url: string }>(
      "/profile/avatar",
      formData
    );

    if (!response.success) {
      throw new Error(response.message || "Erro ao fazer upload do avatar");
    }

    return response.data.url;
  }

  // Buscar estatísticas do perfil
  async getProfileStats(): Promise<ProfileStats> {
    const response = await apiClient.get<ProfileStats>("/profile/stats");
    if (!response.success) {
      throw new Error(response.message || "Erro ao buscar estatísticas");
    }
    return response.data;
  }
}

// Instância do serviço (Singleton Pattern)
const profileService = new ProfileService();

// Hooks personalizados (Custom Hooks Pattern)
export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR(
    "profile",
    () => profileService.getProfile(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 segundos
    }
  );

  return {
    profile: data,
    isLoading,
    error,
    mutate,
  };
}

export function useProfileStats() {
  const { data, error, isLoading, mutate } = useSWR(
    "profile-stats",
    () => profileService.getProfileStats(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minuto
    }
  );

  return {
    stats: data,
    isLoading: isLoading,
    error,
    mutate,
  };
}

export function useUpdateProfile() {
  const { mutate } = useProfile();

  const updateProfile = useCallback(
    async (data: UpdateProfileData) => {
      try {
        const updatedProfile = await profileService.updateProfile(data);

        toast.success("Perfil atualizado com sucesso!");

        // Revalidar dados após atualização
        await mutate();

        return updatedProfile;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erro ao atualizar perfil";
        toast.error(message);
        throw error;
      }
    },
    [mutate]
  );

  return { updateProfile };
}

export function useChangePassword() {
  const changePassword = useCallback(async (data: ChangePasswordData) => {
    try {
      await profileService.changePassword(data);
      toast.success("Senha alterada com sucesso!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao alterar senha";
      toast.error(message);
      throw error;
    }
  }, []);

  return { changePassword };
}

export function useUploadAvatar() {
  const { mutate } = useProfile();

  const uploadAvatar = useCallback(
    async (file: File) => {
      try {
        const avatarUrl = await profileService.uploadAvatar(file);

        toast.success("Avatar atualizado com sucesso!");

        // Revalidar dados após upload
        await mutate();

        return avatarUrl;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro ao fazer upload do avatar";
        toast.error(message);
        throw error;
      }
    },
    [mutate]
  );

  return { uploadAvatar };
}
