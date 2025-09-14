import { createContextState } from 'foxact/context-state';
import type { DisqusJsMode } from '../types';
import { useCallback } from 'react';

function getDisqusJsModeDefaultValue() {
  if (typeof window !== 'undefined') {
    const value = localStorage.getItem('dsqjs_mode');
    if (value === 'dsqjs' || value === 'disqus') {
      return value;
    }
  }

  return null;
}

const [ModeProvider, useMode, useSetModeState] = createContextState<DisqusJsMode>(getDisqusJsModeDefaultValue());

function useSetMode() {
  const setDisqusJsMode = useSetModeState();

  return useCallback((mode: DisqusJsMode) => {
    setDisqusJsMode(mode);
    void Promise.resolve().then(() => {
      if (mode === null) {
        localStorage.removeItem('dsqjs_mode');
      } else {
        localStorage.setItem('dsqjs_mode', mode);
      }
    });
  }, [setDisqusJsMode]);
}

export { ModeProvider, useMode, useSetMode };
