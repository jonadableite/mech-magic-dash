"use client";

import { useState, useCallback } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { Badge } from "@/components/ui/badge";
import { Camera, User, Loader2 } from "lucide-react";
import { useUploadAvatar } from "@/hooks/use-profile";
import type { UserProfile } from "@/types/profile.types";

interface AvatarUploadProps {
  profile: UserProfile;
  onAvatarChange?: (newAvatarUrl: string) => void;
}

export function AvatarUpload({ profile, onAvatarChange }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { uploadAvatar } = useUploadAvatar();

  const handleFileChange = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    try {
      const newAvatarUrl = await uploadAvatar(file);
      onAvatarChange?.(newAvatarUrl);
    } catch (error) {
      console.error("Erro ao fazer upload do avatar:", error);
    } finally {
      setIsUploading(false);
    }
  }, [uploadAvatar, onAvatarChange]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "destructive";
      case "gerente":
        return "default";
      default:
        return "secondary";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "Administrador";
      case "gerente":
        return "Gerente";
      default:
        return "Usuário";
    }
  };

  return (
    <Card className="w-full relative overflow-hidden">
      <DottedGlowBackground
        gap={20}
        radius={2}
        color="hsl(var(--primary) / 0.2)"
        glowColor="hsl(var(--primary) / 0.6)"
        opacity={0.3}
      />
      <CardHeader className="text-center relative z-10">
        <CardTitle className="text-lg">Foto do Perfil</CardTitle>
        <CardDescription>
          Faça upload de uma nova foto para seu perfil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        {/* Avatar atual */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24 ring-4 ring-background ring-offset-4 ring-offset-background">
              <AvatarImage
                src={profile.avatar || ""}
                alt={profile.nome}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                {getInitials(profile.nome)}
              </AvatarFallback>
            </Avatar>
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>

          <div className="text-center">
            <h3 className="font-semibold text-lg">{profile.nome}</h3>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <Badge
              variant={getRoleBadgeVariant(profile.role)}
              className="mt-2"
            >
              {getRoleLabel(profile.role)}
            </Badge>
          </div>
        </div>

        {/* Upload de arquivo */}
        <div className="space-y-4">
          <FileUpload
            onChange={handleFileChange}
          />

          <div className="text-xs text-muted-foreground text-center">
            Formatos aceitos: JPEG, PNG, WebP • Máximo 5MB
          </div>
        </div>

        {/* Botão de remover avatar */}
        {profile.avatar && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              // TODO: Implementar remoção de avatar
              console.log("Remover avatar");
            }}
          >
            <User className="mr-2 h-4 w-4" />
            Usar Iniciais
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
