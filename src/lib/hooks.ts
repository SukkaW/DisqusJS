import { useMemo } from 'react';
import { pickOne } from 'foxts/pick-random';

// We will try to make the used api key as stable as possible
// And if React decides to forget some memoized values, it doesn't matter anyway
export function useRandomApiKey(apiKeys: string | string[]) {
  return useMemo(() => {
    if (Array.isArray(apiKeys)) {
      return pickOne(apiKeys);
    }
    return apiKeys;
  }, [apiKeys]);
}
