import { useEffect } from 'foxact/use-abortable-effect';
import { Disqus } from './components/Disqus';
import { DisqusJSThread } from './components/Disscussion';
import { DisqusJSError } from './components/Error';

import { useHasError } from './context/error';
import { useMessage, useSetMessage } from './context/message';

import { checkDomainAccessibility } from './lib/util';
import { useMode, useSetMode } from './context/mode';
import { useConfig } from './context/config';

export function DisqusJSEntry() {
  const setMsg = useSetMessage();

  const mode = useMode();
  const setMode = useSetMode();

  const { shortname, identifier, url, title } = useConfig();

  useEffect(signal => {
    if (mode === 'disqus' || mode === 'dsqjs') {
      return;
    }

    setMsg('正在检查 Disqus 能否访问...');

    Promise.all(
      (['disqus.com', `${shortname}.disqus.com`]).map(checkDomainAccessibility)
    ).then(() => {
      if (!signal.aborted) {
        setMode('disqus');
      }
    }).catch(() => {
      if (!signal.aborted) {
        setMode('dsqjs');
      }
    });
  }, [mode, setMode, setMsg, shortname]);

  const disqusJsHasError = useHasError();
  const msg = useMessage();

  if (disqusJsHasError) {
    return <DisqusJSError />;
  }

  return (
    <>
      {msg != null && <div id="dsqjs-msg">{msg}</div>}
      {mode === 'disqus' && <Disqus shortname={shortname} identifier={identifier} url={url} title={title} />}
      {mode === 'dsqjs' && <DisqusJSThread />}
    </>
  );
}
