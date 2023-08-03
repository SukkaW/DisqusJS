import { createContextState } from 'foxact/context-state';

const [HasErrorProvider, useHasError, useSetHasError] = createContextState(false);

export { HasErrorProvider, useHasError, useSetHasError };
