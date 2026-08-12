'use client';

import { InputHTMLAttributes } from 'react';
import { formatTelefoneBR, normalizeTelefone } from '@/lib/phone';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  value: string;
  onChange: (digits: string) => void;
};

export default function PhoneInput({ value, onChange, className, ...rest }: Props) {
  return (
    <input
      {...rest}
      type="tel"
      inputMode="tel"
      value={formatTelefoneBR(value)}
      onChange={(e) => onChange(normalizeTelefone(e.target.value).slice(0, 11))}
      className={className}
    />
  );
}
