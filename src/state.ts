import { isBrowser } from './lib/util';
import { atom } from 'jotai';
import { DisqusJsMode, DisqusJsSortType } from './types';

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

export const disqusjsHasErrorAtom = atom(false);
export const disqusjsModeAtom = atom<DisqusJsMode>(getDisqusJsModeDefaultValue());
export const disqusjsSortTypeAtom = atom<DisqusJsSortType>(getDisqusJsSortTypeDefaultValue());

export const disqusjsMessageAtom = atom<JSX.Element | string | number | null>(null);
