import { createContextState } from 'foxact/context-state';
import { isBrowser } from '../lib/util';
import type { DisqusJsMode } from '../types';
import { useCallback } from 'react';

const getDisqusJsModeDefaultValue = () => {
  if (isBrowser) {
    const value = localStorage.getItem('dsqjs_mode');
    if (value === 'dsqjs' || value === 'disqus') {
      return value;
    }
  }

  return null;
};

const [DisqusJsModeProvider, useDisqusJsMode, useSetDisqusJsModeState] = createContextState<DisqusJsMode>(getDisqusJsModeDefaultValue());

const useSetDisqusJsMode = () => {
  const setDisqusJsMode = useSetDisqusJsModeState();

  return useCallback((mode: DisqusJsMode) => {
    setDisqusJsMode(mode);
    Promise.resolve(() => {
      if (mode !== null) {
        localStorage.setItem('dsqjs_mode', mode);
      } else {
        localStorage.removeItem('dsqjs_mode');
      }
    });
  }, [setDisqusJsMode]);
};

export { DisqusJsModeProvider, useDisqusJsMode, useSetDisqusJsMode };
