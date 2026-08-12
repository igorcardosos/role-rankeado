import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, AuthError } from '@/lib/auth';
import { feelingUpdateSchema } from '@/lib/validation';

export async function PUT(req: NextRequest) {
  try {
    const session = await requireUser();
    const body = await req.json().catch(() => null);
    const parsed = feelingUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    const localIds = parsed.data.items.map((i) => i.localId);
    const avaliacoesDoUsuario = await prisma.avaliacao.findMany({
      where: { usuarioId: session.sub, sessao: { localId: { in: localIds } } },
      select: { sessao: { select: { localId: true } } },
    });
    const locaisPermitidos = new Set(avaliacoesDoUsuario.map((a) => a.sessao.localId));
    const localSemAvaliacao = localIds.find((id) => !locaisPermitidos.has(id));
    if (localSemAvaliacao) {
      return NextResponse.json(
        { error: 'Você só pode ranquear locais onde já avaliou uma sessão.' },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      parsed.data.items.map((item) =>
        prisma.feelingVoto.upsert({
          where: { usuarioId_localId: { usuarioId: session.sub, localId: item.localId } },
          update: { posicaoPessoal: item.posicaoPessoal },
          create: { usuarioId: session.sub, localId: item.localId, posicaoPessoal: item.posicaoPessoal },
        })
      )
    );

    return NextResponse.json({ updated: parsed.data.items.length });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
