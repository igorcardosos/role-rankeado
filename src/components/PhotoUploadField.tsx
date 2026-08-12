'use client';

import { useState } from 'react';

export default function PhotoUploadField({
  onChange,
}: {
  onChange: (file: File | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    onChange(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  }

  return (
    <div>
      <label className="font-medium text-sm block mb-1.5">Foto do prato *</label>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Prévia" className="w-full rounded-2xl object-cover max-h-64 mb-2" />
      ) : null}
      <label className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 py-6 text-gray-500 dark:text-gray-400 text-sm cursor-pointer active:bg-gray-50 dark:active:bg-gray-800">
        {preview ? 'Trocar foto' : 'Tirar ou escolher foto'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={handleFile}
          className="hidden"
          required
        />
      </label>
    </div>
  );
}
