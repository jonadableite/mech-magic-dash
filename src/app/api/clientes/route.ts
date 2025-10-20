import { NextRequest } from "next/server";
import { getClientes, createCliente } from "@/features/clientes";

// GET /api/clientes
export async function GET(request: NextRequest) {
  return getClientes(request);
}

// POST /api/clientes
export async function POST(request: NextRequest) {
  return createCliente(request);
}
