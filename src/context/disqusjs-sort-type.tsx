import { createContextState } from 'foxact/context-state';
import { isBrowser } from '../lib/util';
import type { DisqusJsSortType } from '../types';

const getDisqusJsSortTypeDefaultValue = () => {
  if (isBrowser) {
    const value = localStorage.getItem('dsqjs_sort');
    if (value === 'popular' || value === 'asc' || value === 'desc') {
      return value;
    }
  }

  return null;
};

const [DisqusJsSortTypeProvider, useDisqusJsSortType, useSetDisqusJsSortType] = createContextState<DisqusJsSortType>(getDisqusJsSortTypeDefaultValue());

export { DisqusJsSortTypeProvider, useDisqusJsSortType, useSetDisqusJsSortType };
