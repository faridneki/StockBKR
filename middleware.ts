import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// Routes qui nécessitent d'être connecté
const protectedRoutes = ['/stocks', '/stk-at', '/dashboard', '/articles'];

// Route racine protégée
const protectedRoot = '/';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = request.cookies.get('auth-token')?.value;
  const session = token ? await verifyToken(token) : null;

  // Si on est sur / et pas de session → /login
  if (pathname === protectedRoot && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Autres routes protégées
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Si connecté et sur /login ou /register → /
  if ((pathname === '/login' || pathname === '/register') && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};