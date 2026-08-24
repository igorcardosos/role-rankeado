import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdminUser, AuthError } from '@/lib/auth';
import { localUpdateSchema } from '@/lib/validation';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdminUser();
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'Id inválido.' }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const parsed = localUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    const local = await prisma.local.update({ where: { id }, data: parsed.data });
    return NextResponse.json(local);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return NextResponse.json(
          { error: 'Já existe um local com esse nome nessa cidade.' },
          { status: 409 }
        );
      }
      if (err.code === 'P2025') {
        return NextResponse.json({ error: 'Local não encontrado.' }, { status: 404 });
      }
    }
    throw err;
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdminUser();
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'Id inválido.' }, { status: 400 });
    }

    const local = await prisma.local.findUnique({ where: { id } });
    if (!local) {
      return NextResponse.json({ error: 'Local não encontrado.' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.avaliacao.deleteMany({ where: { sessao: { localId: id } } }),
      prisma.feelingVoto.deleteMany({ where: { localId: id } }),
      prisma.sessao.deleteMany({ where: { localId: id } }),
      prisma.local.delete({ where: { id } }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    // Clique duplo em excluir: a segunda chamada não acha mais o registro
    // no meio da transação — trata como "já foi" em vez de 500.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Local já foi excluído.' }, { status: 404 });
    }
    throw err;
  }
}
