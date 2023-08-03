import { createContextState } from 'foxact/context-state';
import type { DisqusJsMode } from '../types';
import { useCallback } from 'react';

const getDisqusJsModeDefaultValue = () => {
  if (typeof window !== 'undefined') {
    const value = localStorage.getItem('dsqjs_mode');
    if (value === 'dsqjs' || value === 'disqus') {
      return value;
    }
  }

  return null;
};

const [ModeProvider, useMode, useSetModeState] = createContextState<DisqusJsMode>(getDisqusJsModeDefaultValue());

const useSetMode = () => {
  const setDisqusJsMode = useSetModeState();

  return useCallback((mode: DisqusJsMode) => {
    setDisqusJsMode(mode);
    void Promise.resolve(() => {
      if (mode !== null) {
        localStorage.setItem('dsqjs_mode', mode);
      } else {
        localStorage.removeItem('dsqjs_mode');
      }
    });
  }, [setDisqusJsMode]);
};

export { ModeProvider, useMode, useSetMode };
