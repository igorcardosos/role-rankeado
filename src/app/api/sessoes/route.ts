import { NextRequest, NextResponse } from 'next/server';
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

    const sessao = await prisma.sessao.create({
      data: {
        localId,
        abertaPorId: session.sub,
        fotoUrl,
        status: 'ABERTA',
        isHistorico: false,
      },
    });

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
