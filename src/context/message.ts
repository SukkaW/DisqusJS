import { createContextState } from 'foxact/context-state';

const [MessageProvider, useMessage, useSetMessage] = createContextState<React.ReactNode>(null);

export { MessageProvider, useMessage, useSetMessage };
