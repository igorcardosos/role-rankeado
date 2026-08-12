import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import AvaliacaoForm from '@/components/AvaliacaoForm';

export default async function AvaliarSessaoPage() {
  const session = await requireUser();

  const sessao = await prisma.sessao.findFirst({
    where: { status: 'ABERTA', isHistorico: false },
    include: { local: true },
    orderBy: { createdAt: 'desc' },
  });

  if (!sessao) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400">Nenhuma sessão aberta no momento.</p>
        <Link href="/ranking" className="text-brand-600 dark:text-brand-400 font-medium mt-4 inline-block">
          Voltar ao ranking
        </Link>
      </div>
    );
  }

  const avaliacao = await prisma.avaliacao.findUnique({
    where: { sessaoId_usuarioId: { sessaoId: sessao.id, usuarioId: session.sub } },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">{sessao.local.nome}</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{sessao.local.cidade}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sessao.fotoUrl}
        alt={`Foto da sessão em ${sessao.local.nome}`}
        className="w-full rounded-2xl object-cover max-h-72 mb-6 bg-gray-100 dark:bg-gray-800"
      />

      {avaliacao ? (
        <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <p className="text-2xl mb-2">⏳</p>
          <p className="font-medium">Avaliação enviada!</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Aguardando o restante do grupo avaliar.
          </p>
          <Link
            href="/ranking"
            className="text-brand-600 dark:text-brand-400 font-medium mt-4 inline-block"
          >
            Voltar ao ranking
          </Link>
        </div>
      ) : (
        <AvaliacaoForm sessaoId={sessao.id} />
      )}
    </div>
  );
}
