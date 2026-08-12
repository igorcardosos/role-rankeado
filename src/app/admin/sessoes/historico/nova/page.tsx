import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import HistoricoSessaoForm from '@/components/HistoricoSessaoForm';

export default async function NovaSessaoHistoricaPage() {
  await requireAdminUser();

  const [locais, usuarios] = await Promise.all([
    prisma.local.findMany({ orderBy: { nome: 'asc' } }),
    prisma.usuario.findMany({ orderBy: { nome: 'asc' } }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Sessão histórica</h1>
      <p className="text-gray-500 text-sm mb-4">
        Cadastre um rolê antigo com as notas de quem participou, sem passar pelo fluxo de votação ao vivo.
      </p>
      <HistoricoSessaoForm locais={locais} usuarios={usuarios} />
    </div>
  );
}
