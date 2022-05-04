import { DisqusJSConfig } from './types';
import { DisqusJS as DisqusJSComponent } from './';

import { render } from 'preact';

// eslint-disable-next-line no-nested-ternary
const getElementFromConfig = (el?: string | Element) => (el
  ? (typeof el === 'string' ? document.querySelector(el) : el)
  : document.getElementById('disqusjs'));

export type { DisqusJSConfig };

export default class DisqusJS {
  private config: DisqusJSConfig;
  private container?: Element;

  constructor(config: DisqusJSConfig) {
    this.config = config;
  }

  render(el?: string | Element) {
    const container = getElementFromConfig(el);

    if (container) {
      this.container = container;
      render(<DisqusJSComponent {...this.config} />, container);
    }
  }

  destroy() {
    if (this.container) {
      // https://github.com/preactjs/preact/blob/40f7c6592b4ed96fe9c6615e43e3d9815e566291/compat/src/index.js#L67-L78
      render(null, this.container);
    }
  }
}
