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

    // updateMany com o status na condição faz a checagem + a troca num só
    // passo atômico no banco — evita a corrida de duas requisições lendo
    // "ainda aberta" antes de qualquer uma delas gravar o encerramento.
    const resultado = await prisma.sessao.updateMany({
      where: { id, status: 'ABERTA' },
      data: { status: 'ENCERRADA', encerradaEm: new Date() },
    });

    if (resultado.count === 0) {
      const sessao = await prisma.sessao.findUnique({ where: { id } });
      if (!sessao) {
        return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Sessão já encerrada.' }, { status: 409 });
    }

    const atualizada = await prisma.sessao.findUnique({ where: { id } });
    return NextResponse.json(atualizada);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
