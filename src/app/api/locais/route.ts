import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
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
    // Corrida/clique duplo: dois POSTs criando o mesmo nome+cidade batem
    // na constraint única — devolve 409 em vez de vazar um 500.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe um local com esse nome nessa cidade.' }, { status: 409 });
    }
    throw err;
  }
}
