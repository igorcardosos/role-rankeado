import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import DeleteSessaoButton from '@/components/DeleteSessaoButton';
import EncerrarSessaoButton from '@/components/EncerrarSessaoButton';

export default async function AdminSessoesPage() {
  await requireAdminUser();

  const sessoes = await prisma.sessao.findMany({
    orderBy: { data: 'desc' },
    include: { local: true, avaliacoes: true },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Sessões</h1>

      {sessoes.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-10">
          Nenhuma sessão cadastrada ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {sessoes.map((sessao) => {
            const label = `${sessao.local.nome} — ${new Date(sessao.data).toLocaleDateString('pt-BR')}`;
            return (
              <li
                key={sessao.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{sessao.local.nome}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(sessao.data).toLocaleDateString('pt-BR')} · {sessao.avaliacoes.length}{' '}
                      avaliação(ões)
                      {sessao.isHistorico && ' · histórico'}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
                      sessao.status === 'ABERTA'
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {sessao.status === 'ABERTA' ? 'Aberta' : 'Encerrada'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {sessao.status === 'ABERTA' && (
                    <EncerrarSessaoButton sessaoId={sessao.id} compact />
                  )}
                  <DeleteSessaoButton id={sessao.id} label={label} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
