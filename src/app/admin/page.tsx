import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import EncerrarSessaoButton from '@/components/EncerrarSessaoButton';

export default async function AdminPage() {
  await requireAdminUser();

  const sessaoAberta = await prisma.sessao.findFirst({
    where: { status: 'ABERTA' },
    include: { local: true },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Painel admin</h1>

      {sessaoAberta && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Sessão aberta</p>
          <p className="font-semibold mb-3">{sessaoAberta.local.nome}</p>
          <EncerrarSessaoButton sessaoId={sessaoAberta.id} />
        </div>
      )}

      <div className="space-y-2">
        <Link
          href="/admin/usuarios"
          className="block bg-white rounded-2xl border border-gray-200 px-4 py-3.5 font-medium active:bg-gray-50"
        >
          Gerenciar usuários
        </Link>
        <Link
          href="/admin/locais"
          className="block bg-white rounded-2xl border border-gray-200 px-4 py-3.5 font-medium active:bg-gray-50"
        >
          Gerenciar locais
        </Link>
        <Link
          href="/admin/sessoes"
          className="block bg-white rounded-2xl border border-gray-200 px-4 py-3.5 font-medium active:bg-gray-50"
        >
          Gerenciar sessões
        </Link>
        <Link
          href="/admin/sessoes/historico/nova"
          className="block bg-white rounded-2xl border border-gray-200 px-4 py-3.5 font-medium active:bg-gray-50"
        >
          Cadastrar sessão histórica
        </Link>
        {!sessaoAberta && (
          <Link
            href="/sessao/nova"
            className="block bg-brand-600 text-white rounded-2xl px-4 py-3.5 font-medium text-center active:bg-brand-700"
          >
            + Nova sessão
          </Link>
        )}
      </div>
    </div>
  );
}
