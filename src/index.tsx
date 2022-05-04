import { useStore } from './state';
import type { DisqusJSConfig } from './types';
import { Disqus } from './components/Disqus';
import { DisqusJSThread } from './components/Disscussion';
import { DisqusJSFooter } from './components/Footer';
import { forwardRef, useEffect, useState } from 'react';
import type React from 'react';

import styles from './styles/disqusjs.module.sass';
import { DisqusJSError } from './components/Error';

export type { DisqusJSConfig };

const DisqusJSEntry = (props: DisqusJSConfig) => {
  const disqusJsMode = useStore(state => state.mode);
  const checkDisqusJsMode = useStore(state => state.checkMode);

  useEffect(() => {
    if (disqusJsMode !== 'disqus' && disqusJsMode !== 'dsqjs') {
      checkDisqusJsMode(props.shortname);
    }
  }, [checkDisqusJsMode, disqusJsMode, props.shortname]);

  if (disqusJsMode === 'disqus') {
    return (
      <Disqus shortname={props.shortname} identifier={props.identifier} url={props.url} title={props.title} />
    );
  }
  if (disqusJsMode === 'dsqjs') {
    return (
      <DisqusJSThread {...props} />
    );
  }
  return null;
};

export const DisqusJS = forwardRef((props: DisqusJSConfig & JSX.IntrinsicElements['div'], ref: React.ForwardedRef<HTMLDivElement>) => {
  const msg = useStore(state => state.msg);
  const disqusJsHasError = useStore(state => state.error);

  const {
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
  } = props;

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

  const [startClientSideRender, setStartClientSideRender] = useState(false);
  useEffect(() => {
    setStartClientSideRender(true);
  }, []);

  if (startClientSideRender) {
    return (
      <div ref={ref} {...rest} className={`${styles.dsqjs} ${className ?? ''}`}>
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
      </div>
    );
  }

  return null;
});
