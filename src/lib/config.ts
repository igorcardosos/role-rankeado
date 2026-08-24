import { cache } from 'react';
import { prisma } from '@/lib/prisma';

export const NOME_APP_PADRAO = 'Rolê Rankeado';

// cache() deduplica dentro da mesma requisição — layout, navbar e a própria
// página costumam chamar isso cada um na sua vez; sem isso viraria 3-4
// upserts idênticos na mesma renderização.
export const getAppConfig = cache(async () => {
  return prisma.appConfig.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, nomeApp: NOME_APP_PADRAO },
  });
});

export async function setNomeApp(nomeApp: string) {
  return prisma.appConfig.upsert({
    where: { id: 1 },
    update: { nomeApp },
    create: { id: 1, nomeApp },
  });
}
