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

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdminUser();
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'Id inválido.' }, { status: 400 });
    }

    // Mesma razão do bloqueio de auto-demoção: excluir a própria conta no
    // meio da sessão é um jeito garantido de se trancar pra fora do app.
    if (id === session.sub) {
      return NextResponse.json(
        { error: 'Você não pode excluir sua própria conta. Peça pra outro admin fazer isso.' },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    await prisma.$transaction([
      // Sessões que essa pessoa abriu continuam existindo (com as
      // avaliações de todo mundo intactas) — só passa a atribuição pra
      // quem está excluindo, já que "quem abriu" é só um dado histórico,
      // sem nenhuma regra de permissão presa a ele.
      prisma.sessao.updateMany({ where: { abertaPorId: id }, data: { abertaPorId: session.sub } }),
      prisma.avaliacao.deleteMany({ where: { usuarioId: id } }),
      prisma.feelingVoto.deleteMany({ where: { usuarioId: id } }),
      prisma.usuario.delete({ where: { id } }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Usuário já foi excluído.' }, { status: 404 });
    }
    throw err;
  }
}
