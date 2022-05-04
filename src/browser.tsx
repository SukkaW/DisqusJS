import { DisqusJSConfig } from './types';
import { DisqusJS as DisqusJSComponent } from './';

import { render } from 'preact';

// eslint-disable-next-line no-nested-ternary
const getElementFromConfig = (el?: string | Element) => (el
  ? (typeof el === 'string' ? document.querySelector(el) : el)
  : document.getElementById('disqus_thread'));

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
      render(null, this.container);
    }
  }
}
