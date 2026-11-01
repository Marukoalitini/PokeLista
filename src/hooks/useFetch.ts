import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../utils/errorUtils';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Generic hook to handle loading, error, and data states explicitly
export function useFetch<T>(
  fetcher: () => Promise<T>,
  dependencies: unknown[] = []
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Não foi possível carregar os detalhes. Verifique sua conexão e tente novamente.'
        )
      );
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetcher();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            getErrorMessage(
              err,
              'Não foi possível carregar os detalhes. Verifique sua conexão e tente novamente.'
            )
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      isMounted = false;
    };
  }, [execute]);

  return { data, loading, error, refetch: execute };
}
