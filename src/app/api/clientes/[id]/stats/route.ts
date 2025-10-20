import { NextRequest } from "next/server";
import { getClienteStats } from "@/features/clientes";

// GET /api/clientes/:id/stats
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return getClienteStats(request, { params });
}
