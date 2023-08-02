import { createContextState } from 'foxact/context-state';

const [DisqusJsMessageProvider, useDisqusJsMessage, useSetDisqusJsMessage] = createContextState<React.ReactNode>(null);

export { DisqusJsMessageProvider, useDisqusJsMessage, useSetDisqusJsMessage };
