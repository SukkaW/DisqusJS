import { useIsClient } from 'foxact/use-is-client';
import { ComposeContextProvider } from 'foxact/compose-context-provider';

import type { DisqusJSConfig } from './types';
import { DisqusJSFooter } from './components/Footer';
import { forwardRef } from 'react';

import styles from './styles/disqusjs.module.sass';

import { DisqusJSEntry } from './entry';

import { ModeProvider } from './context/mode';
import { SortTypeProvider } from './context/sort-type';
import { HasErrorProvider } from './context/error';
import { MessageProvider } from './context/message';
import { ConfigProvider } from './context/config';

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
  if (useIsClient()) {
    return (
      <div ref={ref} {...rest} className={`${styles.dsqjs} ${className ?? ''}`}>
        <ComposeContextProvider contexts={[
          <ConfigProvider value={{
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
          }} />,
          <ModeProvider />,
          <SortTypeProvider />,
          <HasErrorProvider />,
          <MessageProvider />
        ]}>
          <section id="dsqjs">
            <DisqusJSEntry />
            <DisqusJSFooter />
          </section>
        </ComposeContextProvider>
      </div>
    );
  }

  return null;
});
