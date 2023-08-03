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

const [SortTypeProvider, useSortType, useSetSortType] = createContextState<DisqusJsSortType>(getDisqusJsSortTypeDefaultValue());

export { SortTypeProvider, useSortType, useSetSortType };
