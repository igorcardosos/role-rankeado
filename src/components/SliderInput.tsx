'use client';

type Props = {
  label: string;
  icon: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
};

export default function SliderInput({ label, icon, value, max, onChange }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="font-medium text-sm flex items-center gap-1.5">
          <span aria-hidden>{icon}</span>
          {label}
        </label>
        <span className="text-lg font-bold text-brand-600 tabular-nums">
          {value}
          <span className="text-xs text-gray-400">/{max}</span>
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
