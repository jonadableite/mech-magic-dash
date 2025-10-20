import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas que requerem autenticação
const protectedRoutes = [
  "/dashboard",
  "/clientes",
  "/veiculos",
  "/agendamentos",
  "/ordens",
  "/estoque",
  "/financeiro",
  "/configuracoes",
  "/perfil",
  "/billing",
  "/suporte",
];

// Rotas de autenticação (redirecionar se já logado)
const authRoutes = ["/signin", "/signup", "/auth"];

// Rotas públicas
const publicRoutes = ["/", "/api/health", "/api/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar se é uma rota de API
  if (pathname.startsWith("/api/")) {
    // Permitir todas as rotas de API de autenticação
    if (pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    // Para outras APIs, verificar se é uma rota protegida
    const isProtectedApi = protectedRoutes.some((route) =>
      pathname.startsWith(`/api${route}`)
    );

    if (isProtectedApi) {
      // Verificar token de autenticação
      const token = request.cookies.get("session-token")?.value;

      if (!token) {
        return NextResponse.json(
          {
            error: "Unauthorized",
            message: "Token de autenticação necessário",
          },
          { status: 401 }
        );
      }

      // Para APIs protegidas, deixar a validação da sessão para o endpoint específico
      // O middleware só verifica se o token existe, a validação completa fica no endpoint
    }

    return NextResponse.next();
  }

  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Verificar se é uma rota de autenticação
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  // Obter token de autenticação
  const token = request.cookies.get("session-token")?.value;
  const isAuthenticated = !!token;

  // Redirecionar para login se tentar acessar rota protegida sem autenticação
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/signin", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirecionar para dashboard se tentar acessar rota de auth já logado
  if (isAuthRoute && isAuthenticated) {
    const redirectTo = request.nextUrl.searchParams.get("redirect");
    return NextResponse.redirect(
      new URL(redirectTo || "/dashboard", request.url)
    );
  }

  // Permitir acesso a rotas públicas
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Para outras rotas, verificar autenticação
  if (!isAuthenticated) {
    const loginUrl = new URL("/signin", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
