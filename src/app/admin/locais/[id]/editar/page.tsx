import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import EditarLocalClient from '@/components/EditarLocalClient';

export default async function EditarLocalPage({ params }: { params: { id: string } }) {
  await requireAdminUser();

  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();

  const local = await prisma.local.findUnique({ where: { id } });
  if (!local) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Editar local</h1>
      <EditarLocalClient local={local} />
    </div>
  );
}
