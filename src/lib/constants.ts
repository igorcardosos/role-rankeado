export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'role_rankeado_session';
export const SESSION_MAX_AGE_DAYS = Number(process.env.SESSION_MAX_AGE_DAYS || 180);
export const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_DAYS * 24 * 60 * 60;

export const UPLOADS_DIR = process.env.UPLOADS_DIR || './data/uploads';
export const MAX_UPLOAD_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB || 8);
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

export const PLACEHOLDER_PHOTO_URL = '/placeholder-dish.svg';

// nota_final = notaPeixe + notaMolho + notaAcompanhamento (soma direta, máximo 10).
// Cada critério já tem seu próprio teto, equivalente ao peso: o peixe pesa mais
// (até 5), o molho até 3, o acompanhamento até 2.
export const MAX_NOTA_PEIXE = 5;
export const MAX_NOTA_MOLHO = 3;
export const MAX_NOTA_ACOMPANHAMENTO = 2;
