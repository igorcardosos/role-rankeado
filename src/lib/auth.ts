import { cache } from 'react';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/lib/constants';

export type Papel = 'ADMIN' | 'MEMBRO';

export type SessionPayload = {
  sub: number;
  telefone: string;
  nome: string;
  papel: Papel;
};

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado.');
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ telefone: payload.telefone, nome: payload.nome, papel: payload.papel })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(payload.sub))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      sub: Number(payload.sub),
      telefone: payload.telefone as string,
      nome: payload.nome as string,
      papel: payload.papel as Papel,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await signSession(payload);
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE_NAME);
}

// cache() deduplica dentro da mesma requisição — NavBar, OpenSessionBanner
// e a página em si cada um chama isso na sua vez; sem isso seria verificar
// o mesmo JWT 3-4 vezes por request.
export const getSessionFromCookies = cache(async (): Promise<SessionPayload | null> => {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
});

export async function requireUser(): Promise<SessionPayload> {
  const session = await getSessionFromCookies();
  if (!session) {
    throw new AuthError(401, 'Não autenticado.');
  }
  return session;
}

/**
 * Reconfirma o papel contra o banco (não confia só na claim do JWT),
 * já que o cookie pode durar até SESSION_MAX_AGE_DAYS mesmo após um
 * usuário ser rebaixado de admin.
 */
export async function requireAdminUser(): Promise<SessionPayload> {
  const session = await requireUser();
  const usuario = await prisma.usuario.findUnique({ where: { id: session.sub } });
  if (!usuario || usuario.papel !== 'ADMIN') {
    throw new AuthError(403, 'Acesso restrito a administradores.');
  }
  return session;
}
