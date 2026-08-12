import { NextResponse } from 'next/server';
import { readUploadedPhoto } from '@/lib/upload';
import { requireUser, AuthError } from '@/lib/auth';

export async function GET(_req: Request, { params }: { params: { filename: string } }) {
  try {
    await requireUser();
    const file = await readUploadedPhoto(params.filename);
    if (!file) {
      return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(file.buffer), {
      headers: {
        'Content-Type': file.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
