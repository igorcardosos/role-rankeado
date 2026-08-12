import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser, AuthError } from '@/lib/auth';
import { setNomeApp } from '@/lib/config';
import { appConfigUpdateSchema } from '@/lib/validation';

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminUser();
    const body = await req.json().catch(() => null);
    const parsed = appConfigUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    const config = await setNomeApp(parsed.data.nomeApp);
    return NextResponse.json(config);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
