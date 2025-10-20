import { NextRequest, NextResponse } from "next/server";
import {
  createValidationProcedure,
  createQueryValidationProcedure,
  createParamsValidationProcedure,
} from "../../shared";
import {
  createClienteSchema,
  updateClienteSchema,
} from "../clientes.interfaces";
import { paginationSchema, idSchema } from "../../shared";

// Procedure para validação de criação de cliente
export const validateCreateCliente =
  createValidationProcedure(createClienteSchema);

// Procedure para validação de atualização de cliente
export const validateUpdateCliente =
  createValidationProcedure(updateClienteSchema);

// Procedure para validação de parâmetros de paginação
export const validatePagination =
  createQueryValidationProcedure(paginationSchema);

// Procedure para validação de ID de cliente
export const validateClienteId = createParamsValidationProcedure(idSchema);

// Procedure para validação de busca de clientes
export const validateClienteSearch = createQueryValidationProcedure(
  paginationSchema.extend({
    search: paginationSchema.shape.search.optional(),
  })
);
