import { useIsClient } from 'foxact/use-is-client';

import type { DisqusJSConfig } from './types';
import { DisqusJSFooter } from './components/Footer';
import { forwardRef } from 'react';

import styles from './styles/disqusjs.module.sass';

import { DisqusJSEntry } from './entry';

import { ModeProvider } from './context/mode';
import { SortTypeProvider } from './context/sort-type';
import { HasErrorProvider } from './context/error';
import { MessageProvider } from './context/message';

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
        <ModeProvider>
          <SortTypeProvider>
            <HasErrorProvider>
              <MessageProvider>
                <section id="dsqjs">
                  <DisqusJSEntry {...disqusJsConfig} />
                  <DisqusJSFooter />
                </section>
              </MessageProvider>
            </HasErrorProvider>
          </SortTypeProvider>
        </ModeProvider>
      </div>
    );
  }

  return null;
});
