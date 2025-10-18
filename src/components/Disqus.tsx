import { memo, useEffect, useState } from 'react';
import type { DisqusConfig } from '../types';
import { DisqusJSForceDisqusJsModeButton } from './Button';
import { useSetMessage } from '../context/message';
import { useIsomorphicLayoutEffect } from 'foxact/use-isomorphic-layout-effect';

const THREAD_ID = 'disqus_thread';
const EMBED_SCRIPT_ID = 'dsq-embed-scr';

declare global {
  interface Window {
    DISQUS?: {
      reset: (opt: {
        reload?: boolean,
        config?: () => void
      }) => void
    },
    disqus_config?: () => void,
    disqus_shortname?: string
  }
}

function loadDisqusInstance(config: DisqusConfig, onReady: () => void) {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.DISQUS && document.getElementById(EMBED_SCRIPT_ID)) {
    window.DISQUS.reset({
      reload: true,
      // eslint-disable-next-line object-shorthand -- Disqus uses this
      config: function (this: any) {
        if (config.identifier) {
          this.page.identifier = config.identifier;
        }
        if (config.url) {
          this.page.url = config.url;
        }
        if (config.title) {
          this.page.title = config.title;
        }
        this.callbacks.onReady = [
          onReady
        ];
      }
    });
  } else {
    window.disqus_config = function (this: any) {
      if (config.identifier) {
        this.page.identifier = config.identifier;
      }
      if (config.identifier) {
        this.page.url = config.identifier;
      }
      if (config.identifier) {
        this.page.title = config.identifier;
      }
      this.callbacks.onReady = [
        onReady
      ];
    };
    window.disqus_shortname = config.shortname;

    const scriptEl = document.createElement('script');
    scriptEl.id = EMBED_SCRIPT_ID;
    scriptEl.src = `https://${config.shortname}.disqus.com/embed.js`;
    scriptEl.async = true;
    document.head.appendChild(scriptEl);
  }
};

export const Disqus = memo(({
  shortname,
  identifier,
  url,
  title
}: DisqusConfig) => {
  const setMsg = useSetMessage();
  const [loaded, setLoaded] = useState(false);

  useIsomorphicLayoutEffect(() => setMsg(null));

  useEffect(() => {
    const clearDisqusInstance = () => {
      if (typeof window !== 'undefined') {
        window.disqus_config = undefined;
        const scriptEl = document.getElementById(EMBED_SCRIPT_ID);
        if (scriptEl) {
          document.head.removeChild(scriptEl);
          scriptEl.remove();
        }

        window.DISQUS?.reset({});

        try {
          delete window.DISQUS;
        } catch {
          window.DISQUS = undefined;
        }

        const containerEl = document.getElementById(THREAD_ID);
        if (containerEl) {
          while (containerEl.hasChildNodes()) {
            if (containerEl.firstChild) {
              containerEl.firstChild.remove();
            }
          }
        }

        document.querySelectorAll(
          'link[href*="disquscdn.com/next"], link[href*="disqus.com/next"], script[src*="disquscdn.com/next/embed"], script[src*="disqus.com/count-data.js"], iframe[title="Disqus"]'
        ).forEach((el) => el.remove());
      }
    };

    if (window.disqus_shortname !== shortname) {
      clearDisqusInstance();
    }

    loadDisqusInstance({
      shortname,
      identifier,
      url,
      title
    }, () => setLoaded(true));

    return clearDisqusInstance;
  }, [shortname, identifier, url, title]);

  return (
    <>
      <div id={THREAD_ID}>
        评论完整模式加载中... 如果长时间无法加载，请针对 disq.us | disquscdn.com | disqus.com 启用代理，或切换至
        {' '}
        <DisqusJSForceDisqusJsModeButton>评论基础模式</DisqusJSForceDisqusJsModeButton>
      </div>
      {!loaded && (
        <div id="dsqjs-msg">
          评论完整模式加载中... 如果长时间无法加载，请针对 disq.us | disquscdn.com | disqus.com 启用代理，或切换至
          {' '}
          <DisqusJSForceDisqusJsModeButton>评论基础模式</DisqusJSForceDisqusJsModeButton>
        </div>
      )}
    </>
  );
});

if (process.env.NODE_ENV !== 'production') {
  Disqus.displayName = 'Disqus';
}
