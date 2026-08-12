'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setIsDark(next);
  }

  // Evita mismatch de hidratação: só mostra o ícone real depois de montar.
  if (isDark === null) {
    return <span className="w-8 h-8 inline-block" aria-hidden />;
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      className="w-8 h-8 flex items-center justify-center rounded-full text-lg hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
