import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser, AuthError } from '@/lib/auth';
import { historicoSessaoSchema } from '@/lib/validation';
import { computeNotaFinal } from '@/lib/scoring';
import { PLACEHOLDER_PHOTO_URL } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdminUser();
    const body = await req.json().catch(() => null);
    const parsed = historicoSessaoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }
    const { localId, novoLocal, data, avaliacoes } = parsed.data;

    const usuarioIds = avaliacoes.map((a) => a.usuarioId);
    if (new Set(usuarioIds).size !== usuarioIds.length) {
      return NextResponse.json(
        { error: 'Cada usuário só pode ter uma avaliação por sessão.' },
        { status: 400 }
      );
    }

    const usuariosExistentes = await prisma.usuario.count({ where: { id: { in: usuarioIds } } });
    if (usuariosExistentes !== usuarioIds.length) {
      return NextResponse.json({ error: 'Algum usuário informado não existe.' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      let finalLocalId = localId;
      if (!finalLocalId && novoLocal) {
        const local = await tx.local.create({ data: novoLocal });
        finalLocalId = local.id;
      }
      if (!finalLocalId) {
        throw new Error('localId ausente.');
      }

      const sessao = await tx.sessao.create({
        data: {
          localId: finalLocalId,
          abertaPorId: session.sub,
          data: new Date(data),
          status: 'ENCERRADA',
          isHistorico: true,
          fotoUrl: PLACEHOLDER_PHOTO_URL,
          encerradaEm: new Date(),
        },
      });

      for (const item of avaliacoes) {
        const notaFinal = computeNotaFinal(item);
        await tx.avaliacao.create({
          data: { sessaoId: sessao.id, ...item, notaFinal },
        });

        const avaliacaoAnterior = await tx.avaliacao.findFirst({
          where: {
            usuarioId: item.usuarioId,
            sessao: { localId: finalLocalId },
            sessaoId: { not: sessao.id },
          },
        });

        if (!avaliacaoAnterior) {
          const totalVotos = await tx.feelingVoto.count({ where: { usuarioId: item.usuarioId } });
          await tx.feelingVoto.upsert({
            where: { usuarioId_localId: { usuarioId: item.usuarioId, localId: finalLocalId } },
            update: {},
            create: { usuarioId: item.usuarioId, localId: finalLocalId, posicaoPessoal: totalVotos + 1 },
          });
        }
      }

      return sessao;
    });

    return NextResponse.json({ sessao: result, count: avaliacoes.length }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
