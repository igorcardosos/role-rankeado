import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import AdminUserForm from '@/components/AdminUserForm';
import UsuarioRoleToggle from '@/components/UsuarioRoleToggle';

export default async function AdminUsuariosPage() {
  await requireAdminUser();

  const usuarios = await prisma.usuario.findMany({ orderBy: { nome: 'asc' } });

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Usuários</h1>

      <div className="mb-6">
        <AdminUserForm />
      </div>

      <ul className="space-y-2">
        {usuarios.map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 px-4 py-3"
          >
            <div>
              <p className="font-medium">{u.nome}</p>
              <p className="text-xs text-gray-500">{u.telefone}</p>
            </div>
            <UsuarioRoleToggle id={u.id} papel={u.papel as 'ADMIN' | 'MEMBRO'} />
          </li>
        ))}
      </ul>
    </div>
  );
}
