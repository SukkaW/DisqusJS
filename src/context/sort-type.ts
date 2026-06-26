import { createContextState } from 'foxact/context-state';
import type { DisqusJsSortType } from '../types';

function getDisqusJsSortTypeDefaultValue() {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line sukka/react-prefer-foxact-persistent -- intentional
    const value = localStorage.getItem('dsqjs_sort');
    if (value === 'popular' || value === 'asc' || value === 'desc') {
      return value;
    }
  }

  return null;
}

const [SortTypeProvider, useSortType, useSetSortType] = createContextState<DisqusJsSortType>(getDisqusJsSortTypeDefaultValue());

export { SortTypeProvider, useSortType, useSetSortType };
