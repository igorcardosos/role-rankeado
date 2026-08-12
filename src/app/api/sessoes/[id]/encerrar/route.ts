import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser, AuthError } from '@/lib/auth';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdminUser();
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'Id inválido.' }, { status: 400 });
    }

    const sessao = await prisma.sessao.findUnique({ where: { id } });
    if (!sessao) {
      return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 404 });
    }
    if (sessao.status === 'ENCERRADA') {
      return NextResponse.json({ error: 'Sessão já encerrada.' }, { status: 409 });
    }

    const updated = await prisma.sessao.update({
      where: { id },
      data: { status: 'ENCERRADA', encerradaEm: new Date() },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
