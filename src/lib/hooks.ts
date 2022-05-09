import { useMemo } from 'react';
import { randomInt } from './util';

// We will try to make the used api key as stable as possible
// And if React decides to forget some memoized values, it doesn't matter anyway
export const useRandomApiKey = (apiKeys: string | string[]) => useMemo(() => {
  if (Array.isArray(apiKeys)) {
    return apiKeys[randomInt(0, apiKeys.length - 1)];
  }
  return apiKeys;
}, [apiKeys]);
