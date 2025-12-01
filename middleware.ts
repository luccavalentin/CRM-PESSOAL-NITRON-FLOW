import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/login', '/cadastro', '/verificar-conexao']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verifica se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Se for rota pública, permite acesso
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Para rotas protegidas, verifica autenticação via cookie/localStorage
  // Como estamos usando client-side auth, o middleware apenas redireciona
  // A verificação real será feita no MainLayout (client-side)
  // Mas podemos adicionar uma verificação básica aqui também

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

