import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import AdminUserForm from '@/components/AdminUserForm';
import UsuarioRoleToggle from '@/components/UsuarioRoleToggle';
import { formatTelefoneBR } from '@/lib/phone';

export default async function AdminUsuariosPage() {
  const session = await requireAdminUser();

  const usuarios = await prisma.usuario.findMany({ orderBy: { nome: 'asc' } });

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Usuários</h1>

      <div className="mb-6">
        <AdminUserForm />
      </div>

      <ul className="space-y-2">
        {usuarios.map((u) => {
          const isVoceMesmo = u.id === session.sub;
          return (
            <li
              key={u.id}
              className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 px-4 py-3"
            >
              <div>
                <p className="font-medium">
                  {u.nome}
                  {isVoceMesmo && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-normal"> (você)</span>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatTelefoneBR(u.telefone)}</p>
              </div>
              {isVoceMesmo ? (
                <span
                  title="Não é possível alterar o próprio papel"
                  className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 opacity-70 cursor-not-allowed"
                >
                  {u.papel}
                </span>
              ) : (
                <UsuarioRoleToggle id={u.id} papel={u.papel as 'ADMIN' | 'MEMBRO'} />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
