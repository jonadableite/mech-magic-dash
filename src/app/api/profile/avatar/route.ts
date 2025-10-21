import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/providers/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

// Função para obter ID do usuário da sessão (Single Responsibility Principle)
async function getUserIdFromSession(request: NextRequest): Promise<string> {
  const sessionToken = request.cookies.get("session-token")?.value;

  if (!sessionToken) {
    throw new Error("Token de sessão não encontrado");
  }

  const session = await prisma.sessao.findUnique({
    where: { token: sessionToken },
    include: { usuario: true },
  });

  if (!session || !session.usuario) {
    throw new Error("Sessão inválida");
  }

  return session.usuario.id;
}

// POST - Upload de avatar
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession(request);

    // Log para debug
    const contentType = request.headers.get("content-type");
    console.log("Content-Type recebido:", contentType);

    // Verificar se é multipart/form-data
    if (!contentType || !contentType.includes("multipart/form-data")) {
      console.log("Content-Type inválido:", contentType);
      return NextResponse.json(
        { success: false, error: "Content-Type deve ser multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Tipo de arquivo não suportado. Use JPEG, PNG ou WebP",
        },
        { status: 400 }
      );
    }

    // Validar tamanho do arquivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "Arquivo muito grande. Máximo 5MB" },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split(".").pop();
    const fileName = `${randomUUID()}.${fileExtension}`;

    // Criar diretório se não existir
    const uploadDir = join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(uploadDir, { recursive: true });

    // Salvar arquivo
    const filePath = join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // URL do arquivo
    const fileUrl = `/uploads/avatars/${fileName}`;

    // Atualizar avatar no banco de dados
    await prisma.usuario.update({
      where: { id: userId },
      data: { avatar: fileUrl },
    });

    return NextResponse.json({
      success: true,
      data: { url: fileUrl },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error) || "Erro desconhecido";
    console.error("Erro ao fazer upload do avatar:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
