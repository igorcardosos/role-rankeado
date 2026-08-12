'use client';

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

export default function StarRatingInput({ label, value, onChange }: Props) {
  return (
    <div>
      <label className="font-medium text-sm block mb-1.5">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} estrelas`}
            className="text-3xl leading-none px-0.5"
          >
            <span className={n <= value ? 'text-brand-500' : 'text-gray-300'}>★</span>
          </button>
        ))}
      </div>
    </div>
  );
}
