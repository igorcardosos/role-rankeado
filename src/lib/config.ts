import { prisma } from '@/lib/prisma';

export const NOME_APP_PADRAO = 'Rolê Rankeado';

export async function getAppConfig() {
  return prisma.appConfig.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, nomeApp: NOME_APP_PADRAO },
  });
}

export async function setNomeApp(nomeApp: string) {
  return prisma.appConfig.upsert({
    where: { id: 1 },
    update: { nomeApp },
    create: { id: 1, nomeApp },
  });
}
