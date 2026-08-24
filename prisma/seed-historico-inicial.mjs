// Importa o ranking histórico que o grupo já tinha antes do app existir.
// Script de uso único — não roda automático (não é chamado pelo entrypoint
// do Docker nem pelo systemd). Rode manualmente na VPS depois do deploy:
//
//   node prisma/seed-historico-inicial.mjs
//
// É idempotente: se um Local com o mesmo nome já existir, pula ele —
// então dá pra rodar mais de uma vez sem duplicar.

import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Espelha src/lib/constants.ts — duplicado aqui porque este script roda
// com `node` puro (sem compilar TypeScript).
const PLACEHOLDER_PHOTO_URL = '/placeholder-dish.svg';
const MAX_NOTA_PEIXE = 5;
const MAX_NOTA_MOLHO = 3;
const MAX_NOTA_ACOMPANHAMENTO = 2;


export const RANKING = [
  { nome: 'Bar do Sabão', nota: 7, cidade: 'Contagem' },
  { nome: 'No fogo', nota: 6.5, cidade: 'Juatuba' },
  { nome: 'Peixe e Cia', nota: 6, cidade: 'Betim' },
  { nome: 'Steak my House', nota: 6, cidade: 'Juatuba' },
  { nome: 'Toca da Tilapia', nota: 5.5, cidade: 'Contagem' },
  { nome: 'Kayros', nota: 5.5, cidade: 'Mateus Leme' },
  { nome: '88 Bros', nota: 5.5, cidade: 'Betim' },
  { nome: 'Arena FuteBrasa', nota: 5.5, cidade: 'Mateus Leme' },
  { nome: 'Flash Burguer', nota: 4.5, cidade: 'Juatuba' },
  { nome: 'Portal Beer', nota: 4, cidade: 'Juatuba' },
];

// Distribui a nota final entre os 3 critérios proporcionalmente ao peso de
// cada um (5/3/2 de 10) — é só pra preencher a exibição por critério na
// tela do local; o valor que realmente conta pro ranking é notaFinal.
function distribuirNota(nota) {
  const peixe = Math.min(MAX_NOTA_PEIXE, Math.round((nota * MAX_NOTA_PEIXE) / 10));
  const molho = Math.min(MAX_NOTA_MOLHO, Math.round((nota * MAX_NOTA_MOLHO) / 10));
  const acompanhamento = Math.min(
    MAX_NOTA_ACOMPANHAMENTO,
    Math.round((nota * MAX_NOTA_ACOMPANHAMENTO) / 10)
  );
  return { peixe, molho, acompanhamento };
}

async function main() {
  const admin = await prisma.usuario.findFirst({ where: { papel: 'ADMIN' } });
  if (!admin) {
    console.log('Nenhum admin encontrado — rode o seed normal (SEED_ADMIN_PHONE) primeiro.');
    return;
  }

  for (const item of RANKING) {
    const jaExiste = await prisma.local.findFirst({
      where: { nome: item.nome, cidade: item.cidade },
    });
    if (jaExiste) {
      console.log(`Pulando "${item.nome}" (já existe).`);
      continue;
    }

    const local = await prisma.local.create({
      data: { nome: item.nome, cidade: item.cidade },
    });

    const sessao = await prisma.sessao.create({
      data: {
        localId: local.id,
        abertaPorId: admin.id,
        status: 'ENCERRADA',
        isHistorico: true,
        fotoUrl: PLACEHOLDER_PHOTO_URL,
        encerradaEm: new Date(),
      },
    });

    const { peixe, molho, acompanhamento } = distribuirNota(item.nota);

    await prisma.avaliacao.create({
      data: {
        sessaoId: sessao.id,
        usuarioId: admin.id,
        notaPeixe: peixe,
        notaMolho: molho,
        notaAcompanhamento: acompanhamento,
        estrelaBemServido: 3,
        estrelaAtendimento: 3,
        estrelaLimpeza: 3,
        notaFinal: item.nota,
      },
    });

    await prisma.feelingVoto.upsert({
      where: { usuarioId_localId: { usuarioId: admin.id, localId: local.id } },
      update: {},
      create: { usuarioId: admin.id, localId: local.id, posicaoPessoal: 999 },
    });

    console.log(`Criado "${item.nome}" (nota ${item.nota}).`);
  }

  console.log('Importação do ranking histórico concluída.');
}

// Só roda main() quando o arquivo é executado direto (`node
// prisma/seed-historico-inicial.mjs`) — não quando outro script importa
// RANKING daqui (ex: prisma/reassign-historico.mjs).
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  main()
    .catch((err) => {
      console.error('Falha ao importar ranking histórico:', err);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
