import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const phone = process.env.SEED_ADMIN_PHONE;
  if (!phone) {
    console.log('SEED_ADMIN_PHONE not set — skipping admin bootstrap.');
    return;
  }

  const usuario = await prisma.usuario.upsert({
    where: { telefone: phone },
    update: { papel: 'ADMIN' },
    create: {
      telefone: phone,
      nome: process.env.SEED_ADMIN_NAME || 'Admin',
      papel: 'ADMIN',
    },
  });

  console.log(`Admin user ensured for ${usuario.telefone} (id=${usuario.id}).`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
