import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdminUser, AuthError } from '@/lib/auth';
import { saveUploadedPhoto, UploadError } from '@/lib/upload';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdminUser();

    const formData = await req.formData();
    const localIdRaw = formData.get('localId');
    const foto = formData.get('foto');

    const localId = Number(localIdRaw);
    if (!Number.isInteger(localId) || localId <= 0) {
      return NextResponse.json({ error: 'localId inválido.' }, { status: 400 });
    }
    if (!(foto instanceof File) || foto.size === 0) {
      return NextResponse.json({ error: 'Foto obrigatória.' }, { status: 400 });
    }

    const local = await prisma.local.findUnique({ where: { id: localId } });
    if (!local) {
      return NextResponse.json({ error: 'Local não encontrado.' }, { status: 404 });
    }

    const sessaoAberta = await prisma.sessao.findFirst({ where: { status: 'ABERTA' } });
    if (sessaoAberta) {
      return NextResponse.json({ error: 'Já existe uma sessão aberta.' }, { status: 409 });
    }

    const fotoUrl = await saveUploadedPhoto(foto);

    let sessao;
    try {
      sessao = await prisma.sessao.create({
        data: {
          localId,
          abertaPorId: session.sub,
          fotoUrl,
          status: 'ABERTA',
          isHistorico: false,
        },
      });
    } catch (err) {
      // Backstop contra corrida: a checagem acima passou pros dois, mas o
      // índice único parcial (só 1 ABERTA por vez) no banco garante que só
      // uma das duas requisições concorrentes consegue criar de fato.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        return NextResponse.json({ error: 'Já existe uma sessão aberta.' }, { status: 409 });
      }
      throw err;
    }

    return NextResponse.json(sessao, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
