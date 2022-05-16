import { checkDomainAccessiblity, disqusJsApiFetcher, isBrowser } from './lib/util';
import type { DisqusAPI, DisqusJsMode, DisqusJsSortType } from './types';

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
  sortType: DisqusJsSortType;
  error: boolean;
  msg: JSX.Element | string | number | null;
  thread: null | DisqusAPI.Thread;
  posts: DisqusAPI.Posts[];
  loadingPosts: boolean;
  morePostsError: boolean;
}

interface StateActions {
  setMode: (mode: DisqusJsMode) => void;
  checkMode: (shortname: string) => void;
  setSortType: (sortType: DisqusJsSortType) => void;
  setError: (error: boolean) => void;
  setMsg: (msg: JSX.Element | string | number | null) => void;
  fetchThread: (shortname: string, identifier: string, apiKeys: string, api?: string) => Promise<void>;
  fetchMorePosts: (shortname: string, identifier: string, apiKeys: string, api?: string) => Promise<void>;
  resetPosts: () => void;

  reset: () => void;
}

const initialState: State = {
  mode: getDisqusJsModeDefaultValue(),
  sortType: getDisqusJsSortTypeDefaultValue(),
  error: false,
  msg: null,
  thread: null,
  posts: [],
  loadingPosts: false,
  morePostsError: false
};

export const useStore = create<State & StateActions>((set, get) => ({
  ...initialState,

  setMode(mode: DisqusJsMode) {
    set({ mode });
    if (isBrowser && mode) {
      // Always wait for a macrotask before setting localStorage
      Promise.resolve().then(() => {
        if (mode === null) {
          localStorage.removeItem('dsqjs_mode');
        } else {
          localStorage.setItem('dsqjs_mode', mode);
        }
      });
    }
  },

  checkMode(shortname: string) {
    set({ msg: '正在检查 Disqus 能否访问...' });
    Promise.all((['disqus.com', `${shortname}.disqus.com`]).map(checkDomainAccessiblity))
      .then(() => {
        set({ mode: 'disqus' });
        localStorage.setItem('dsqjs_mode', 'disqus');
      }, () => {
        set({ mode: 'dsqjs' });
        localStorage.setItem('dsqjs_mode', 'dsqjs');
      });
  },

  setSortType(sortType: DisqusJsSortType) {
    set({ sortType });
    if (isBrowser && sortType) {
      localStorage.setItem('dsqjs_sort', sortType);
    }
  },

  setError(error: boolean) {
    set({ error });
  },

  setMsg(msg: JSX.Element | string | number | null) {
    set({ msg });
  },

  async fetchThread(shortname: string, identifier: string, apiKey: string, api = 'https://disqus.skk.moe/disqus/') {
    try {
      const thread = await disqusJsApiFetcher<DisqusAPI.Thread>(apiKey, `${api}3.0/threads/list.json?forum=${encodeURIComponent(shortname)}&thread=${encodeURIComponent(`ident:${identifier}`)}`);
      if (thread.code === 0) {
        set({ thread });
      } else {
        set({ error: true });
      }
    } catch {
      set({ error: true });
    }
  },

  resetPosts() {
    set({ posts: [], loadingPosts: false, morePostsError: false });
  },

  async fetchMorePosts(shortname: string, id: string | null, apiKey: string, api = 'https://disqus.skk.moe/disqus/') {
    set({ loadingPosts: true, morePostsError: false });
    if (!id) return;

    const posts = get().posts;
    const sortType = get().sortType;
    const lastPost = posts.at(-1);
    if (lastPost && !lastPost.cursor.hasNext) return;

    const url = posts.length === 0
      ? `${api}3.0/threads/listPostsThreaded?forum=${shortname}&thread=${id}&order=${sortType ?? 'desc'}`
      : `${api}3.0/threads/listPostsThreaded?forum=${shortname}&thread=${id}${lastPost?.cursor.next ? `&cursor=${lastPost.cursor.next}` : ''}&order=${sortType ?? 'desc'}`;

    const handleError = () => {
      if (posts.length === 0) {
        set({ error: true, loadingPosts: false });
      } else {
        set({ morePostsError: true, loadingPosts: false });
      }
    };

    try {
      const newPosts = await disqusJsApiFetcher<DisqusAPI.Posts>(apiKey, url);

      if (newPosts.code === 0) {
        set((state) => ({ posts: state.posts.concat(newPosts), loadingPosts: false }));
      } else {
        handleError();
      }
    } catch {
      handleError();
    }
  },

  reset() {
    set({ ...initialState });
  }
}));
