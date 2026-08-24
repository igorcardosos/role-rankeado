import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdminUser, AuthError } from '@/lib/auth';
import { usuarioCreateSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    await requireAdminUser();
    const body = await req.json().catch(() => null);
    const parsed = usuarioCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    const existente = await prisma.usuario.findUnique({ where: { telefone: parsed.data.telefone } });
    if (existente) {
      return NextResponse.json({ error: 'Telefone já cadastrado.' }, { status: 409 });
    }

    let usuario;
    try {
      usuario = await prisma.usuario.create({ data: parsed.data });
    } catch (err) {
      // Backstop contra corrida: a checagem acima passou pros dois, mas a
      // constraint única em telefone garante que só um dos dois cadastros
      // concorrentes vinga.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        return NextResponse.json({ error: 'Telefone já cadastrado.' }, { status: 409 });
      }
      throw err;
    }

    return NextResponse.json(usuario, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
