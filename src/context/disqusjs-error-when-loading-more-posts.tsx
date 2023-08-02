import { createContextState } from 'foxact/context-state';

const [DisqusJSLoadingMorePostsErrorProvider, useDisqusJSLoadingMorePostsError, useSetDisqusJsLoadingMorePostsError] = createContextState(false);

export { DisqusJSLoadingMorePostsErrorProvider, useDisqusJSLoadingMorePostsError, useSetDisqusJsLoadingMorePostsError };
