import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import NovaSessaoForm from '@/components/NovaSessaoForm';

export default async function NovaSessaoPage() {
  await requireAdminUser();

  const sessaoAberta = await prisma.sessao.findFirst({ where: { status: 'ABERTA' } });
  const locais = await prisma.local.findMany({ orderBy: { nome: 'asc' } });

  if (sessaoAberta) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">
          Já existe uma sessão aberta. Encerre-a antes de abrir uma nova.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Nova sessão</h1>
      <NovaSessaoForm locais={locais} />
    </div>
  );
}
