// Reatribui pra outro usuário as avaliações criadas pelo
// seed-historico-inicial.mjs (identificadas pelos nomes de local daquela
// lista — não mexe em nenhuma outra sessão histórica).
//
// Uso (na VPS, dentro da pasta do projeto):
//   node prisma/reassign-historico.mjs <telefone>
//
// Ex: node prisma/reassign-historico.mjs "(31) 98534-7640"
//
// Idempotente: rodar de novo com o mesmo telefone não faz nada nas que já
// foram reatribuídas.

import { PrismaClient } from '@prisma/client';
import { RANKING } from './seed-historico-inicial.mjs';

const prisma = new PrismaClient();

function normalizeTelefone(v) {
  return v.replace(/\D/g, '');
}

async function main() {
  const telefoneArg = process.argv[2];
  if (!telefoneArg) {
    console.log('Uso: node prisma/reassign-historico.mjs <telefone>');
    process.exitCode = 1;
    return;
  }
  const telefone = normalizeTelefone(telefoneArg);

  const novoUsuario = await prisma.usuario.findUnique({ where: { telefone } });
  if (!novoUsuario) {
    console.log(`Nenhum usuário com telefone "${telefone}". Cadastre essa pessoa no painel admin primeiro.`);
    process.exitCode = 1;
    return;
  }

  const nomesLocais = RANKING.map((r) => r.nome);

  const avaliacoes = await prisma.avaliacao.findMany({
    where: {
      sessao: { isHistorico: true, local: { nome: { in: nomesLocais } } },
    },
    include: { sessao: { include: { local: true } } },
  });

  if (avaliacoes.length === 0) {
    console.log('Nenhuma avaliação do ranking histórico encontrada — rode o seed-historico-inicial.mjs primeiro.');
    return;
  }

  for (const avaliacao of avaliacoes) {
    const localId = avaliacao.sessao.localId;
    const usuarioAntigoId = avaliacao.usuarioId;

    if (usuarioAntigoId === novoUsuario.id) {
      console.log(`"${avaliacao.sessao.local.nome}" já está com ${novoUsuario.nome}.`);
      continue;
    }

    await prisma.$transaction(async (tx) => {
      await tx.avaliacao.update({
        where: { id: avaliacao.id },
        data: { usuarioId: novoUsuario.id },
      });

      // Se essa era a única avaliação do usuário antigo nesse local, o
      // FeelingVoto dele fica órfão (regra: só ranqueia local avaliado).
      const aindaTemAvaliacao = await tx.avaliacao.findFirst({
        where: { usuarioId: usuarioAntigoId, sessao: { localId } },
      });
      if (!aindaTemAvaliacao) {
        await tx.feelingVoto.deleteMany({ where: { usuarioId: usuarioAntigoId, localId } });
      }

      // Garante que o novo dono tem um voto Feeling pra esse local
      // (acrescenta no fim da lista pessoal dele, se ainda não tiver).
      const jaTemVoto = await tx.feelingVoto.findUnique({
        where: { usuarioId_localId: { usuarioId: novoUsuario.id, localId } },
      });
      if (!jaTemVoto) {
        const totalVotos = await tx.feelingVoto.count({ where: { usuarioId: novoUsuario.id } });
        await tx.feelingVoto.create({
          data: { usuarioId: novoUsuario.id, localId, posicaoPessoal: totalVotos + 1 },
        });
      }
    });

    console.log(`"${avaliacao.sessao.local.nome}" reatribuído pra ${novoUsuario.nome}.`);
  }

  console.log('Concluído.');
}

main()
  .catch((err) => {
    console.error('Falha ao reatribuir avaliações:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
