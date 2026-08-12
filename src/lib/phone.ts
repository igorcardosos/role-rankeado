export function normalizeTelefone(value: string): string {
  return value.replace(/\D/g, '');
}

// Formata progressivamente: (DD) XXXX-XXXX (fixo) até 10 dígitos,
// (DD) XXXXX-XXXX (celular) a partir do 11º dígito.
export function formatTelefoneBR(value: string): string {
  const digits = normalizeTelefone(value).slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
