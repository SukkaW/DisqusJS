import { useIsClient } from 'foxact/use-is-client';
import { ComposeContextProvider } from 'foxact/compose-context-provider';

import type { DisqusJSConfig } from './types';
import { DisqusJSFooter } from './components/Footer';
import { forwardRef, useMemo } from 'react';

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
  disqusJsModeAssetsUrlTransformer,
  ...rest
}: DisqusJSConfig & React.JSX.IntrinsicElements['div'], ref: React.ForwardedRef<HTMLDivElement>) => {
  const contexts = useMemo(() => [
    <ConfigProvider
      key="config"
      value={{
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
        disqusJsModeAssetsUrlTransformer
      }}
    />,
    <ModeProvider key="mode" />,
    <SortTypeProvider key="sortType" />,
    <HasErrorProvider key="hasError" />,
    <MessageProvider key="msg" />
  ], [admin, adminLabel, api, apikey, disqusJsModeAssetsUrlTransformer, identifier, nesting, nocomment, shortname, siteName, title, url]);

  if (useIsClient()) {
    return (
      <div ref={ref} {...rest} className={`${styles.dsqjs} ${className ?? ''}`}>
        <ComposeContextProvider contexts={contexts}>
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
