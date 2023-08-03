import { useIsClient } from 'foxact/use-is-client';

import type { DisqusJSConfig } from './types';
import { DisqusJSFooter } from './components/Footer';
import { forwardRef } from 'react';

import styles from './styles/disqusjs.module.sass';

import { DisqusJSEntry } from './entry';
import { DisqusJSError } from './components/Error';

import { DisqusJsModeProvider } from './context/disqusjs-mode';
import { DisqusJsSortTypeProvider } from './context/disqusjs-sort-type';
import { DisqusJsHasErrorProvider, useDisqusJsHasError } from './context/disqusjs-error';
import { DisqusJsMessageProvider, useDisqusJsMessage } from './context/disqusjs-msg';
import { DisqusJSLoadingPostsProvider } from './context/disqusjs-loading-posts';
import { DisqusJSLoadingMorePostsErrorProvider } from './context/disqusjs-error-when-loading-more-posts';
import { DisqusJSPostsProvider } from './context/disqusjs-posts';
import { DisqusJsThreadProvider } from './context/disqusjs-thread';

export type { DisqusJSConfig };

export const DisqusJS = forwardRef(({
  shortname,
  siteName,
  identifier,
  url,
  title,
  api,
  apikey,
  nesting,
  nocomment,
  admin,
  adminLabel,
  className,
  ...rest
}: DisqusJSConfig & JSX.IntrinsicElements['div'], ref: React.ForwardedRef<HTMLDivElement>) => {
  const msg = useDisqusJsMessage();
  const disqusJsHasError = useDisqusJsHasError();

  const disqusJsConfig: DisqusJSConfig = {
    shortname,
    siteName,
    identifier,
    url,
    title,
    api,
    apikey,
    nesting,
    nocomment,
    admin,
    adminLabel
  };

  const startClientSideRender = useIsClient();

  if (startClientSideRender) {
    return (
      <div ref={ref} {...rest} className={`${styles.dsqjs} ${className ?? ''}`}>
        <DisqusJsModeProvider>
          <DisqusJsSortTypeProvider>
            <DisqusJsHasErrorProvider>
              <DisqusJsMessageProvider>
                <DisqusJSLoadingPostsProvider>
                  <DisqusJSLoadingMorePostsErrorProvider>
                    <DisqusJsThreadProvider>
                      <DisqusJSPostsProvider>
                        <section id="dsqjs">
                          {
                            disqusJsHasError
                              ? <DisqusJSError />
                              : (
                                <>
                                  {msg && <div id="dsqjs-msg">{msg}</div>}
                                  <DisqusJSEntry {...disqusJsConfig} />
                                </>
                              )
                          }
                          <DisqusJSFooter />
                        </section>
                      </DisqusJSPostsProvider>
                    </DisqusJsThreadProvider>
                  </DisqusJSLoadingMorePostsErrorProvider>
                </DisqusJSLoadingPostsProvider>
              </DisqusJsMessageProvider>
            </DisqusJsHasErrorProvider>
          </DisqusJsSortTypeProvider>
        </DisqusJsModeProvider>
      </div>
    );
  }

  return null;
});
