import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import { getAppConfig } from '@/lib/config';
import EncerrarSessaoButton from '@/components/EncerrarSessaoButton';
import AppNameForm from '@/components/AppNameForm';

export default async function AdminPage() {
  await requireAdminUser();

  const [sessaoAberta, { nomeApp }] = await Promise.all([
    prisma.sessao.findFirst({ where: { status: 'ABERTA' }, include: { local: true } }),
    getAppConfig(),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Painel admin</h1>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Nome do app</p>
        <AppNameForm nomeAtual={nomeApp} />
      </div>

      {sessaoAberta && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sessão aberta</p>
          <p className="font-semibold mb-3">{sessaoAberta.local.nome}</p>
          <EncerrarSessaoButton sessaoId={sessaoAberta.id} />
        </div>
      )}

      <div className="space-y-2">
        <Link
          href="/admin/usuarios"
          className="block bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 px-4 py-3.5 font-medium active:bg-gray-50 dark:active:bg-gray-800"
        >
          Gerenciar usuários
        </Link>
        <Link
          href="/admin/locais"
          className="block bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 px-4 py-3.5 font-medium active:bg-gray-50 dark:active:bg-gray-800"
        >
          Gerenciar locais
        </Link>
        <Link
          href="/admin/sessoes"
          className="block bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 px-4 py-3.5 font-medium active:bg-gray-50 dark:active:bg-gray-800"
        >
          Gerenciar sessões
        </Link>
        <Link
          href="/admin/sessoes/historico/nova"
          className="block bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 px-4 py-3.5 font-medium active:bg-gray-50 dark:active:bg-gray-800"
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
