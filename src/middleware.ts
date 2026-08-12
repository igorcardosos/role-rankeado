import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'role_rankeado_session';

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/placeholder-dish.svg', '/favicon.ico'];

const ADMIN_PAGE_PREFIXES = ['/admin', '/sessao/nova'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

async function verifyEdge(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
    const { payload } = await jwtVerify(token, secret);
    return payload as { papel?: string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/api/uploads')) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const payload = token ? await verifyEdge(token) : null;

  const isApi = pathname.startsWith('/api');

  if (!payload) {
    if (isApi) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  const needsAdmin = ADMIN_PAGE_PREFIXES.some((p) => pathname.startsWith(p));
  if (needsAdmin && payload.papel !== 'ADMIN') {
    if (isApi) {
      return NextResponse.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });
    }
    const url = req.nextUrl.clone();
    url.pathname = '/ranking';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
