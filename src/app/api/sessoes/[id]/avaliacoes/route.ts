import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, AuthError } from '@/lib/auth';
import { avaliacaoInputSchema } from '@/lib/validation';
import { computeNotaFinal } from '@/lib/scoring';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireUser();
    const sessaoId = Number(params.id);
    if (!Number.isInteger(sessaoId)) {
      return NextResponse.json({ error: 'Id inválido.' }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const parsed = avaliacaoInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    const sessao = await prisma.sessao.findUnique({ where: { id: sessaoId } });
    if (!sessao) {
      return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 404 });
    }
    if (sessao.status === 'ENCERRADA') {
      return NextResponse.json({ error: 'Sessão já foi encerrada.' }, { status: 400 });
    }

    const jaAvaliou = await prisma.avaliacao.findUnique({
      where: { sessaoId_usuarioId: { sessaoId, usuarioId: session.sub } },
    });
    if (jaAvaliou) {
      return NextResponse.json({ error: 'Você já avaliou esta sessão.' }, { status: 409 });
    }

    const notaFinal = computeNotaFinal(parsed.data);

    const avaliacao = await prisma.$transaction(async (tx) => {
      const created = await tx.avaliacao.create({
        data: { sessaoId, usuarioId: session.sub, ...parsed.data, notaFinal },
      });

      const avaliacaoAnterior = await tx.avaliacao.findFirst({
        where: { usuarioId: session.sub, sessao: { localId: sessao.localId }, id: { not: created.id } },
      });

      if (!avaliacaoAnterior) {
        const totalVotos = await tx.feelingVoto.count({ where: { usuarioId: session.sub } });
        await tx.feelingVoto.upsert({
          where: { usuarioId_localId: { usuarioId: session.sub, localId: sessao.localId } },
          update: {},
          create: { usuarioId: session.sub, localId: sessao.localId, posicaoPessoal: totalVotos + 1 },
        });
      }

      return created;
    });

    return NextResponse.json(avaliacao, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
