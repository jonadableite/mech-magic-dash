import { NextRequest } from "next/server";
import {
  getClienteById,
  updateCliente,
  deleteCliente,
  getClienteStats,
} from "@/features/clientes";

// GET /api/clientes/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return getClienteById(request, { params });
}

// PUT /api/clientes/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return updateCliente(request, { params });
}

// DELETE /api/clientes/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return deleteCliente(request, { params });
}
