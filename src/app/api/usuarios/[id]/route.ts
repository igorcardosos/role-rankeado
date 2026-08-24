import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdminUser, AuthError } from '@/lib/auth';
import { usuarioUpdateSchema } from '@/lib/validation';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdminUser();
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'Id inválido.' }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const parsed = usuarioUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    // Impede trocar o próprio papel — bug real: você perde acesso admin
    // no meio da sessão sem ninguém mais poder reverter na hora. Sempre
    // reforçado aqui, mesmo que o frontend já esconda o botão pra si mesmo.
    if (id === session.sub && parsed.data.papel !== undefined) {
      return NextResponse.json(
        { error: 'Você não pode alterar o próprio papel. Peça pra outro admin fazer isso.' },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.update({ where: { id }, data: parsed.data });
    return NextResponse.json(usuario);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }
    throw err;
  }
}
