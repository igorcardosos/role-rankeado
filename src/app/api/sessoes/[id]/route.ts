import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser, AuthError } from '@/lib/auth';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdminUser();
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'Id inválido.' }, { status: 400 });
    }

    const sessao = await prisma.sessao.findUnique({
      where: { id },
      include: { avaliacoes: true },
    });
    if (!sessao) {
      return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 404 });
    }

    const usuarioIdsEnvolvidos = [...new Set(sessao.avaliacoes.map((a) => a.usuarioId))];

    await prisma.$transaction(async (tx) => {
      await tx.avaliacao.deleteMany({ where: { sessaoId: id } });
      await tx.sessao.delete({ where: { id } });

      // Se essa era a única avaliação do usuário nesse local, o FeelingVoto
      // dele para esse local fica órfão (regra: só pode ranquear locais que
      // já avaliou) — remove nesse caso.
      for (const usuarioId of usuarioIdsEnvolvidos) {
        const aindaTemAvaliacao = await tx.avaliacao.findFirst({
          where: { usuarioId, sessao: { localId: sessao.localId } },
        });
        if (!aindaTemAvaliacao) {
          await tx.feelingVoto.deleteMany({
            where: { usuarioId, localId: sessao.localId },
          });
        }
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
