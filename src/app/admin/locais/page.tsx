import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import DeleteLocalButton from '@/components/DeleteLocalButton';

export default async function AdminLocaisPage() {
  await requireAdminUser();

  const locais = await prisma.local.findMany({ orderBy: { nome: 'asc' } });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Locais</h1>
        <Link
          href="/admin/locais/novo"
          className="rounded-xl bg-brand-600 text-white text-sm font-semibold px-4 py-2 active:bg-brand-700"
        >
          + Novo
        </Link>
      </div>

      <ul className="space-y-2">
        {locais.map((local) => (
          <li
            key={local.id}
            className="flex items-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 pr-2"
          >
            <Link
              href={`/admin/locais/${local.id}/editar`}
              className="flex-1 min-w-0 flex items-center justify-between px-4 py-3 active:bg-gray-50 dark:active:bg-gray-800"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{local.nome}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{local.cidade}</p>
              </div>
            </Link>
            <DeleteLocalButton id={local.id} nome={local.nome} />
          </li>
        ))}
      </ul>
    </div>
  );
}
