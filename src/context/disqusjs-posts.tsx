import { createContextState } from 'foxact/context-state';
import { DisqusAPI } from '../types';

const [DisqusJSPostsProvider, useDisqusJSPosts, useSetDisqusJSPosts] = createContextState<DisqusAPI.Posts[]>([]);

export { DisqusJSPostsProvider, useDisqusJSPosts, useSetDisqusJSPosts };
