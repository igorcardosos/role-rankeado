// Dados fictícios só para validar visualmente o app com vários locais.
// NÃO roda automaticamente no Docker/produção — só via:
//   node prisma/seed-demo.mjs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MEMBROS_DEMO = [
  { telefone: '11911111111', nome: 'Bruno' },
  { telefone: '11922222222', nome: 'Carla' },
  { telefone: '11933333333', nome: 'Diego' },
  { telefone: '11944444444', nome: 'Erica' },
];

const BARES_DEMO = [
  { nome: 'Peixaria do Zé', cidade: 'São Paulo', endereco: 'Rua das Palmeiras, 120', foto: '/demo/bar-1.svg' },
  { nome: 'Boteco da Maré', cidade: 'Santos', endereco: 'Av. Beira Mar, 450', foto: '/demo/bar-2.svg' },
  { nome: 'Quintal do Peixe', cidade: 'São Paulo', endereco: 'Rua Augusta, 980', foto: '/demo/bar-3.svg' },
  { nome: 'Cantinho da Ribeira', cidade: 'Guarujá', endereco: 'Praia da Enseada, 30', foto: '/demo/bar-4.svg' },
  { nome: 'Point da Tilápia', cidade: 'São Paulo', endereco: 'Rua Oscar Freire, 200', foto: '/demo/bar-5.svg' },
  { nome: 'Deck do Rio', cidade: 'Ilhabela', endereco: 'Av. Beira Mar, 10', foto: '/demo/bar-6.svg' },
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

async function main() {
  const admin = await prisma.usuario.findFirst({ where: { papel: 'ADMIN' } });
  if (!admin) {
    console.log('Nenhum admin encontrado — rode o seed normal (SEED_ADMIN_PHONE) primeiro.');
    return;
  }

  const membros = [];
  for (const m of MEMBROS_DEMO) {
    const usuario = await prisma.usuario.upsert({
      where: { telefone: m.telefone },
      update: {},
      create: { telefone: m.telefone, nome: m.nome, papel: 'MEMBRO' },
    });
    membros.push(usuario);
  }
  const avaliadores = [admin, ...membros];

  for (const bar of BARES_DEMO) {
    const jaExiste = await prisma.local.findFirst({ where: { nome: bar.nome, cidade: bar.cidade } });
    if (jaExiste) {
      console.log(`Pulando "${bar.nome}" (já existe).`);
      continue;
    }

    const local = await prisma.local.create({
      data: { nome: bar.nome, cidade: bar.cidade, endereco: bar.endereco },
    });

    const diasAtras = randInt(3, 120);
    const data = new Date(Date.now() - diasAtras * 24 * 60 * 60 * 1000);

    const sessao = await prisma.sessao.create({
      data: {
        localId: local.id,
        abertaPorId: admin.id,
        data,
        status: 'ENCERRADA',
        isHistorico: true,
        fotoUrl: bar.foto,
        encerradaEm: data,
      },
    });

    const quemAvaliou = pick(avaliadores, randInt(2, avaliadores.length));
    for (const usuario of quemAvaliou) {
      const notaPeixe = randInt(2, 5);
      const notaMolho = randInt(1, 3);
      const notaAcompanhamento = randInt(0, 2);
      const notaFinal = notaPeixe + notaMolho + notaAcompanhamento;

      await prisma.avaliacao.create({
        data: {
          sessaoId: sessao.id,
          usuarioId: usuario.id,
          notaPeixe,
          notaMolho,
          notaAcompanhamento,
          estrelaBemServido: randInt(3, 5),
          estrelaAtendimento: randInt(3, 5),
          estrelaLimpeza: randInt(2, 5),
          notaFinal,
        },
      });

      const totalVotos = await prisma.feelingVoto.count({ where: { usuarioId: usuario.id } });
      await prisma.feelingVoto.upsert({
        where: { usuarioId_localId: { usuarioId: usuario.id, localId: local.id } },
        update: {},
        create: { usuarioId: usuario.id, localId: local.id, posicaoPessoal: totalVotos + 1 },
      });
    }

    console.log(`Criado "${bar.nome}" com ${quemAvaliou.length} avaliação(ões).`);
  }

  console.log('Dados de demonstração prontos.');
}

main()
  .catch((err) => {
    console.error('Falha ao gerar dados de demonstração:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
