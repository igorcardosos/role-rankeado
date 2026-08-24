'use client';

import { useCallback, useRef, useState } from 'react';

/**
 * Padrão único pra proteger qualquer ação de mutação (criar, editar,
 * excluir, votar...) contra duplo clique / múltiplos cliques enquanto a
 * requisição anterior ainda está em andamento.
 *
 * A trava principal é o `ref` (síncrono, checado antes de qualquer await),
 * não o estado `loading` — um `useState` só reflete no DOM depois do próximo
 * render, então dois cliques disparados na mesma tarefa (antes do React
 * re-renderizar o botão como disabled) passariam batido só com state.
 *
 * Uso:
 *   const { loading, run } = useSubmitGuard();
 *   <button disabled={loading} onClick={() => run(async () => { ... })}>
 *     {loading ? 'Salvando…' : 'Salvar'}
 *   </button>
 */
export function useSubmitGuard() {
  const runningRef = useRef(false);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (action: () => Promise<void>) => {
    if (runningRef.current) return;
    runningRef.current = true;
    setLoading(true);
    try {
      await action();
    } finally {
      runningRef.current = false;
      setLoading(false);
    }
  }, []);

  return { loading, run };
}
