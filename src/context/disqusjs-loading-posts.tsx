import { createContextState } from 'foxact/context-state';

const [DisqusJSLoadingPostsProvider, useDisqusJSLoadingPosts, useSetDisqusJsLoadingPosts] = createContextState(false);

export { DisqusJSLoadingPostsProvider, useDisqusJSLoadingPosts, useSetDisqusJsLoadingPosts };
