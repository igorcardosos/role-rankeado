'use client';

import { useRouter } from 'next/navigation';
import AdminLocalForm from '@/components/AdminLocalForm';

type Local = { id: number; nome: string; cidade: string; endereco: string | null };

export default function EditarLocalClient({ local }: { local: Local }) {
  const router = useRouter();

  return (
    <AdminLocalForm
      local={local}
      onSaved={() => {
        router.push('/admin/locais');
        router.refresh();
      }}
    />
  );
}
