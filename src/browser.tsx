import type { DisqusJSConfig } from './types';
import { DisqusJS as DisqusJSComponent } from './';

import { render } from 'preact';

export type { DisqusJSConfig };

// eslint-disable-next-line react-prefer-function-component/react-prefer-function-component -- not a react component
export default class DisqusJS {
  private config: DisqusJSConfig;
  private container?: Element;

  constructor(config: DisqusJSConfig) {
    this.config = config;
  }

  render(el?: string | Element) {
    let container;
    if (el) {
      if (typeof el === 'string') {
        container = document.querySelector(el);
      } else {
        container = el;
      }
    } else {
      container = document.getElementById('disqusjs');
    }

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
