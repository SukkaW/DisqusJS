import { useCallback, useEffect } from 'react';
import { Disqus } from './components/Disqus';
import { DisqusJSThread } from './components/Disscussion';
import { DisqusJSError } from './components/Error';

import type { DisqusJSConfig } from './types';

import { useDisqusJsMode, useSetDisqusJsMode } from './context/disqusjs-mode';
import { useDisqusJsHasError } from './context/disqusjs-error';
import { useDisqusJsMessage, useSetDisqusJsMessage } from './context/disqusjs-msg';

import { checkDomainAccessiblity } from './lib/util';

const useCheckDisqusJsMode = (shortname: string) => {
  const setMsg = useSetDisqusJsMessage();
  const setMode = useSetDisqusJsMode();

  return useCallback(() => {
    setMsg('正在检查 Disqus 能否访问...');
    Promise.all((['disqus.com', `${shortname}.disqus.com`]).map(checkDomainAccessiblity))
      .then(
        () => setMode('disqus'),
        () => setMode('dsqjs')
      );
  }, [setMode, setMsg, shortname]);
};

export const DisqusJSEntry = (props: DisqusJSConfig) => {
  const disqusJsMode = useDisqusJsMode();
  const checkDisqusJsMode = useCheckDisqusJsMode(props.shortname);

  useEffect(() => {
    if (disqusJsMode !== 'disqus' && disqusJsMode !== 'dsqjs') {
      checkDisqusJsMode();
    }
  }, [checkDisqusJsMode, disqusJsMode]);

  const disqusJsHasError = useDisqusJsHasError();
  const msg = useDisqusJsMessage();

  if (disqusJsHasError) {
    return <DisqusJSError />;
  }

  return (
    <>
      {msg && <div id="dsqjs-msg">{msg}</div>}
      {disqusJsMode === 'disqus' && <Disqus shortname={props.shortname} identifier={props.identifier} url={props.url} title={props.title} />}
      {disqusJsMode === 'dsqjs' && <DisqusJSThread {...props} />}
    </>
  );
};
