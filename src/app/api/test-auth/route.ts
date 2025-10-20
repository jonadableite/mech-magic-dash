import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Better Auth is working",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: "Better Auth POST is working",
    timestamp: new Date().toISOString(),
  });
}
