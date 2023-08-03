import { useEffect } from 'react';
import { Disqus } from './components/Disqus';
import { DisqusJSThread } from './components/Disscussion';
import { DisqusJSError } from './components/Error';

import type { DisqusJSConfig } from './types';

import { useHasError } from './context/error';
import { useMessage, useSetMessage } from './context/message';

import { checkDomainAccessiblity } from './lib/util';
import { useMode, useSetMode } from './context/mode';

export const DisqusJSEntry = (props: DisqusJSConfig) => {
  const setMsg = useSetMessage();

  const mode = useMode();
  const setMode = useSetMode();

  const { shortname } = props;

  useEffect(() => {
    let cancel = false;

    if (mode === 'disqus' || mode === 'dsqjs') {
      return;
    }

    setMsg('正在检查 Disqus 能否访问...');

    Promise.all(
      (['disqus.com', `${shortname}.disqus.com`]).map(checkDomainAccessiblity)
    ).then(() => {
      if (!cancel) {
        setMode('disqus');
      }
    }).catch(() => {
      if (!cancel) {
        setMode('dsqjs');
      }
    });

    return () => {
      cancel = true;
    };
  }, [mode, setMode, setMsg, shortname]);

  const disqusJsHasError = useHasError();
  const msg = useMessage();

  if (disqusJsHasError) {
    return <DisqusJSError />;
  }

  return (
    <>
      {msg && <div id="dsqjs-msg">{msg}</div>}
      {mode === 'disqus' && <Disqus shortname={props.shortname} identifier={props.identifier} url={props.url} title={props.title} />}
      {mode === 'dsqjs' && <DisqusJSThread {...props} />}
    </>
  );
};
