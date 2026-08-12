import { prisma } from '@/lib/prisma';
import { PLACEHOLDER_PHOTO_URL } from '@/lib/constants';

// Cada critério já entra com seu próprio teto (peixe até 5, molho até 3,
// acompanhamento até 2), então a nota final é a soma direta — máximo 10.
export function computeNotaFinal(input: {
  notaPeixe: number;
  notaMolho: number;
  notaAcompanhamento: number;
}): number {
  return input.notaPeixe + input.notaMolho + input.notaAcompanhamento;
}

export type NotaRankingRow = {
  localId: number;
  nome: string;
  cidade: string;
  fotoUrl: string;
  notaFinal: number;
  mediaPeixe: number;
  mediaMolho: number;
  mediaAcompanhamento: number;
  totalAvaliacoes: number;
};

export async function getNotaRanking(): Promise<NotaRankingRow[]> {
  const locais = await prisma.local.findMany({
    include: {
      sessoes: {
        orderBy: { data: 'desc' },
        include: { avaliacoes: true },
      },
    },
  });

  const rows: NotaRankingRow[] = [];

  for (const local of locais) {
    const avaliacoes = local.sessoes.flatMap((s) => s.avaliacoes);
    if (avaliacoes.length === 0) continue;

    const n = avaliacoes.length;
    const notaFinal = avaliacoes.reduce((sum, a) => sum + a.notaFinal, 0) / n;
    const mediaPeixe = avaliacoes.reduce((sum, a) => sum + a.notaPeixe, 0) / n;
    const mediaMolho = avaliacoes.reduce((sum, a) => sum + a.notaMolho, 0) / n;
    const mediaAcompanhamento =
      avaliacoes.reduce((sum, a) => sum + a.notaAcompanhamento, 0) / n;
    const fotoUrl = local.sessoes[0]?.fotoUrl ?? PLACEHOLDER_PHOTO_URL;

    rows.push({
      localId: local.id,
      nome: local.nome,
      cidade: local.cidade,
      fotoUrl,
      notaFinal,
      mediaPeixe,
      mediaMolho,
      mediaAcompanhamento,
      totalAvaliacoes: n,
    });
  }

  rows.sort((a, b) => b.notaFinal - a.notaFinal);
  return rows;
}

export type FeelingRankingRow = {
  localId: number;
  nome: string;
  cidade: string;
  notaFeeling: number;
  totalVotos: number;
};

export async function getFeelingRanking(): Promise<FeelingRankingRow[]> {
  const usuarios = await prisma.usuario.findMany({
    include: { feelingVotos: true },
  });

  const somaPorLocal = new Map<number, { soma: number; count: number }>();

  for (const usuario of usuarios) {
    const total = usuario.feelingVotos.length;
    if (total === 0) continue;
    for (const voto of usuario.feelingVotos) {
      const normalizada = voto.posicaoPessoal / total;
      const entry = somaPorLocal.get(voto.localId) ?? { soma: 0, count: 0 };
      entry.soma += normalizada;
      entry.count += 1;
      somaPorLocal.set(voto.localId, entry);
    }
  }

  if (somaPorLocal.size === 0) return [];

  const locais = await prisma.local.findMany({
    where: { id: { in: Array.from(somaPorLocal.keys()) } },
  });

  const rows: FeelingRankingRow[] = locais.map((local) => {
    const entry = somaPorLocal.get(local.id)!;
    return {
      localId: local.id,
      nome: local.nome,
      cidade: local.cidade,
      notaFeeling: entry.soma / entry.count,
      totalVotos: entry.count,
    };
  });

  rows.sort((a, b) => a.notaFeeling - b.notaFeeling);
  return rows;
}
