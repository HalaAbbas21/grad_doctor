import { useCallback, useEffect, useState } from "react";

interface MockLoadState {
  loading: boolean;
  error: boolean;
  reload: () => void;
}

/** Simulates network latency (400–800ms) so loading/error states are realistic (§8). */
export function useMockLoad(deps: unknown[] = []): MockLoadState {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    const ms = 400 + Math.round(Math.random() * 400);
    const id = setTimeout(() => {
      if (active) setLoading(false);
    }, ms);
    return () => {
      active = false;
      clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, ...deps]);

  return { loading, error, reload };
}
