import { useAtomValue } from 'jotai';
import { useDisqusJsMode } from './hooks/useDisqusJsMode';
import { disqusjsModeAtom, disqusjsMessageAtom, disqusjsHasErrorAtom } from './state';
import type { DisqusJSConfig } from './types';
import { Disqus } from './components/Disqus';
import { DisqusJSThread } from './components/Disscussion';
import { DisqusJSFooter } from './components/Footer';
import { useEffect, useState } from 'react';

import styles from './styles/disqusjs.module.sass';
import { DisqusJSError } from './components/Error';

export type { DisqusJSConfig };

const DisqusJSEntry = (props: DisqusJSConfig) => {
  const disqusJsMode = useAtomValue(disqusjsModeAtom);
  useDisqusJsMode(disqusJsMode, props.shortname);

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

export const DisqusJS = (props: DisqusJSConfig) => {
  const msg = useAtomValue(disqusjsMessageAtom);
  const disqusJsHasError = useAtomValue(disqusjsHasErrorAtom);

  const [startClientSideRender, setStartClientSideRender] = useState(false);
  useEffect(() => {
    setStartClientSideRender(true);
  }, []);

  if (startClientSideRender) {
    return (
      <div className={styles.dsqjs}>
        <section id="dsqjs">
          {
            disqusJsHasError
              ? <DisqusJSError />
              : (
                <>
                  {msg && <div id="dsqjs-msg">{msg}</div>}
                  <DisqusJSEntry {...props} />
                </>
              )
          }
          <DisqusJSFooter />
        </section>
      </div>
    );
  }

  return null;
};
