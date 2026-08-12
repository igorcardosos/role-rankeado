import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser, AuthError } from '@/lib/auth';
import { localCreateSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    await requireAdminUser();
    const body = await req.json().catch(() => null);
    const parsed = localCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    const local = await prisma.local.create({ data: parsed.data });
    return NextResponse.json(local, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
