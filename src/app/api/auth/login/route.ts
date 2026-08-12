import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSessionCookie, type Papel } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Telefone inválido.' }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { telefone: parsed.data.telefone },
  });

  if (!usuario) {
    return NextResponse.json({ error: 'Telefone não cadastrado.' }, { status: 401 });
  }

  await setSessionCookie({
    sub: usuario.id,
    telefone: usuario.telefone,
    nome: usuario.nome,
    papel: usuario.papel as Papel,
  });

  return NextResponse.json({ id: usuario.id, nome: usuario.nome, papel: usuario.papel });
}
