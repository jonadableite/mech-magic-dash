import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  Cliente,
  CreateClienteData,
  UpdateClienteData,
  ClienteWithRelations,
} from "../clientes.interfaces";
import {
  validateCreateCliente,
  validateUpdateCliente,
  validatePagination,
  validateClienteId,
  validateClienteSearch,
} from "../procedures/cliente-validation.procedure";
import {
  createEmailCheckProcedure,
  createClienteDeletionCheckProcedure,
  createClienteStatsProcedure,
} from "../procedures/cliente-business.procedure";
import {
  createErrorHandlerProcedure,
  createLoggingProcedure,
} from "../../shared/procedures/error-handler.procedure";

// Instâncias dos procedures
const checkEmailExists = createEmailCheckProcedure();
const checkClienteDeletion = createClienteDeletionCheckProcedure();
const getClienteStats = createClienteStatsProcedure();

// Procedures de middleware
const errorHandler = createErrorHandlerProcedure();
const logger = createLoggingProcedure();

// GET /api/clientes - Listar clientes com paginação e busca
export const getClientes = errorHandler(
  logger(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { nome: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { telefone: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          veiculos: {
            select: {
              id: true,
              marca: true,
              modelo: true,
              ano: true,
              placa: true,
            },
          },
          ordens: {
            select: {
              id: true,
              numero: true,
              status: true,
              valorTotal: true,
              dataAbertura: true,
            },
            orderBy: { dataAbertura: "desc" },
            take: 3,
          },
        },
      }),
      prisma.cliente.count({ where }),
    ]);

    return NextResponse.json({
      data: clientes,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      success: true,
    });
  })
);

// GET /api/clientes/:id - Buscar cliente por ID
export const getClienteById = errorHandler(
  logger(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
      const { id } = params;

      const cliente = await prisma.cliente.findUnique({
        where: { id },
        include: {
          veiculos: true,
          ordens: {
            include: {
              veiculo: {
                select: {
                  marca: true,
                  modelo: true,
                  placa: true,
                },
              },
            },
            orderBy: { dataAbertura: "desc" },
          },
        },
      });

      if (!cliente) {
        return NextResponse.json(
          { message: "Cliente não encontrado", success: false },
          { status: 404 }
        );
      }

      return NextResponse.json({
        data: cliente,
        success: true,
      });
    }
  )
);

// POST /api/clientes - Criar novo cliente
export const createCliente = errorHandler(
  logger(
    validateCreateCliente(async (data: CreateClienteData) => {
      // Verificar se email já existe
      const emailExists = await checkEmailExists(data.email);
      if (emailExists) {
        return NextResponse.json(
          { message: "Email já cadastrado", success: false },
          { status: 400 }
        );
      }

      const cliente = await prisma.cliente.create({
        data,
        include: {
          veiculos: true,
          ordens: true,
        },
      });

      return NextResponse.json(
        {
          data: cliente,
          message: "Cliente criado com sucesso",
          success: true,
        },
        { status: 201 }
      );
    })
  )
);

// PUT /api/clientes/:id - Atualizar cliente
export const updateCliente = errorHandler(
  logger(
    validateUpdateCliente(async (data: UpdateClienteData) => {
      const { id, ...updateData } = data;

      // Verificar se cliente existe
      const existingCliente = await prisma.cliente.findUnique({
        where: { id },
      });

      if (!existingCliente) {
        return NextResponse.json(
          { message: "Cliente não encontrado", success: false },
          { status: 404 }
        );
      }

      // Se está atualizando o email, verificar se já existe
      if (data.email && data.email !== existingCliente.email) {
        const emailExists = await checkEmailExists(data.email, id);
        if (emailExists) {
          return NextResponse.json(
            { message: "Email já cadastrado", success: false },
            { status: 400 }
          );
        }
      }

      const cliente = await prisma.cliente.update({
        where: { id },
        data: updateData,
        include: {
          veiculos: true,
          ordens: true,
        },
      });

      return NextResponse.json({
        data: cliente,
        message: "Cliente atualizado com sucesso",
        success: true,
      });
    })
  )
);

// DELETE /api/clientes/:id - Excluir cliente
export const deleteCliente = errorHandler(
  logger(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
      const { id } = params;

      // Verificar se pode excluir
      const deletionCheck = await checkClienteDeletion(id);
      if (!deletionCheck.canDelete) {
        return NextResponse.json(
          {
            message: deletionCheck.reason,
            success: false,
          },
          { status: 400 }
        );
      }

      await prisma.cliente.delete({
        where: { id },
      });

      return NextResponse.json({
        message: "Cliente excluído com sucesso",
        success: true,
      });
    }
  )
);

// GET /api/clientes/:id/stats - Estatísticas do cliente
export const getClienteStats = errorHandler(
  logger(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
      const { id } = params;

      try {
        const stats = await getClienteStats(id);
        return NextResponse.json({
          data: stats,
          success: true,
        });
      } catch (error) {
        return NextResponse.json(
          {
            message:
              error instanceof Error
                ? error.message
                : "Erro ao buscar estatísticas",
            success: false,
          },
          { status: 404 }
        );
      }
    }
  )
);
