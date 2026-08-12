import { NextRequest, NextResponse } from 'next/server';
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
    throw err;
  }
}
