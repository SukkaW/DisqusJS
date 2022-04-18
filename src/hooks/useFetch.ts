import { useEffect, useRef, useState, useLayoutEffect as useOriginalLayoutEffect } from 'react';

const useLayoutEffect = typeof window !== 'undefined' ? useOriginalLayoutEffect : useEffect;
const immutableCache = new Map();

const cacheHelper = <K, V>() => ({
  g(k: K): V | undefined {
    return immutableCache.get(k);
  },
  h(k: K) {
    return immutableCache.has(k);
  },
  s(k: K, v: V) {
    immutableCache.set(k, v);
  },
  d(k: K) {
    immutableCache.delete(k);
  }
});

export const useFetch = <Data extends object>(query: string | null | undefined, fetcher: (query: string) => Promise<Data>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Data | undefined>(undefined);
  const [error, setError] = useState<any>(undefined);
  const fetcherRef = useRef(fetcher);
  const cacheRef = useRef(cacheHelper<string, Data>());
  const previousQueryRef = useRef<string | null>(null);

  useEffect(() => {
    if (query && previousQueryRef.current !== query) {
      (async () => {
        previousQueryRef.current = query;
        try {
          if (cacheRef.current.h(query)) {
            setData(() => cacheRef.current.g(query));
          } else {
            setIsLoading(true);
            const result = await fetcherRef.current(query);
            setData(() => result);
            setIsLoading(false);
            setError(undefined);
            cacheRef.current.s(query, result);
          }
        } catch (e) {
          previousQueryRef.current = null;
          setIsLoading(false);
          cacheRef.current.d(query);
          setError(e);
        }
      })();
    }
  }, [query]);

  return { isLoading, data, error };
};

export const useFetchInfinite = <Data extends object>(getQuery: (pageIndex: number, previousData: Data | undefined) => string | null | undefined, fetcher: (query: string) => Promise<Data>) => {
  const [size, setSize] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Data[] | undefined>(undefined);
  const [error, setError] = useState<any>(undefined);

  const getQueryRef = useRef(getQuery);
  const fetcherRef = useRef(fetcher);
  const cacheRef = useRef(cacheHelper<string, Data>());
  const previousDataRef = useRef<Data | undefined>(undefined);
  const previousQueryRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    fetcherRef.current = fetcher;
    getQueryRef.current = getQuery;
  });

  useEffect(() => {
    const query = getQueryRef.current(size, previousDataRef.current);
    if (query && previousQueryRef.current !== query) {
      (async () => {
        previousQueryRef.current = query;
        try {
          if (cacheRef.current.h(query)) {
            const result = cacheRef.current.g(query)!;
            setData(data => {
              if (data) {
                data[size] = result;
                return [...data];
              }
              return [result];
            });
          } else {
            setIsLoading(true);
            const result = await fetcherRef.current(query);
            setData(data => {
              if (data) {
                data[size] = result;
                return [...data];
              }
              return [result];
            });
            setIsLoading(false);
            setError(undefined);
            cacheRef.current.s(query, result);
            previousDataRef.current = result;
          }
        } catch (e) {
          previousQueryRef.current = null;
          setIsLoading(false);
          cacheRef.current.d(query);
          setError(e);
        }
      })();
    }
  }, [size]);

  return { isLoading, data, error, setSize, size };
};
