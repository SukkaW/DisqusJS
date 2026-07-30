import { useEffect } from 'foxact/use-abortable-effect';
import { Disqus } from './components/Disqus';
import { DisqusJSThread } from './components/Disscussion';
import { DisqusJSError } from './components/Error';

import { useHasError } from './context/error';

import { checkDomainAccessibility } from './lib/util';
import { useMode, useSetMode } from './context/mode';
import { useConfig } from './context/config';

export function DisqusJSEntry() {
  const mode = useMode();
  const setMode = useSetMode();

  const { shortname, identifier, url, title } = useConfig();

  useEffect(signal => {
    if (mode === 'disqus' || mode === 'dsqjs') {
      return;
    }

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
  }, [mode, setMode, shortname]);

  const disqusJsHasError = useHasError();

  if (disqusJsHasError) {
    return <DisqusJSError />;
  }

  return (
    <>
      {mode === null && <div id="dsqjs-msg">正在检查 Disqus 能否访问...</div>}
      {mode === 'disqus' && <Disqus shortname={shortname} identifier={identifier} url={url} title={title} />}
      {mode === 'dsqjs' && <DisqusJSThread />}
    </>
  );
}
