import { createContext, useContext } from 'react';
import type { DisqusJSConfig } from '../types';

const ConfigContext = createContext<DisqusJSConfig | null>(null);

export const ConfigProvider = ConfigContext.Provider;

export function useConfig() {
  const config = useContext(ConfigContext);
  if (!config) {
    throw new TypeError('<ConfigProvider /> is missing');
  }
  return config;
}
