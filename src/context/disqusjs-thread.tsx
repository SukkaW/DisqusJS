import { createContextState } from 'foxact/context-state';
import { DisqusAPI } from '../types';

const [DisqusJsThreadProvider, useDisqusJsThread, useSetDisqusJsThread] = createContextState<DisqusAPI.Thread | null>(null);

export { DisqusJsThreadProvider, useDisqusJsThread, useSetDisqusJsThread };
