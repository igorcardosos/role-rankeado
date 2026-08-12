import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/auth';

export default async function OpenSessionBanner() {
  const session = await getSessionFromCookies();
  if (!session) return null;

  const sessaoAberta = await prisma.sessao.findFirst({
    where: { status: 'ABERTA', isHistorico: false },
    include: { local: true },
    orderBy: { createdAt: 'desc' },
  });

  if (!sessaoAberta) return null;

  const jaAvaliou = await prisma.avaliacao.findUnique({
    where: { sessaoId_usuarioId: { sessaoId: sessaoAberta.id, usuarioId: session.sub } },
  });

  return (
    <div className="sticky top-[57px] z-10 bg-brand-600 text-white">
      <Link
        href="/sessao/avaliar"
        className="max-w-2xl mx-auto flex items-center justify-between px-4 py-2.5 text-sm font-medium"
      >
        <span>
          Sessão aberta em <strong>{sessaoAberta.local.nome}</strong>
          {jaAvaliou ? ' — aguardando outros' : ' — avaliar agora'}
        </span>
        <span aria-hidden>{jaAvaliou ? '⏳' : '→'}</span>
      </Link>
    </div>
  );
}
