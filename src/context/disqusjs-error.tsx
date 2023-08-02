import { createContextState } from 'foxact/context-state';

const [DisqusJsHasErrorProvider, useDisqusJsHasError, useSetDisqusJsHasError] = createContextState(false);

export { DisqusJsHasErrorProvider, useDisqusJsHasError, useSetDisqusJsHasError };
