import { isBrowser } from './lib/util';
import { DisqusJsMode, DisqusJsSortType } from './types';

import create from 'zustand';

const getDisqusJsModeDefaultValue = () => {
  if (isBrowser) {
    const value = localStorage.getItem('dsqjs_mode');
    if (value === 'dsqjs' || value === 'disqus') {
      return value;
    }
  }

  return null;
};

const getDisqusJsSortTypeDefaultValue = () => {
  if (isBrowser) {
    const value = localStorage.getItem('dsqjs_sort');
    if (value === 'popular' || value === 'asc' || value === 'desc') {
      return value;
    }
  }

  return null;
};

interface State {
  mode: DisqusJsMode;
  setMode: (mode: DisqusJsMode) => void;
  sortType: DisqusJsSortType;
  setSortType: (sortType: DisqusJsSortType) => void;
  error: boolean;
  setError: (error: boolean) => void;
  msg: JSX.Element | string | number | null;
  setMsg: (msg: JSX.Element | string | number | null) => void;
}

export const useStore = create<State>(set => ({
  mode: getDisqusJsModeDefaultValue(),
  setMode: (mode: DisqusJsMode) => {
    set({ mode });
    if (isBrowser && mode) {
      localStorage.setItem('dsqjs_mode', mode);
    }
  },
  sortType: getDisqusJsSortTypeDefaultValue(),
  setSortType: (sortType: DisqusJsSortType) => {
    set({ sortType });
    if (isBrowser && sortType) {
      localStorage.setItem('dsqjs_sort', sortType);
    }
  },
  error: false,
  setError: (error: boolean) => {
    set({ error });
  },
  msg: null,
  setMsg: (msg: JSX.Element | string | number | null) => {
    set({ msg });
  }
}));
