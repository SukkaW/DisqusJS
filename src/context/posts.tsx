import { createContextState } from 'foxact/context-state';
import type { DisqusAPI } from '../types';

const [PostsProvider, usePosts, useSetPosts] = createContextState<DisqusAPI.Posts[]>([]);

export { PostsProvider, usePosts, useSetPosts };
