import { z } from 'zod';
import { MAX_NOTA_PEIXE, MAX_NOTA_MOLHO, MAX_NOTA_ACOMPANHAMENTO } from '@/lib/constants';
import { normalizeTelefone } from '@/lib/phone';

// Aceita o telefone formatado ou só dígitos — sempre normaliza pra dígitos
// puros antes de guardar/comparar, então o mesmo número bate independente
// de como foi digitado.
const telefone = z
  .string()
  .trim()
  .transform(normalizeTelefone)
  .refine((v) => v.length >= 8 && v.length <= 15, 'Telefone inválido.');

export const loginSchema = z.object({
  telefone,
});

export const localCreateSchema = z.object({
  nome: z.string().trim().min(1).max(120),
  cidade: z.string().trim().min(1).max(120),
  endereco: z.string().trim().max(500).optional().nullable(),
});

export const localUpdateSchema = localCreateSchema.partial();

// Aceita meios-pontos (0.5, 1, 1.5...) — nada além disso (sem 0.1, 0.2 etc).
function notaComMeioPonto(max: number) {
  return z.coerce
    .number()
    .min(0)
    .max(max)
    .refine((v) => Number.isInteger(v * 2), 'A nota só pode variar de 0.5 em 0.5.');
}

const notaPeixe = notaComMeioPonto(MAX_NOTA_PEIXE);
const notaMolho = notaComMeioPonto(MAX_NOTA_MOLHO);
const notaAcompanhamento = notaComMeioPonto(MAX_NOTA_ACOMPANHAMENTO);
const estrela1a5 = z.coerce.number().int().min(1).max(5);

export const avaliacaoInputSchema = z.object({
  notaPeixe,
  notaMolho,
  notaAcompanhamento,
  estrelaBemServido: estrela1a5,
  estrelaAtendimento: estrela1a5,
  estrelaLimpeza: estrela1a5,
});

export const historicoAvaliacaoSchema = avaliacaoInputSchema.extend({
  usuarioId: z.coerce.number().int().positive(),
});

export const historicoSessaoSchema = z
  .object({
    localId: z.coerce.number().int().positive().optional(),
    novoLocal: localCreateSchema.optional(),
    data: z.string().trim().min(1),
    avaliacoes: z.array(historicoAvaliacaoSchema).min(1),
  })
  .refine((data) => data.localId || data.novoLocal, {
    message: 'Informe localId ou novoLocal.',
  });

export const feelingUpdateSchema = z.object({
  items: z
    .array(
      z.object({
        localId: z.coerce.number().int().positive(),
        posicaoPessoal: z.coerce.number().int().min(1),
      })
    )
    .min(1),
});

export const usuarioCreateSchema = z.object({
  telefone,
  nome: z.string().trim().min(1).max(120),
  papel: z.enum(['ADMIN', 'MEMBRO']).default('MEMBRO'),
});

export const usuarioUpdateSchema = z.object({
  nome: z.string().trim().min(1).max(120).optional(),
  papel: z.enum(['ADMIN', 'MEMBRO']).optional(),
});

export const appConfigUpdateSchema = z.object({
  nomeApp: z.string().trim().min(1).max(60),
});
