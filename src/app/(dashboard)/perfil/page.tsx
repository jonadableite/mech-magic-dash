"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, User, Settings, Shield, BarChart3 } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { ProfileForm } from "@/components/profile/profile-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { ProfileStats } from "@/components/profile/profile-stats";
import type { UserProfile } from "@/types/profile.types";

export default function PerfilPage() {
  const { profile, isLoading, error } = useProfile();
  const [updatedProfile, setUpdatedProfile] = useState<UserProfile | null>(null);

  const handleProfileUpdate = (newProfile: UserProfile) => {
    setUpdatedProfile(newProfile);
  };

  const handleAvatarChange = (newAvatarUrl: string) => {
    if (profile) {
      setUpdatedProfile({
        ...profile,
        avatar: newAvatarUrl,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
                <Skeleton className="h-3 w-48 mx-auto" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar perfil: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Perfil não encontrado
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Usar perfil atualizado se disponível
  const currentProfile = updatedProfile || profile;

  return (
    <div className="container mx-auto p-4 space-y-6" data-tour="perfil">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e configurações da conta
        </p>
      </div>

      {/* Estatísticas */}
      <ProfileStats />

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Upload - Mobile First */}
        <div className="lg:col-span-1 order-1 lg:order-1">
          <AvatarUpload
            profile={currentProfile}
            onAvatarChange={handleAvatarChange}
          />
        </div>

        {/* Tabs - Mobile First */}
        <div className="lg:col-span-2 order-2 lg:order-2">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Pessoal</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Segurança</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Estatísticas</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-6">
              <ProfileForm
                profile={currentProfile}
                onProfileUpdate={handleProfileUpdate}
              />
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <ChangePasswordForm />
            </TabsContent>

            <TabsContent value="stats" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Estatísticas Detalhadas</span>
                  </CardTitle>
                  <CardDescription>
                    Visão geral das suas atividades na plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileStats className="grid-cols-1 md:grid-cols-2" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Informações da Conta</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Membro desde:</span>
              <p className="text-foreground">
                {new Date(currentProfile.createdAt).toLocaleDateString("pt-BR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Última atualização:</span>
              <p className="text-foreground">
                {new Date(currentProfile.updatedAt).toLocaleDateString("pt-BR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Status da conta:</span>
              <p className={`font-medium ${currentProfile.ativo ? "text-green-600" : "text-red-600"}`}>
                {currentProfile.ativo ? "Ativa" : "Inativa"}
              </p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Tipo de usuário:</span>
              <p className="text-foreground capitalize">
                {currentProfile.role.toLowerCase()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
