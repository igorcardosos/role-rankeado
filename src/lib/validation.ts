import { z } from 'zod';
import { MAX_NOTA_PEIXE, MAX_NOTA_MOLHO, MAX_NOTA_ACOMPANHAMENTO } from '@/lib/constants';

export const loginSchema = z.object({
  telefone: z.string().trim().min(3).max(30),
});

export const localCreateSchema = z.object({
  nome: z.string().trim().min(1).max(120),
  cidade: z.string().trim().min(1).max(120),
  endereco: z.string().trim().max(500).optional().nullable(),
});

export const localUpdateSchema = localCreateSchema.partial();

const notaPeixe = z.coerce.number().int().min(0).max(MAX_NOTA_PEIXE);
const notaMolho = z.coerce.number().int().min(0).max(MAX_NOTA_MOLHO);
const notaAcompanhamento = z.coerce.number().int().min(0).max(MAX_NOTA_ACOMPANHAMENTO);
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
  telefone: z.string().trim().min(3).max(30),
  nome: z.string().trim().min(1).max(120),
  papel: z.enum(['ADMIN', 'MEMBRO']).default('MEMBRO'),
});

export const usuarioUpdateSchema = z.object({
  nome: z.string().trim().min(1).max(120).optional(),
  papel: z.enum(['ADMIN', 'MEMBRO']).optional(),
});
