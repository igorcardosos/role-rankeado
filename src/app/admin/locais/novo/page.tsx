'use client';

import { useRouter } from 'next/navigation';
import AdminLocalForm from '@/components/AdminLocalForm';

export default function NovoLocalPage() {
  const router = useRouter();

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Novo local</h1>
      <AdminLocalForm
        onSaved={() => {
          router.push('/admin/locais');
          router.refresh();
        }}
      />
    </div>
  );
}
