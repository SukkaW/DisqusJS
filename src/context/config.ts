import { createContext, useContext } from 'react';
import type { DisqusJSConfig } from '../types';
import { nullthrow } from 'foxact/nullthrow';

const ConfigContext = createContext<DisqusJSConfig | null>(null);

export const ConfigProvider = ConfigContext.Provider;

export function useConfig() {
  return nullthrow(useContext(ConfigContext), '<ConfigProvider /> is missing');
}
